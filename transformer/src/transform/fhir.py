from collections import defaultdict
from datetime import datetime
import re


def recursive_defaultdict():
    return defaultdict(recursive_defaultdict)


def build_metadata(analysis):
    metadata = {}

    # add a timestamp
    metadata["lastUpdated"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")

    # add custom tags
    # TODO systems here are hardcoded from fhirstore.
    # Maybe the loader should tag the items?
    metadata["tag"] = [
        {"system": "http://terminology.arkhn.org/CodeSystem/source", "code": analysis.source_id},
        {
            "system": "http://terminology.arkhn.org/CodeSystem/resource",
            "code": analysis.resource_id,
        },
    ]

    # in case the definition is a profile, add the profile to the resource metadata
    definition = analysis.definition
    if definition["kind"] == "resource" and definition["derivation"] == "constraint":
        metadata["profile"] = [definition["url"]]

    return metadata


def build_fhir_object(row, path_attributes_map, index=None):
    """ Function that actually builds a nested object from the dataframe row and the mapping.
    Note that it can be used to build only a subpart of a fhir instance.
    """
    fhir_object = recursive_defaultdict()
    arrays_done = set()

    for path, attr in path_attributes_map.items():
        if attr.path not in row:
            # If we can't find the attribute in the row, it means that it
            # is not a leaf and we don't need to do anything.
            continue

        # Handle the list of literals case.
        # If we had a list of literals in the mapping, then handle_array_attributes
        # will try to create fhir objects with an empty path (remove_root_path removes
        # what's before the [...] included).
        if path == "":
            return row[attr.path]

        # Find if there is an index in the path
        split_path = path.split(".")
        position_ind = get_position_first_index(split_path)

        if position_ind is None:
            # If we didn't find an index in the path, then we don't worry about arrays
            val = row[attr.path]

            if isinstance(val, (tuple, list)) and len(val) == 1:
                # If we have a value with length 1, we simply extract the value and put it in
                # the fhir object
                insert_in_fhir_object(fhir_object, path, val[0])
            elif isinstance(val, (tuple, list)) and index is not None:
                # If index is not None, we met an array before. Here, val will have
                # several elements but we know which one we need
                insert_in_fhir_object(fhir_object, path, val[index])
            else:
                # Otherwise, we try to send it all to insert_in_fhir_object.
                # We could have a literal value or an iterable but in this case, this function
                # will check that all the values in the iterable are equal.
                insert_in_fhir_object(fhir_object, path, val)

        else:
            # Handle array case
            array_path = ".".join(split_path[: position_ind + 1])
            # If this path was already processed before, skip it
            if array_path in arrays_done:
                continue
            # We retrieve all the attributes that start with the array path (with index)
            attributes_in_array = {
                remove_root_path(path, position_ind + 1): attr
                for path, attr in path_attributes_map.items()
                if path.startswith(array_path)
            }
            # Build the array of sub fhir object
            array = handle_array_attributes(attributes_in_array, row)
            # Insert them a the right position
            if array:
                insert_in_fhir_object(fhir_object, remove_index(array_path), array)
            arrays_done.add(array_path)

    return fhir_object


def handle_array_attributes(attributes_in_array, row):
    # Check lengths
    # We check that all the values with more than one element that we will put in the array
    # have the same length. We could not, for instance, build an object from
    # {"adress.city": ("Paris", "NY"), "adress.country": ("France", "USA", "Spain")}
    # Note that if one value has length 1, we can "factor" it:
    # {"adress.city": ("Paris", "Lyon"), "adress.country": "France"} will give 2 elements:
    # {"adress": [{"city": "Paris", "country": "France"}, {"city": "Lyon", "country": "France"}]}
    length = 1
    for attr in attributes_in_array.values():
        val = row.get(attr.path)
        if not isinstance(val, tuple) or len(val) == 1:
            continue
        if length != 1 and len(val) != length:
            raise ValueError("mismatch in array lengths")
        length = len(val)

    # Now we can build the array
    array = []
    for index in range(length):
        element = build_fhir_object(row, attributes_in_array, index=index)
        if element is not None and element != {}:
            array.append(element)

    return array


def insert_in_fhir_object(fhir_object, path, value):
    if isinstance(value, tuple):
        # If we try to insert a tuple in the fhir object, we need to make sure that all
        # the values are identical and insert only one of them.
        # This can happen after a join on a table for which the other values are different
        # and have been squashed.
        if any([v != value[0] for v in value]):
            raise ValueError(
                "Trying to insert several different values in a non-list attribute: "
                f"{value} in {path}"
            )
        val = value[0]
    # TODO we return if value is "" because empty strings don't pass validation for some fhir
    # attributes but it would be better to return None in the cleaning scripts if we don't want to
    # add an empty string.
    elif value is None or value == "" or value == {}:
        # If value is None, we don't want to do anything so we stop here.
        return
    else:
        val = value

    # Here we iterate through the path to go down the fhir object.
    # Note that the object is a recursive defaultdict so if the key doesn't exist,
    # it will be created.
    cur_location = fhir_object
    path = path.split(".")
    for step in path[:-1]:
        cur_location = cur_location[step]

    if isinstance(val, list):
        # If are inserting a list
        if path[-1] not in cur_location:
            cur_location[path[-1]] = []
        cur_location[path[-1]].extend(val)
    else:
        # Else, we are inserting a literal
        cur_location[path[-1]] = val


def clean_fhir_object(fhir_obj):
    """ Remove duplicate list elements from fhir object
    """
    if isinstance(fhir_obj, dict):
        for key in fhir_obj:
            fhir_obj[key] = clean_fhir_object(fhir_obj[key])
        return fhir_obj

    elif isinstance(fhir_obj, list):
        to_rm = []
        for i in range(len(fhir_obj)):
            for j in range(i + 1, len(fhir_obj)):
                if fhir_obj[i] == fhir_obj[j]:
                    to_rm.append(i)
                    break
        return [el for ind, el in enumerate(fhir_obj) if ind not in to_rm]

    else:
        return fhir_obj


def get_position_first_index(path):
    # Find first step which has an index
    for i, step in enumerate(path):
        if re.search(r"\[\d+\]$", step):
            return i


def remove_index(path):
    return re.sub(r"\[\d+\]$", "", path)


def remove_root_path(path, index_end_root):
    split_path = path.split(".")[index_end_root:]
    return ".".join(split_path)
