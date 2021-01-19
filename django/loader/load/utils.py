def get_resource_id(fhir_instance):
    """
    Get the resource id stored in the meta field of a fhir document
    """
    try:
        return fhir_instance["meta"]["tag"][1]["code"]
    except (KeyError, IndexError):
        return None
