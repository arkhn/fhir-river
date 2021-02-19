import logging
from typing import List
from uuid import UUID, uuid5

from dotty_dict import dotty
from loader.load.utils import get_resource_id

logger = logging.getLogger(__name__)


class ReferenceBinder:
    def resolve_references(self, unresolved_fhir_object, reference_paths: List[List[str]]):
        fhir_object = dotty(unresolved_fhir_object)
        resource_id = get_resource_id(unresolved_fhir_object)

        # iterate over the instance's references and try to resolve them
        for reference_path in reference_paths:
            logger.debug(
                {
                    "message": f"Trying to resolve reference for resource {fhir_object['id']} "
                    f"at {'[*]'.join(reference_path)}",
                    "resource_id": resource_id,
                },
            )
            try:
                self.bind_existing_reference(fhir_object, reference_path)
            except KeyError as e:
                logger.warning(f"{reference_path} does not exist in resource {fhir_object['id']}: {e}")

        return fhir_object.to_dict()

    def bind_existing_reference(self, fhir_object, reference_path: List[str]):
        resource_id = get_resource_id(fhir_object)
        object_id = fhir_object["id"]

        def bind(ref):
            # extract the type and itentifier of the reference
            reference_type = ref["type"]
            identifier = ref["identifier"]

            # add the "literal reference"
            # (https://www.hl7.org/fhir/references-definitions.html#Reference.reference)
            logger.debug(
                {"message": f"reference to {reference_type} {identifier} resolved", "resource_id": resource_id},
            )
            try:
                ref["reference"] = self.identifier_to_reference(identifier, reference_type)
            except (ValueError, KeyError) as e:
                logger.warning(
                    f"incomplete identifier on reference of type "
                    f"{reference_type} at path {ref} of resource {object_id}: {e}"
                )

        def rec_bind_existing_reference(fhir_object, reference_path: List[str], sub_path=""):
            if reference_path:
                # We need to go down the document to find the reference.
                # reference_path is a list of string so that at the end of each element,
                # we have an array in the fhir document. For instance, if reference_path
                # is ["item", "answer.valueReference"], the fhir doc will look like
                # { item: [ { answer: { valueReference: ... } } ] }.
                # We want to traverse all the elements of each array that could have
                # a reference at a leaf.
                sub_fhir_object = fhir_object[reference_path[0]]
                sub_path = f"{sub_path}.{reference_path[0]}" if sub_path else reference_path[0]
                if isinstance(sub_fhir_object, list):
                    for ind, sub_fhir_el in enumerate(sub_fhir_object):
                        rec_bind_existing_reference(sub_fhir_el, reference_path[1:], f"{sub_path}.{ind}")
                else:
                    rec_bind_existing_reference(sub_fhir_object, reference_path[1:], sub_path)
            else:
                # We have isolated the reference so we can now bind it.
                # If it's an array, we want to perform the binding for all the
                # elements.
                if isinstance(fhir_object, list):
                    for ind, sub_fhir_el in enumerate(fhir_object):
                        bind(sub_fhir_el)
                else:
                    bind(fhir_object)

        rec_bind_existing_reference(fhir_object, reference_path)

    @staticmethod
    def identifier_to_reference(identifier, reference_type) -> str:
        system_prefix = "http://terminology.arkhn.org/"
        system: str = identifier.get("system")
        value: str = str(identifier.get("value"))
        if not system.startswith(system_prefix):
            raise ValueError
        namespace = UUID(system[len(system_prefix) :])
        resource_id = str(uuid5(namespace, value))
        return f"{reference_type}/{resource_id}"
