import re
from collections import defaultdict
from datetime import datetime

from river.common.analyzer.attribute import Attribute

ARKHN_SOURCE_CODE_SYSTEM = "http://terminology.arkhn.org/CodeSystem/source"
ARKHN_RESOURCE_CODE_SYSTEM = "http://terminology.arkhn.org/CodeSystem/resource"


def recursive_defaultdict():
    return defaultdict(recursive_defaultdict)


def recursive_defaultdict_to_dict(rec_default_dict):
    if isinstance(rec_default_dict, defaultdict):
        rec_default_dict = {k: recursive_defaultdict_to_dict(v) for k, v in rec_default_dict.items()}
    return rec_default_dict


def build_metadata(analysis):
    metadata = {}

    # add a timestamp
    metadata["lastUpdated"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")

    # add custom tags
    metadata["tag"] = [
        {"system": ARKHN_SOURCE_CODE_SYSTEM, "code": analysis.source_id},
        {"system": ARKHN_RESOURCE_CODE_SYSTEM, "code": analysis.resource_id},
    ]

    # in case the definition is a profile, add the profile to the resource metadata
    definition = analysis.definition
    if definition.get("kind") == "resource" and definition.get("derivation") == "constraint":
        metadata["profile"] = [definition["url"]]

    return metadata


def build_fhir_object(row, path_attributes_map):
    """Function that actually builds a nested object from the dataframe row and the
    mapping. Note that it can be used to build only a subpart of a fhir instance.
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
            val = row[attr.path]
            if any(v != val[0] for v in val[1:]):
                raise ValueError("can't build non-list attribute from list")
            return val[0]

        # Find if there is an index in the path
        split_path = path.split(".")
        position_ind = get_position_first_index(split_path)

        if position_ind is None:
            # If we didn't find an index in the path, then we don't worry about arrays
            val = row[attr.path]

            # Filter out None values that can be here because of joins
            val = [v for v in val if v is not None]

            if len(val) == 0:
                continue
            elif any(v != val[0] for v in val[1:]):
                raise ValueError("can't build non-list attribute from list")
            # If index is not None, we met an array before. Here, val will have
            # several elements but we know which one we need
            insert_in_fhir_object(fhir_object, path, data_value=val[0])

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
                insert_in_fhir_object(fhir_object, remove_index(array_path), sub_fhir_object=array)
            arrays_done.add(array_path)

    return recursive_defaultdict_to_dict(fhir_object)


def handle_array_attributes(attributes_in_array, row):
    # Check lengths
    # We check that all the values with more than one element that we will put in the
    # array have the same length. We could not, for instance, build an object from
    # {"adress.city": ("Paris", "NY"), "adress.country": ("France", "USA", "Spain")}
    # Note that if one value has length 1, we can "develop" it:
    # {
    #    "adress.city" : ["Paris", "Lyon"],
    #    "adress.country" : "France"
    # }
    # will give 2 elements:
    # {
    #    "adress" : [
    #       {
    #          "city" : "Paris",
    #          "country" : "France"
    #       },
    #       {
    #          "city" : "Lyon",
    #          "country" : "France"
    #       }
    #    ]
    # }
    max_df_col_length = 1
    for attr in attributes_in_array.values():
        val = row.get(attr.path)
        if not val or len(val) == 1:
            continue
        if max_df_col_length not in (1, len(val)):
            raise ValueError("mismatch in array lengths")
        max_df_col_length = len(val)

    # Build a dict with the same structure as attributes_in_array but containing only
    # attributes that are in a nested array
    attributes_in_nested_arrays = {path: attr for path, attr in attributes_in_array.items() if has_index(path)}

    array = []
    if attributes_in_nested_arrays and all(
        path in attributes_in_nested_arrays or has_zero_or_one_value(attr, row)
        for path, attr in attributes_in_array.items()
    ):
        # If we have a nested array and all values outside of it
        # come from the primary table or are 1:1 joins
        element = build_fhir_object(row, attributes_in_array)
        if element is not None and element != {}:
            array.append(element)

    else:
        for index in range(max_df_col_length):
            indexed_row = {k: get_element_in_array(v, index) for k, v in row.items()}
            # If we have a nested array and some values outside of it come from
            # a joined table or if we don't have a nested array,
            # we want to expand the outside array
            element = build_fhir_object(indexed_row, attributes_in_array)
            if element is not None and element != {}:
                array.append(element)

    return array


def insert_in_fhir_object(fhir_object, path, data_value=None, sub_fhir_object=None):
    if sub_fhir_object:
        val = sub_fhir_object
    elif isinstance(data_value, list):
        # If we try to insert a list in the fhir object, we need to make sure that all
        # the values are identical and insert only one of them.
        # This can happen after a join on a table for which the other values are
        # different and have been squashed.
        if any([v != data_value[0] for v in data_value]):
            raise ValueError(
                f"trying to insert several different values in a non-list attribute: {data_value} in {path}"
            )
        val = data_value[0]
    else:
        val = data_value

    if val is None or val == "" or val == {}:
        # If value is None, we don't want to do anything so we stop here.
        # We return if value is "" because empty strings don't pass validation for
        # some fhir attributes but it would be better to return None in the
        # cleaning scripts if we don't want to add an empty string.
        return

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


def has_index(path):
    return re.search(r"\[\d+\]", path)


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


def get_element_in_array(array, index):
    return [array[index if len(array) > 1 else 0]]


def has_zero_or_one_value(attribute: Attribute, row):
    # Helper function to check if the attribute has no data
    # or if it comes from the primary table or is a 1:1 join
    return attribute.path not in row or len(row[attribute.path]) == 1
