import re
import json
import base64
from collections import defaultdict
from typing import DefaultDict
from dotty_dict import dotty

from arkhn_monitoring import Timer

from loader.src.config.service_logger import logger
from loader.src.load.utils import get_resource_id
from loader.src.cache import redis


# dotty-dict does not handle brackets indices,
# it uses dots instead (a.0.b instead of a[0].b)
def dotty_paths(paths):
    for path in paths:
        yield re.sub(r"\[(\d+)\]", r".\1", path)


class ReferenceBinder:
    def __init__(self, fhirstore):
        self.fhirstore = fhirstore

        # In Redis, we have sets identified with keys defined as a stringified
        # json array:
        # "fhir_type_target:value:system"
        #
        # A Redis set is a list. Here a list of stringified json arrays
        # [
        #     "[ [fhir_type_source, path, isArray], fhir_id1 ]",
        #     "[ [fhir_type_source, path, isArray], fhir_id2 ]",
        #     ...
        # ]
        # eg: A Redis set "[Practitioner, [1234, system]]" contains
        # [
        #     "[ [Patient, generalPractitioner, True], fhir-pract-id1 ]",
        #     ...
        # ]
        self.cache = redis.conn()

    @Timer("time_resolve_references", "time spent resolving references")
    def resolve_references(self, unresolved_fhir_object, reference_paths):
        fhir_object = dotty(unresolved_fhir_object)
        resource_id = get_resource_id(unresolved_fhir_object)

        # iterate over the instance's references and try to resolve them
        for reference_path in dotty_paths(reference_paths):
            logger.debug(
                f"Trying to resolve reference for resource {fhir_object['id']} "
                f"at {reference_path}",
                extra={"resource_id": resource_id},
            )
            try:
                bound_ref = self.bind_existing_reference(fhir_object, reference_path)
                fhir_object[reference_path] = bound_ref
            except Exception as e:
                logger.warning(
                    "Error while binding reference for instance "
                    f"{fhir_object} at path {reference_path}: {e}",
                    extra={"resource_id": resource_id},
                )

        if "identifier" in fhir_object:
            self.resolve_pending_references(fhir_object)

        return fhir_object.to_dict()

    @Timer("time_bind_existing_reference", "time spent resolving the documents's references")
    def bind_existing_reference(self, fhir_object, reference_path):
        reference_attribute = fhir_object[reference_path]
        resource_id = get_resource_id(fhir_object)

        def bind(ref, is_array=False):
            # extract the type and itentifier of the reference
            reference_type = ref["type"]
            identifier = ref["identifier"]
            # search the referenced resource in the database
            referenced_resource = self.fhirstore.db[reference_type].find_one(
                self.partial_identifier(identifier),
                ["id"]
            )
            if referenced_resource:
                # if found, add the ID as the "literal reference"
                # (https://www.hl7.org/fhir/references-definitions.html#Reference.reference)
                logger.debug(
                    f"reference to {reference_type} {identifier} resolved",
                    extra={"resource_id": resource_id},
                )
                ref["reference"] = f"{reference_type}/{referenced_resource['id']}"
            else:
                logger.debug(
                    f"caching reference to {reference_type} {identifier} at {reference_path}",
                    extra={"resource_id": resource_id},
                )
                target_ref = self.identifier_to_key(reference_type, identifier)
                source_ref = (fhir_object["resourceType"], reference_path, is_array)
                self.cache.sadd(target_ref, json.dumps((source_ref, fhir_object["id"])))
            return ref

        # If we have a list of references, we want to bind all of them.
        # Thus, we loop on all the items in reference_attribute.
        if isinstance(reference_attribute, list):
            return [bind(ref, is_array=True) for ref in reference_attribute]
        else:
            return bind(reference_attribute)

    @Timer("time_resolve_pending_references", "time spent resolving pending references")
    def resolve_pending_references(self, fhir_object):
        for identifier in fhir_object["identifier"]:
            target_ref = self.identifier_to_key(fhir_object["resourceType"], identifier)
            pending_refs = self.load_cached_references(target_ref)
            for (source_type, reference_path, is_array), refs in pending_refs.items():
                update_predicate = self.build_update_predicate(
                    reference_path,
                    fhir_object,
                    is_array
                )
                logger.debug(
                    f"Updating resources {source_type}",
                    extra={"resource_id": get_resource_id(fhir_object)},
                )
                if is_array:
                    self.fhirstore.db[source_type].update_many(
                        {"id": {"$in": refs}},
                        update_predicate,
                        array_filters=[
                            {
                                "ref.identifier.value": identifier.get("value"),
                                "ref.identifier.system": identifier.get("system")
                            }
                        ]
                    )
                else:
                    self.fhirstore.db[source_type].update_many(
                        {"id": {"$in": refs}},
                        update_predicate
                    )
            if pending_refs:
                self.cache.delete(target_ref)

    @Timer("time_load_cached_references", "time spent loading references from redis")
    def load_cached_references(self, target_ref: str) -> DefaultDict[tuple, list]:
        """Requests cached references from Redis

        :param target_ref: "fhir_type_target:value:system"
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

    @staticmethod
    def identifier_to_key(resource_type, identifier):
        value = base64.b64encode(str(identifier.get("value")).encode())
        system = identifier.get("system")
        return f"{resource_type}:{value}:{system}"

    @staticmethod
    def partial_identifier(identifier):
        return {
            "identifier.value": identifier.get("value"),
            "identifier.system": identifier.get("system")
        }

    @staticmethod
    def build_update_predicate(reference_path, fhir_object, is_array):
        if is_array:
            target_path = f"{reference_path}.$[ref].reference"
        else:
            target_path = f"{reference_path}.reference"
        return {
            "$set": {
                target_path: f"{fhir_object['resourceType']}/{fhir_object['id']}"
            }
        }
