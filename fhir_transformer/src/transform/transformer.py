from uuid import uuid4

from fhir_transformer.src.transform.fhir import build_fhir_object, build_metadata, clean_fhir_object
from fhir_transformer.src.transform.dataframe import (
    apply_str,
    clean_data,
    squash_rows,
    merge_attributes,
)

from fhir_transformer.src.config.logger import create_logger

logger = create_logger("transformer")


class Transformer:
    def transform_data(self, data, analysis):
        # Change values to strings
        logger.debug("Apply Map String")
        data = apply_str(data)

        # Apply cleaning scripts and concept map on data
        logger.debug("Apply Cleaning")
        data = clean_data(data, analysis.attributes, analysis.primary_key_column)
        logger.debug("1 -------")
        logger.debug(data)

        # Apply join rule to merge some lines from the same resource
        logger.debug("Apply Squash Rows")
        data = squash_rows(data, analysis.squash_rules)
        logger.debug("2 -------")
        logger.debug(data)

        # Apply merging scripts on data
        logger.debug("Apply Merging Scripts")
        data = merge_attributes(data, analysis.attributes, analysis.primary_key_column)
        logger.debug("3 -------")
        logger.debug(data)
        
        return data


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
