import logging

from rest_framework import status, views
from rest_framework.response import Response

from fhir.resources import construct_fhir_element
from fhirstore import NotFoundError

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

        analyzer = Analyzer()
        analysis = analyzer.analyze(data["mapping"])

        extractor = Extractor()
        rows = extractor.extract(analysis, data["primary_key_values"])

        documents = []
        errors = []
        transformer = Transformer()
        for row in rows:
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
            {"rows": rows, "instances": documents, "errors": errors},
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
