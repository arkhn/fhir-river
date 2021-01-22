import logging
from inspect import getdoc, getmembers, isfunction, ismodule

from rest_framework import status, views
from rest_framework.response import Response

from django.conf import settings

from fhir.resources import construct_fhir_element
from fhirstore import NotFoundError

import redis
import scripts
from common.analyzer import Analyzer
from control.api.serializers import PreviewSerializer
from extractor.extract import Extractor
from loader.load.fhirstore import get_fhirstore
from pydantic import ValidationError
from transformer.transform.transformer import Transformer

logger = logging.getLogger(__name__)


class PreviewEndpoint(views.APIView):
    def post(self, request):
        serializer = PreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        mapping_redis = redis.Redis(
            host=settings.REDIS_MAPPINGS_HOST,
            port=settings.REDIS_MAPPINGS_PORT,
            db=settings.REDIS_MAPPINGS_DB,
        )

        analyzer = Analyzer(mapping_redis)
        analysis = analyzer.load_cached_analysis(data["preview_id"], data["resource_id"])

        extractor = Extractor()
        credentials = analysis.source_credentials
        extractor.update_connection(credentials)
        df = extractor.extract(analysis, data["primary_key_values"])

        documents = []
        errors = []
        transformer = Transformer()
        for row in extractor.split_dataframe(df, analysis):
            transformed = transformer.transform_data(row, analysis)
            document = transformer.create_fhir_document(transformed, analysis)
            documents.append(document)
            resource_type = document.get("resourceType")
            try:
                construct_fhir_element(resource_type, document)
            except ValidationError as e:
                errors.extend(
                    [
                        f"{err['msg'] or 'Validation error'}: "
                        f"{e.model.get_resource_type()}.{'.'.join([str(l) for l in err['loc']])}"
                        for err in e.errors()
                    ]
                )

        return Response(
            {"instances": documents, "errors": errors},
            status=status.HTTP_200_OK,
        )


class ResourceEndpoint(views.APIView):
    def post(self, request):
        # TODO: add validation

        for resource in request.data["resources"]:
            resource_id = resource.get("resource_id")
            resource_type = resource.get("resource_type")
            logger.debug(
                {
                    "message": f"Deleting all documents of type {resource_type} for given resource",
                    "resource_id": resource_id,
                },
            )

            fhirstore = get_fhirstore()
            try:
                fhirstore.delete(resource_type, resource_id=resource_id)
            except NotFoundError:
                logger.debug(
                    {
                        "message": f"No documents for resource {resource_id} were found",
                        "resource_id": resource_id,
                    },
                )

        return Response(status=status.HTTP_200_OK)


class ScriptsEndpoint(views.APIView):
    def get(self, request):
        res = []
        for module_name, module in getmembers(scripts, ismodule):
            for script_name, script in getmembers(module, isfunction):
                doc = getdoc(script)
                res.append({"name": script_name, "description": doc, "category": module_name})
        return Response(res, status=status.HTTP_200_OK)
