from collections import defaultdict
from dotty_dict import dotty

from loader.src.config.logger import create_logger

logger = create_logger("reference_binder")


class ReferenceBinder:
    def __init__(self, fhirstore):
        self.fhirstore = fhirstore

        # cache is a dict of form
        # {
        #   (fhir_type_target, value, system): {(fhir_type_source, path): [fhir_id1, ...]},
        #   (fhir_type_target, value, system): {(fhir_type_source, path): [fhir_id]},
        #   ...
        # }
        # eg:
        # {
        #   (Practitioner, 1234, system): {(Patient, generalPractitioner): [fhir-pract-id]},
        #   ...
        # }

        self.cache = defaultdict(lambda: defaultdict(list))

    def resolve_references(self, unresolved_fhir_object, reference_paths):
        fhir_object = dotty(unresolved_fhir_object)

        # iterate over the instance's references and try to resolve them
        for reference_path in reference_paths:
            logger.debug(
                f"Trying to resolve reference for resource {fhir_object['id']}"
                f"at {reference_path}"
            )
            try:
                bound_ref = self.bind_existing_reference(fhir_object, reference_path)
                fhir_object[reference_path] = bound_ref
            except Exception as e:
                logger.warning(
                    "Error while binding reference for instance "
                    f"{fhir_object} at path {reference_path}: {e}"
                )

        if fhir_object.get("identifier") and len(fhir_object["identifier"]) > 0:
            self.resolve_pending_references(fhir_object)

        return fhir_object.to_dict()

    def bind_existing_reference(self, fhir_object, reference_path):
        # FIXME: dotty-dict does not handle brackets indices,
        # it uses dots instead (a.0.b instead of a[0].b)
        reference_attribute = fhir_object[reference_path]

        # If we have a list of references, we want to bind all of them.
        # Thus, we loop on all the items in sub_fhir_object.
        if not isinstance(reference_attribute, list):
            reference_attribute = [reference_attribute]

        for ref in reference_attribute:
            # extract the type and itentifier of the reference
            reference_type = ref["type"]
            identifier = ref["identifier"]
            if "value" not in identifier or "system" not in identifier:
                logger.error(
                    f"invalid reference: {ref}. identifier.value and identifier.system are required"
                )
                continue

            # search the referenced resource in the database
            referenced_resource = self.fhirstore.db[reference_type].find_one(
                {"identifier": {"value": identifier["value"], " system": identifier["system"]}},
                ["id"],
            )
            if referenced_resource:
                # if found, add the ID as the "literal reference"
                # (https://www.hl7.org/fhir/references-definitions.html#Reference.reference)
                logger.info(f"reference to {reference_type} {identifier['value']} resolved")
                ref["reference"] = f"{reference_type}/{referenced_resource['id']}"
            else:
                logger.info(
                    f"caching reference to {reference_type} "
                    f"{identifier['value']} at {reference_path}"
                )

                # otherwise, cache the reference to resolve it later
                target_ref = (reference_type, self.extract_key_tuple(identifier))
                source_ref = (fhir_object["resourceType"], reference_path)
                self.cache[target_ref][source_ref].append(fhir_object["id"])

        return reference_attribute

    def resolve_pending_references(self, fhir_object):
        for identifier in fhir_object["identifier"]:
            if "value" not in identifier or "system" not in identifier:
                logger.error(
                    f"invalid identifier: {identifier}. "
                    "identifier.value and identifier.system are required"
                )
                continue
            target_ref = (fhir_object["resourceType"], self.extract_key_tuple(identifier))
            pending_refs = self.cache.get(target_ref, {})
            for (source_type, reference_path), refs in pending_refs.items():
                find_predicate = {
                    "id": {"$in": refs},
                    f"{reference_path}.identifier.value": identifier["value"],
                    f"{reference_path}.identifier.system": identifier["system"],
                }
                # FIXME: test if that work when the attribute is not an array of references
                # maybe refs array and refs as single items need to be updated differently
                update_predicate = {"$set": {f"{reference_path}.$.reference": fhir_object["id"]}}
                logger.info(
                    "Updating resource %s: %s %s", source_type, find_predicate, update_predicate
                )
                self.fhirstore.db[source_type].update_many(find_predicate, update_predicate)
            if len(pending_refs) > 0:
                del self.cache[target_ref]

    @staticmethod
    def extract_key_tuple(identifier):
        """ Build a tuple that contains the essential information from an Identifier.
        This tuple serves as a map key.
        """
        value = identifier["value"]
        # TODO system should have been automatically filled if needed
        system = identifier.get("system")
        identifier_type_coding = identifier["type"]["coding"][0] if "type" in identifier else {}
        identifier_type_system = identifier_type_coding.get("system")
        identifier_type_code = identifier_type_coding.get("code")
        return (value, system, identifier_type_system, identifier_type_code)
