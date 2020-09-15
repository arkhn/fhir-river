import re
import json
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


def partial_identifier(identifier):
    (
        value,
        system,
        identifier_type_code,
        identifier_type_system,
    ) = ReferenceBinder.extract_key_tuple(identifier)
    if value:
        return {"identifier.value": value, "identifier.system": system}
    else:
        return {
            "identifier.type.coding.0.code": identifier_type_code,
            "identifier.type.coding.0.system": identifier_type_system,
        }


def build_find_predicate(refs, reference_path, identifier, isArray):
    res = {"id": {"$in": refs}}
    if isArray:
        res[reference_path] = {"$elemMatch": partial_identifier(identifier)}
    else:
        for identifier_path, identifier_value in partial_identifier(identifier).items():
            res[f"{reference_path}.{identifier_path}"] = identifier_value
    return res


# handle updating reference arrays:
# we keep the indices in the path (eg: "identifier.0.assigner.reference")
# but if fhir_object[reference_path] is an array, we use the '$' feature of mongo
# in order to update the right element of the array.
# https://docs.mongodb.com/manual/reference/operator/update/positional/#update-documents-in-an-array
# FIXME: won't work if multiple elements of the array need to be updated (see
# https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/#identifier).
def build_update_predicate(reference_path, fhir_object, isArray):
    if isArray:
        target_path = f"{reference_path}.$.reference"
    else:
        target_path = f"{reference_path}.reference"

    return {"$set": {target_path: f"{fhir_object['resourceType']}/{fhir_object['id']}"}}


class ReferenceBinder:
    def __init__(self, fhirstore):
        self.fhirstore = fhirstore

        # In Redis, we have sets identified with keys defined as a stringified
        # json array:
        # "[fhir_type_target, [value, system, code, code_system]]"
        #
        # A Redis set is a list. Here a list of stringified json arrays
        # [
        #     "[ [fhir_type_source, path, isArray], fhir_id1 ]",
        #     "[ [fhir_type_source, path, isArray], fhir_id2 ]",
        #     ...
        # ]
        # eg: A Redis set "[Practitioner, [1234, system]]" contains
        # [
        #     "[ [Patient, generalPractitioner, True], fhir-pract-id ]",
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

        def bind(ref, isArray=False):
            # extract the type and itentifier of the reference
            reference_type = ref["type"]
            identifier = ref["identifier"]
            try:
                identifier_tuple = self.extract_key_tuple(identifier)
            except Exception as e:
                logger.error(e)
                return ref

            # search the referenced resource in the database
            referenced_resource = self.fhirstore.db[reference_type].find_one(
                partial_identifier(identifier), ["id"],
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

                # otherwise, cache in Redis the reference to resolve it later
                target_ref = (reference_type, identifier_tuple)
                source_ref = (fhir_object["resourceType"], reference_path, isArray)
                self.cache.sadd(
                    json.dumps(target_ref),
                    json.dumps((source_ref, fhir_object["id"]))
                )
            return ref

        # If we have a list of references, we want to bind all of them.
        # Thus, we loop on all the items in reference_attribute.
        if isinstance(reference_attribute, list):
            return [bind(ref, isArray=True) for ref in reference_attribute]
        else:
            return bind(reference_attribute)

    @Timer("time_resolve_pending_references", "time spent resolving pending references")
    def resolve_pending_references(self, fhir_object):
        for identifier in fhir_object["identifier"]:
            try:
                identifier_tuple = self.extract_key_tuple(identifier)
            except Exception as e:
                logger.error(e)
                continue
            target_ref = json.dumps((fhir_object["resourceType"], identifier_tuple))
            pending_refs = self.load_cached_references(target_ref)
            for (source_type, reference_path, is_array), refs in pending_refs.items():
                find_predicate = build_find_predicate(refs, reference_path, identifier, is_array)
                update_predicate = build_update_predicate(reference_path, fhir_object, is_array)
                logger.debug(
                    f"Updating resource {source_type}: {find_predicate} {update_predicate}",
                    extra={"resource_id": get_resource_id(fhir_object)},
                )
                self.fhirstore.db[source_type].update_many(find_predicate, update_predicate)
            if pending_refs:
                self.cache.delete(target_ref)

    @staticmethod
    def extract_key_tuple(identifier):
        """ Build a tuple that contains the essential information from an Identifier.
        This tuple serves as a map key.
        """
        value = identifier.get("value")
        system = identifier.get("system")
        identifier_type_coding = identifier["type"]["coding"][0] if "type" in identifier else {}
        identifier_type_system = identifier_type_coding.get("system")
        identifier_type_code = identifier_type_coding.get("code")

        if not (bool(value and system) ^ bool(identifier_type_system and identifier_type_code)):
            raise Exception(
                f"invalid identifier: {identifier} identifier.value and identifier.system "
                "or identifier.type are required and mutually exclusive"
            )

        return value, system, identifier_type_code, identifier_type_system

    def load_cached_references(self, target_ref: str) -> DefaultDict[tuple, list]:
        """
            load_cached_references requests cached references from Redis. The SMEMBERS
            command gets the set target_ref
            "[fhir_type_target, [value, system, code, code_system]]"
            and returns a list
            [
                "[ [fhir_type_source, path, isArray], fhir_id1 ]",
                "[ [fhir_type_source, path, isArray], fhir_id2 ]",
                ...
            ]

            This list is formatted as a dict which is then returned
            {
                (fhir_type_source, path, isArray): [fhir_id1, fhir_id2],
                ...
            }
        """
        references_set = self.cache.smembers(target_ref)
        pending_refs = defaultdict(list)
        for element in references_set:
            (source_ref, ref) = json.loads(element)
            pending_refs[tuple(source_ref)].append(ref)
        return pending_refs
