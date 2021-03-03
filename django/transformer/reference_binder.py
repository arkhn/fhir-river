import logging
from typing import List

from dotty_dict import dotty
from loader.load.utils import get_resource_id
from transformer.errors import IncompleteIdentifierError
from transformer.transform.transformer import compute_fhir_object_id

logger = logging.getLogger(__name__)
UUID_LENGTH = 36


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
                logger.warning(
                    {
                        "message": f"{reference_path} does not exist in resource {fhir_object['id']}:" f"{e}",
                        "resource_id": resource_id,
                    }
                )

        return fhir_object.to_dict()

    def bind_existing_reference(self, fhir_object, reference_path: List[str]):
        resource_id = get_resource_id(fhir_object)
        object_id = fhir_object["id"]

        def bind(ref):
            # extract the type and itentifier of the reference
            if not (reference_type := ref.get("type")):
                logger.debug(
                    {
                        "message": f"reference at path {ref} has no type",
                        "resource_id": resource_id,
                    }
                )
                return
            if not (identifier := ref.get("identifier")):
                logger.debug(
                    {
                        "message": f"reference at path {ref} has no identifier",
                        "resource_id": resource_id,
                    }
                )
                return

            # add the "literal reference"
            # (https://www.hl7.org/fhir/references-definitions.html#Reference.reference)
            try:
                ref["reference"] = self.identifier_to_reference(identifier, reference_type)
                logger.debug(
                    {
                        "message": f"reference {ref['reference']} of resource {object_id} resolved",
                        "resource_id": resource_id,
                    },
                )
            except IncompleteIdentifierError as e:
                logger.warning(
                    {
                        "message": f"incomplete identifier on reference of type "
                        f"{reference_type} at path {ref} of resource {object_id}: {e}",
                        "resource_id": resource_id,
                    }
                )
            except ValueError as e:
                logger.warning(
                    {
                        "message": f"no valid uuid in identifier on reference of type "
                        f"{reference_type} at path {ref} of resource {object_id}: {e}",
                        "resource_id": resource_id,
                    }
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
    def identifier_to_reference(identifier, reference_type: str) -> str:
        """Converts a logical reference to a literal reference

        :param identifier: logical reference of type Identifier containing two keys:
        system and value.
        The system is an url formatted as http://terminology.arkhn.org/{UUIDv4}.
        The UUIDv4 is the id of the mapping of the referenced resource.
        The value is the source database id of the referenced resource.
        :param reference_type:
        :return: a literal reference formatted as ResourceType/ResourceId
        """
        if not (system := identifier.get("system")):
            raise IncompleteIdentifierError
        if not (value := identifier.get("value")):
            raise IncompleteIdentifierError
        mapping_id = system[-UUID_LENGTH:]
        resource_id = compute_fhir_object_id(mapping_id, value)
        return f"{reference_type}/{resource_id}"
