import logging

from rest_framework import status, views
from rest_framework.response import Response
from pydantic import ValidationError

from fhir.resources import construct_fhir_element

from common.analyzer import Analyzer
from extractor.extract import Extractor
from transformer.transform.transformer import Transformer

from preview.api.serializers import PreviewSerializer

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
