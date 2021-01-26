import json
import logging
from collections import defaultdict
from typing import DefaultDict, List

from arkhn_monitoring import Timer
from dotty_dict import dotty
from loader.cache import redis
from loader.load.utils import get_resource_id

logger = logging.getLogger(__name__)


class ReferenceBinder:
    def __init__(self, fhirstore):
        self.fhirstore = fhirstore

        # In Redis, we have sets identified with keys defined as a stringified
        # json array:
        # "fhir_type_target:[value, system]"
        #
        # A Redis set is a list. Here a list of stringified json arrays
        # [
        #     "[ [fhir_type_source, path, isArray], fhir_id1 ]",
        #     "[ [fhir_type_source, path, isArray], fhir_id2 ]",
        #     ...
        # ]
        # eg: A Redis set "Practitioner:[1234, system]" contains
        # [
        #     "[ [Patient, generalPractitioner, True], fhir-pract-id1 ]",
        #     ...
        # ]
        self.cache = redis.conn()

    @Timer("time_resolve_references", "time spent resolving references")
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
        if "identifier" in fhir_object:
            self.resolve_pending_references(fhir_object)

        return fhir_object.to_dict()

    @Timer("time_bind_existing_reference", "time spent resolving the document's references")
    def bind_existing_reference(self, fhir_object, reference_path: List[str]):
        resource_id = get_resource_id(fhir_object)

        def bind(ref, path, is_array=False):
            # extract the type and itentifier of the reference
            reference_type = ref["type"]
            identifier = ref["identifier"]
            # search the referenced resource in the database
            try:
                _identifier = self.partial_identifier(identifier)
            except (ValueError, KeyError) as e:
                logger.warning(
                    f"incomplete identifier on reference of type "
                    f"{reference_type} at path {ref} of resource {fhir_object['id']}: {e}"
                )
                return

            referenced_resource = self.fhirstore.db[reference_type].find_one(_identifier, ["id"])
            if referenced_resource:
                # if found, add the ID as the "literal reference"
                # (https://www.hl7.org/fhir/references-definitions.html#Reference.reference)
                logger.debug(
                    {"message": f"reference to {reference_type} {identifier} resolved", "resource_id": resource_id},
                )
                ref["reference"] = f"{reference_type}/{referenced_resource['id']}"
            else:
                logger.debug(
                    {
                        "message": f"caching reference to {reference_type} {identifier} at {reference_path}",
                        "resource_id": resource_id,
                    },
                )
                target_ref = self.identifier_to_key(reference_type, identifier)
                source_ref = (fhir_object["resourceType"], path, is_array)
                self.cache.sadd(target_ref, json.dumps((source_ref, fhir_object["id"])))

        def rec_bind_existing_reference(fhir_object, reference_path, sub_path=""):
            sub_fhir_object = fhir_object[reference_path[0]]
            if sub_path:
                sub_path = f"{sub_path}."
            if len(reference_path) == 1:
                # If we have a list of references, we want to bind all of them.
                # Thus, we loop on all the items in reference_attribute.
                if isinstance(sub_fhir_object, list):
                    return [bind(ref, f"{sub_path}{reference_path[0]}", is_array=True) for ref in sub_fhir_object]
                else:
                    return bind(sub_fhir_object, f"{sub_path}{reference_path[0]}")
            else:
                for ind, sub_fhir_el in enumerate(sub_fhir_object):
                    rec_bind_existing_reference(
                        sub_fhir_el, reference_path[1:], f"{sub_path}{reference_path[0]}.{ind}"
                    )

        rec_bind_existing_reference(fhir_object, reference_path)

    @Timer("time_resolve_pending_references", "time spent resolving pending references")
    def resolve_pending_references(self, fhir_object):
        # Identifiers can have cardinality 0..* (as in Patient),
        # or 0..1 (as in QuestionaireResponse)
        identifiers = (
            fhir_object["identifier"] if isinstance(fhir_object["identifier"], list) else [fhir_object["identifier"]]
        )
        for identifier in identifiers:
            try:
                target_ref = self.identifier_to_key(fhir_object["resourceType"], identifier)
            except (KeyError, ValueError) as e:
                logger.warning(f"incomplete identifier on resource {fhir_object['id']}: {e}")
                continue
            pending_refs = self.load_cached_references(target_ref)
            for (source_type, reference_path, is_array), refs in pending_refs.items():
                logger.debug(
                    {
                        "message": f"Updating {source_type} resources {', '.join(refs)} on reference {reference_path}",
                        "resource_id": get_resource_id(fhir_object),
                    },
                )
                self.fhirstore.db[source_type].update_many(
                    self.unresolved_resources_filter(reference_path, identifier, refs, is_array),
                    self.reference_update(reference_path, fhir_object, is_array),
                )
            if pending_refs:
                self.cache.delete(target_ref)

    @Timer("time_load_cached_references", "time spent loading references from redis")
    def load_cached_references(self, target_ref: str) -> DefaultDict[tuple, list]:
        """Requests cached references from Redis

        :param target_ref: "fhir_type_target:[value, system]"
        :type target_ref: str
        The SMEMBERS command gets the set target_ref and returns a list
        [
            "[ [fhir_type_source, path, isArray], fhir_id1 ]",
            "[ [fhir_type_source, path, isArray], fhir_id2 ]",
            ...
        ]
        This list is formatted as a defaultdict which is then returned
        :return pending_refs: {
            (fhir_type_source, path, isArray): [fhir_id1, fhir_id2],
            ...
        }
        :rtype: DefaultDict[tuple, list]
        """

        references_set = self.cache.smembers(target_ref)
        pending_refs = defaultdict(list)
        for element in references_set:
            (source_ref, ref) = json.loads(element)
            pending_refs[tuple(source_ref)].append(ref)
        return pending_refs

    def unresolved_resources_filter(self, reference_path, identifier, refs, is_array):
        query = {"id": {"$in": refs}}
        if is_array:
            query[reference_path] = {"$elemMatch": self.partial_identifier(identifier)}
        return query

    @staticmethod
    def reference_update(reference_path, fhir_object, is_array):
        if is_array:
            target_path = f"{reference_path}.$.reference"
        else:
            target_path = f"{reference_path}.reference"
        return {"$set": {target_path: f"{fhir_object['resourceType']}/{fhir_object['id']}"}}

    @staticmethod
    def identifier_to_key(resource_type, identifier):
        value = identifier["value"]
        system = identifier["system"]
        if not value or not system:
            raise ValueError
        # Default separators include whitespaces
        key = json.dumps((value, system), separators=(",", ":"))
        return f"{resource_type}:{key}"

    @staticmethod
    def partial_identifier(identifier):
        _id = {
            "identifier.value": identifier["value"],
            "identifier.system": identifier["system"],
        }
        if not identifier["value"] or not identifier["system"]:
            raise ValueError
        return _id
