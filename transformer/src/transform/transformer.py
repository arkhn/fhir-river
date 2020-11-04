from uuid import uuid4

from arkhn_monitoring import Timer
from arkhn_monitoring.metrics import FAST_FN_BUCKETS

from transformer.src.config.service_logger import logger
from transformer.src.transform.dataframe import clean_data
from transformer.src.transform.dataframe import squash_rows
from transformer.src.transform.dataframe import merge_by_attributes
from transformer.src.transform.fhir import build_fhir_object
from transformer.src.transform.fhir import build_metadata
from transformer.src.transform.fhir import clean_fhir_object


class Transformer:

    @Timer(
        "time_transformer_transform_data",
        "time to perform transform_data method of Transformer",
        buckets=FAST_FN_BUCKETS,
    )
    def transform_data(self, data, analysis):
        # Get primary key value for logs
        try:
            primary_key = data[analysis.primary_key_column.dataframe_column_name()][0]
        except KeyError as e:
            logger.error(
                f"Trying to access column not present in dataframe: {e}",
                extra={"resource_id": analysis.resource_id},
            )

        logging_extras = {"resource_id": analysis.resource_id, "primary_key_value": primary_key}

        # Apply cleaning scripts and concept map on data
        logger.debug(f"Apply cleaning to {data}", extra=logging_extras)
        data = clean_data(data, analysis.attributes, primary_key)

        # Apply join rule to merge some lines from the same resource
        logger.debug(f"Apply squash rows to {data}", extra=logging_extras)
        data = squash_rows(data, analysis.squash_rules)

        # Apply merging scripts on data
        logger.debug(f"Apply merging scripts to {data}", extra=logging_extras)
        data = merge_by_attributes(data, analysis.attributes, primary_key)

        logger.debug(f"Transformed data: {data}", extra=logging_extras)
        return data

    @Timer(
        "time_create_fhir_document",
        "time to perform create_fhir_document method of Transformer",
        buckets=FAST_FN_BUCKETS,
    )
    def create_fhir_document(self, data, analysis):
        """ Function used to create a single FHIR instance.
        """
        # Modify the data structure so that it is easier to use
        path_attributes_map = {attr.path: attr for attr in analysis.attributes}

        # Build path value map
        fhir_object = build_fhir_object(data, path_attributes_map)

        # Identify the fhir object
        fhir_object["id"] = str(uuid4())
        fhir_object["resourceType"] = analysis.definition["type"]
        fhir_object["meta"] = build_metadata(analysis)

        # Remove duplicates in fhir object
        fhir_object = clean_fhir_object(fhir_object)

        return fhir_object
