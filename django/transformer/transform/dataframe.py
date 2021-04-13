from collections import defaultdict
from typing import List

from common.analyzer.attribute import Attribute
from common.analyzer.condition import CONDITION_FLAG
from common.analyzer.sql_column import SqlColumn


def clean_data(data, attributes: List[Attribute], primary_key_col: SqlColumn, primary_key_value: str):
    """Apply cleaning scripts and concept maps.
    This function takes the dictionary produced by the Extractor and returns another
    one which looks like:
    {
        (attribute.path, input_group.id, col_name): [val, val, ...],
        (attribute.path, input_group.id, col_name): [val, val, ...],
        (CONDITION_FLAG, col_name): [val, val, ...],
        ...
    }
    and where all values are cleaned (with cleaning scripts and concept maps).
    """
    cleaned_data = {}
    for attribute in attributes:
        for input_group in attribute.input_groups:
            for col in input_group.columns:
                dict_col_name = col.dataframe_column_name()

                # The column name in the new intermediary dataframe
                attr_col_name = (attribute.path, input_group.id, col.col_name_with_joins())

                # cleaned_data will be modified several times
                if col.table_name() == primary_key_col.table_name():
                    # squash rows of the primary table together (~ group_by)
                    cleaned_data[attr_col_name] = [data[dict_col_name][0]]
                else:
                    cleaned_data[attr_col_name] = data[dict_col_name]

                # Apply cleaning script
                if col.cleaning_script:
                    cleaned_data[attr_col_name] = col.cleaning_script.apply(
                        cleaned_data[attr_col_name], dict_col_name, primary_key_value
                    )

                # Cast the data to the right type
                cleaned_data[attr_col_name] = [attribute.cast_type(row) for row in cleaned_data[attr_col_name]]

                # Apply concept map
                if col.concept_map:
                    cleaned_data[attr_col_name] = col.concept_map.apply(
                        cleaned_data[attr_col_name], dict_col_name, primary_key_value
                    )

            for condition in input_group.conditions:
                dict_col_name = condition.sql_column.dataframe_column_name()

                # The column name in the new intermediary dataframe
                cond_col_name = (CONDITION_FLAG, condition.sql_column.col_name_with_joins())

                # Get the original column
                cleaned_data[cond_col_name] = data[dict_col_name]

    return cleaned_data


def merge_by_attributes(data, attributes: List[Attribute], primary_key_value: str):
    """Takes as input a dict of the form
    {
        (attribute.path, input_group1.id, col_name): values,
        (attribute.path, input_group1.id, col_name): values,
        (attribute.path, input_group2.id, col_name): values,
        (CONDITION_FLAG, col_name): values,
        ...
    }
    and outputs
    {
        attribute1.path: values,
        attribute2.path: values,
        ...
    }
    where values are merged with the mergig scripts.
    """
    merged_data = defaultdict(list)
    for attribute in attributes:
        data_for_attribute = {
            key: value
            for key, value in data.items()
            if key[0] == attribute.path
            or (
                key[0] == CONDITION_FLAG
                and key[1]
                in (c.sql_column.col_name_with_joins() for g in attribute.input_groups for c in g.conditions)
            )
        }
        nb_rows_for_attribute = max(len(col) for col in data_for_attribute.values()) if data_for_attribute else 1

        for row_ind in range(nb_rows_for_attribute):
            # We process the data row by row
            row_data = {col_key: col[row_ind if len(col) > 1 else 0] for col_key, col in data.items()}

            no_group_matched = True
            for input_group in attribute.input_groups:

                if all(condition.check(row_data) for condition in input_group.conditions):
                    # cur_group_columns is a list containing all the sql inputs for the
                    # current input group
                    cur_group_columns = [value for key, value in row_data.items() if key[1] == input_group.id]

                    if not cur_group_columns:
                        # If the input group has no data in the dataframe, we check if
                        # it has any static input
                        if input_group.static_inputs:
                            if len(input_group.static_inputs) != 1:
                                raise ValueError(
                                    f"the mapping contains an attribute ({attribute.path}) "
                                    "with several static inputs (and no sql input)"
                                )
                            merged_data[attribute.path].append(input_group.static_inputs[0])
                    elif input_group.merging_script:
                        # TODO issue #148: static inputs could be before sql inputs
                        merged_data[attribute.path].append(
                            input_group.merging_script.apply(
                                cur_group_columns, input_group.static_inputs, attribute.path, primary_key_value
                            )
                        )
                    elif len(cur_group_columns) != 1:
                        raise ValueError(f"the mapping contains several unmerged columns for attribute {attribute}")
                    else:
                        merged_data[attribute.path].append(cur_group_columns[0])

                    no_group_matched = False
                    break

            if no_group_matched:
                # If no input group has all its conditions verified for the current row,
                # we fill the output dict with a None so that the leaf doesn't appear
                # in the created fhir document.
                merged_data[attribute.path].append(None)

    return merged_data
