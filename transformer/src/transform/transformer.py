from uuid import uuid4

from transformer.src.transform.fhir import build_fhir_object
from transformer.src.transform.fhir import build_metadata
from transformer.src.transform.fhir import clean_fhir_object
from transformer.src.transform.dataframe import cast_types
from transformer.src.transform.dataframe import clean_data
from transformer.src.transform.dataframe import squash_rows
from transformer.src.transform.dataframe import merge_by_attributes

from transformer.src.config.logger import get_logger

from monitoring.metrics import Timer, FAST_FN_BUCKETS

logger = get_logger()


class Transformer:

    # TODO refine buckets if needed
    @Timer(
        "time_transformer_transform",
        "time to perform transform_data method of Transformer",
        buckets=FAST_FN_BUCKETS,
    )
    def transform_data(self, data, analysis):
        # Get primary key value for logs
        try:
            primary_key = data[analysis.primary_key_column.dataframe_column_name()][0]
        except KeyError as e:
            logger.error(f"Trying to access column not present in dataframe: {e}")

        # Change values to strings
        logger.debug("Apply Map String")
        data = cast_types(data, analysis.attributes)

        # Apply cleaning scripts and concept map on data
        logger.debug("Apply Cleaning")
        data = clean_data(data, analysis.attributes, primary_key)

        # Apply join rule to merge some lines from the same resource
        logger.debug("Apply Squash Rows")
        data = squash_rows(data, analysis.squash_rules)

        # Apply merging scripts on data
        logger.debug("Apply Merging Scripts")
        data = merge_by_attributes(data, analysis.attributes, primary_key)

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
