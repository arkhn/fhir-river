from uuid import uuid4

from fhir_transformer.src.transform.fhir import build_fhir_object, build_metadata, clean_fhir_object


class Transformer:
    def create_fhir_document(self, row, analysis):
        """ Function used to create a single FHIR instance.
        """
        # Modify the data structure so that it is easier to use
        path_attributes_map = {attr[0]: attr for attr in analysis["attributes"]}

        # Build path value map
        fhir_object = build_fhir_object(row, path_attributes_map)

        # Identify the fhir object
        fhir_object["id"] = str(uuid4())
        fhir_object["resourceType"] = analysis["definition"]["type"]
        fhir_object["meta"] = build_metadata(analysis)

        # Remove duplicates in fhir object
        fhir_object = clean_fhir_object(fhir_object)

        return fhir_object
