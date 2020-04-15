from uuid import uuid4

from fhir_transformer.src.transform.fhir import build_fhir_object, build_metadata, clean_fhir_object
from fhir_transformer.src.transform.dataframe import clean_dataframe, squash_rows, merge_dataframe

from fhir_transformer.src.config.logger import create_logger

logger = create_logger("transformer")


class Transformer:
    def transform_dataframe(self, df, analysis):
        logger.debug("Apply Map")
        df = df.applymap(lambda value: str(value) if value is not None else None)

        # Apply cleaning scripts and concept map on df
        logger.debug("Apply Cleaning")
        df = clean_dataframe(df, analysis.attributes, analysis.primary_key_column)

        # TODO can we simplify/optimize this now that we know that we'll only get one row?
        # Apply join rule to merge some lines from the same resource
        logger.debug("Apply Squash Rows")
        df = squash_rows(df, analysis.squash_rules)

        # Apply merging scripts on df
        logger.debug("Apply Merging Scripts")
        df = merge_dataframe(df, analysis.attributes, analysis.primary_key_column)

        return df

    def create_fhir_document(self, row, analysis):
        """ Function used to create a single FHIR instance.
        """
        # Modify the data structure so that it is easier to use
        path_attributes_map = {attr.path: attr for attr in analysis.attributes}

        # Build path value map
        fhir_object = build_fhir_object(row, path_attributes_map)

        # Identify the fhir object
        fhir_object["id"] = str(uuid4())
        fhir_object["resourceType"] = analysis.definition["type"]
        fhir_object["meta"] = build_metadata(analysis)

        # Remove duplicates in fhir object
        fhir_object = clean_fhir_object(fhir_object)

        return fhir_object
