import json
import logging

from rest_framework import status, viewsets
from rest_framework.response import Response

from fhir.resources import construct_fhir_element

from common.analyzer import Analyzer
from common.database_connection.db_connection import DBConnection
from common.kafka.producer import CustomJSONEncoder
from common.mapping.fetch_mapping import fetch_resource_mapping
from control.api.serializers import PreviewSerializer
from extractor.extract import Extractor
from pydantic import ValidationError
from transformer.transform.transformer import Transformer

logger = logging.getLogger(__name__)


class PreviewEndpoint(viewsets.ViewSet):
    def create(self, request):
        serializer = PreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        resource_id = data["resource_id"]
        primary_key_values = data["primary_key_values"]

        authorization_header = request.META.get("HTTP_AUTHORIZATION")

        resource_mapping = fetch_resource_mapping(resource_id, authorization_header)

        analyzer = Analyzer()
        analysis = analyzer.analyze(resource_mapping)

        db_connection = DBConnection(analysis.source_credentials)
        with db_connection.session_scope() as session:
            extractor = Extractor(session, db_connection.metadata)
            df = extractor.extract(analysis, primary_key_values)

            documents = []
            errors = []
            transformer = Transformer()
            for row in extractor.split_dataframe(df, analysis):
                # Encode and decode the row to mimic what happens
                # when events are serialized to pass through kafka
                row = json.JSONDecoder().decode(CustomJSONEncoder().encode(row))
                primary_key_value = row[analysis.primary_key_column.dataframe_column_name()][0]
                transformed_data = transformer.transform_data(row, analysis, primary_key_value)
                document = transformer.create_fhir_document(transformed_data, analysis, primary_key_value)
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

        return Response({"instances": documents, "errors": errors}, status=status.HTTP_200_OK)
