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
        (attribute.path, input_group.id, (table, column)): [val, val, ...],
        (attribute.path, input_group.id, (table, column)): [val, val, ...],
        (CONDITION_FLAG, (table, column)): [val, val, ...],
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
                attr_col_name = (attribute.path, input_group.id, (col.table_name(), col.column))

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
                cond_col_name = (
                    CONDITION_FLAG,
                    (condition.sql_column.table_name(), condition.sql_column.column),
                )

                # Get the original column
                cleaned_data[cond_col_name] = data[dict_col_name]

    return cleaned_data


def merge_by_attributes(data, attributes: List[Attribute], primary_key_value: str):
    """Takes as input a dict of the form
    {
        (attribute.path, input_group1.id, (table1, column1)): values,
        (attribute.path, input_group1.id, (table2, column2)): values,
        (attribute.path, input_group2.id, (table3, column3)): values,
        (CONDITION_FLAG, (table4, column4)): values,
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
        data_for_attribute = {key: value for key, value in data.items() if key[0] == attribute.path}
        nb_rows_for_attribute = max(len(col) for col in data_for_attribute.values()) if data_for_attribute else 1

        for row_ind in range(nb_rows_for_attribute):
            row_data = {col_key: get_element_in_array(col, row_ind) for col_key, col in data.items()}

            for input_group in attribute.input_groups:

                if all(condition.check(row_data) for condition in input_group.conditions):
                    cur_group_columns = [value for key, value in row_data.items() if key[1] == input_group.id]

                    if not cur_group_columns:
                        if input_group.static_inputs:
                            # If attribute is static, use static input
                            # Otherwise, attribute is not a leaf or has no inputs
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

                else:
                    merged_data[attribute.path].append(None)

    return merged_data


def get_element_in_array(array, index):
    return array[index if len(array) > 1 else 0]
