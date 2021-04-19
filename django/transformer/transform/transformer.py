import logging
from uuid import UUID, uuid5

from arkhn_monitoring import Timer
from arkhn_monitoring.metrics import FAST_FN_BUCKETS
from transformer.transform.dataframe import clean_data, filter_with_conditions, merge_by_attributes
from transformer.transform.fhir import build_fhir_object, build_metadata

logger = logging.getLogger(__name__)


def compute_fhir_object_id(mapping_id, primary_key_value) -> str:
    """Compute a unique id of a resource instance

    :param mapping_id: UUIDv4 identifying the mapping of the resource
    :param primary_key_value: source database id of the resource instance
    :return: UUIDv5
    """
    logical_reference = UUID(mapping_id, version=4)
    return str(uuid5(logical_reference, str(primary_key_value)))


class Transformer:
    @Timer(
        "time_transformer_transform_data",
        "time to perform transform_data method of Transformer",
        buckets=FAST_FN_BUCKETS,
    )
    def transform_data(self, data, analysis, primary_key_value):
        logging_extras = {
            "resource_id": analysis.resource_id,
            "primary_key_value": primary_key_value,
        }

        # Apply cleaning scripts and concept map on data
        logger.debug({"message": f"Apply cleaning to {data}", **logging_extras})
        data = clean_data(data, analysis.attributes, analysis.primary_key_column, primary_key_value)

        # Filter with conditions
        print("++++++++++++++")
        print(data)
        logger.debug({"message": f"Filter data with conditions: {data}", **logging_extras})
        data = filter_with_conditions(data, analysis.attributes, primary_key_value)
        print("--------------")
        print(data)

        # Apply merging scripts on data
        logger.debug({"message": f"Apply merging scripts to {data}", **logging_extras})
        data = merge_by_attributes(data, analysis.attributes, primary_key_value)
        print("===============")
        print(data)

        logger.debug({"message": f"Transformed data: {data}", **logging_extras})
        return data

    @Timer(
        "time_create_fhir_document",
        "time to perform create_fhir_document method of Transformer",
        buckets=FAST_FN_BUCKETS,
    )
    def create_fhir_document(self, data, analysis, primary_key_value):
        """Function used to create a single FHIR instance."""
        # Modify the data structure so that it is easier to use
        path_attributes_map = {attr.path: attr for attr in analysis.attributes}

        # Build path value map
        fhir_object = build_fhir_object(data, path_attributes_map)

        # Identify the fhir object
        fhir_object["id"] = compute_fhir_object_id(analysis.logical_reference, primary_key_value)
        fhir_object["resourceType"] = analysis.definition["type"]
        fhir_object["meta"] = build_metadata(analysis)

        return fhir_object
