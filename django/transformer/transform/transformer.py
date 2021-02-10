import logging
from uuid import uuid4

from arkhn_monitoring import Timer
from arkhn_monitoring.metrics import FAST_FN_BUCKETS
from transformer.transform.dataframe import clean_data, merge_by_attributes
from transformer.transform.fhir import build_fhir_object, build_metadata

logger = logging.getLogger(__name__)


class Transformer:
    @Timer(
        "time_transformer_transform_data",
        "time to perform transform_data method of Transformer",
        buckets=FAST_FN_BUCKETS,
    )
    def transform_data(self, data, analysis):
        # Get primary key value for logs
        primary_key = data[analysis.primary_key_column.dataframe_column_name()][0]

        logging_extras = {
            "resource_id": analysis.resource_id,
            "primary_key_value": primary_key,
        }

        # Apply cleaning scripts and concept map on data
        logger.debug({"message": f"Apply cleaning to {data}", **logging_extras})
        data = clean_data(data, analysis.attributes, analysis.primary_key_column, primary_key)

        # Apply merging scripts on data
        logger.debug({"message": f"Apply merging scripts to {data}", **logging_extras})
        data = merge_by_attributes(data, analysis.attributes, primary_key)

        logger.debug({"message": f"Transformed data: {data}", **logging_extras})
        return data

    @Timer(
        "time_create_fhir_document",
        "time to perform create_fhir_document method of Transformer",
        buckets=FAST_FN_BUCKETS,
    )
    def create_fhir_document(self, data, analysis):
        """Function used to create a single FHIR instance."""
        # Modify the data structure so that it is easier to use
        path_attributes_map = {attr.path: attr for attr in analysis.attributes}

        # Build path value map
        fhir_object = build_fhir_object(data, path_attributes_map)

        # Identify the fhir object
        fhir_object["id"] = str(uuid4())
        fhir_object["resourceType"] = analysis.definition["type"]
        fhir_object["meta"] = build_metadata(analysis)

        return fhir_object
