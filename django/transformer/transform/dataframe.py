from typing import List

from common.analyzer.attribute import Attribute
from common.analyzer.condition import CONDITION_FLAG
from common.analyzer.sql_column import SqlColumn


def clean_data(data, attributes: List[Attribute], primary_key_col: SqlColumn, primary_key_value: str):
    """Apply cleaning scripts and concept maps.
    This function takes the dictionary produced by the Extractor and returns another
    one which looks like:
    {
        (input_group.id, (table, column)): [val, val, ...],
        (input_group.id, (table, column)): [val, val, ...],
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
                attr_col_name = (input_group.id, (col.owner, col.table, col.column))

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
                    (condition.sql_column.table, condition.sql_column.column),
                )

                # Get the original column
                cleaned_data[cond_col_name] = data[dict_col_name]

    return cleaned_data


def merge_by_attributes(data, attributes: List[Attribute], primary_key_value: str):
    """Apply merging scripts.
     Takes as input a dict of the form

    {
         (input_group1.id, (table1, column1)): val,
         (input_group1.id, (table2, column2)): val,
         (input_group2.id, (table3, column3)): val,
         (CONDITION_FLAG, (table4, column4)): val,
         ...
     }

     and outputs

     {
         attribute1.path: val,
         attribute2.path: val,
         ...
     }

     where values are merged with the mergig scripts.
    """
    merged_data = {}
    for attribute in attributes:
        for input_group in attribute.input_groups:
            # Check conditions
            if input_group.check_conditions(data):
                cur_attr_columns = [value for key, value in data.items() if key[0] == input_group.id]

                if not cur_attr_columns:
                    if input_group.static_inputs:
                        # If attribute is static, use static input
                        # Otherwise, attribute is not a leaf or has no inputs
                        if len(input_group.static_inputs) != 1:
                            raise ValueError(
                                f"The mapping contains an attribute ({attribute.path}) "
                                "with several static inputs (and no sql input)"
                            )
                        merged_data[attribute.path] = input_group.static_inputs[0]
                elif input_group.merging_script:
                    # TODO I don't think the order of pyrog inputs is preserved for
                    # merging scripts. When trying to merge several columns that each
                    # contain multiple values (represented as a list), we want to merge
                    # corresponding items together (first with first, etc.) as follows:
                    # col1: [a1, a2, a3]
                    #        |   |   |
                    # col2: [b1, b2, b3]
                    #        |   |   |
                    # col3: [c1, c2, c3]
                    col_len = len(cur_attr_columns[0])
                    if any(len(col) != col_len for col in cur_attr_columns):
                        raise ValueError("Can't merge columns with inconsistent lengths.")
                    merged_data[attribute.path] = tuple(
                        input_group.merging_script.apply(
                            [col[i] for col in cur_attr_columns],
                            input_group.static_inputs,
                            attribute.path,
                            primary_key_value,
                        )
                        for i in range(col_len)
                    )
                elif len(cur_attr_columns) != 1:
                    raise ValueError(f"The mapping contains several unmerged columns for attribute {attribute}")
                else:
                    merged_data[attribute.path] = tuple(cur_attr_columns[0])

                break

    return merged_data
