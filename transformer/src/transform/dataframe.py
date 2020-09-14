from typing import List
from collections import defaultdict

from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.condition import CONDITION_FLAG
from logging.logger import get_logger

logger = get_logger(["resource_id", "primary_key_value"])


def clean_data(data, attributes: List[Attribute], primary_key):
    """ Apply cleaning scripts and concept maps.
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
                attr_col_name = (input_group.id, (col.table, col.column))

                # Get the original column
                cleaned_data[attr_col_name] = [
                    attribute.cast_type(row) for row in data[dict_col_name]
                ]

                # Apply cleaning script
                if col.cleaning_script:
                    cleaned_data[attr_col_name] = col.cleaning_script.apply(
                        cleaned_data[attr_col_name], dict_col_name, primary_key
                    )

                # Apply concept map
                if col.concept_map:
                    cleaned_data[attr_col_name] = col.concept_map.apply(
                        cleaned_data[attr_col_name], dict_col_name, primary_key
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


def squash_rows(data, squash_rules, parent_cols=[]):
    """
    Apply the squash rules to have a single row for each instance. This is needed
    because joins will create several rows with the same primary key.

    args:
        data (dict): the dict returned by clean_data with possibly several rows for
            the same primary key.
        squash_rules (nested list): squash rules built by the Analyzer
        parent_cols (list): param used for recursive call

    Example:
        if you join people with bank accounts on guy.id = account.owner_id,
        you want at the end to have for a single guy to have a single instance
        with an attribute accounts.
        ROWS:
        GUY.NAME    ...     GUY.AGE     ACCOUNT.NAME        ACCOUNT.AMOUNT
        Robert              21          Compte courant      17654
        Robert              21          Compte d'epargne    123456789
        David               51          Ibiza summer        100

        Squash rule: ['GUY', ['ACCOUNT', []]

        Output:
        GUY.NAME    ...     GUY.AGE   ACCOUNT.NAME                        ACCOUNT.AMOUNT
        Robert              21        (Compte courant, Compte d'epargne)  (17654, 123456789)
        David               51        Ibiza summer                        100
    """
    table, child_rules = squash_rules

    # If there are no more child rules to process, we return the original data
    if not [col for col in data if any([col[1][0] == rule[0] for rule in child_rules])]:
        return data

    new_pivots = [col for col in data if col[1][0] == table]
    pivot_cols = parent_cols + new_pivots

    cols_to_squash = [col for col in data if col not in pivot_cols]

    for child_rule in child_rules:
        # Recursion to apply child rules
        data = squash_rows(data, child_rule, pivot_cols)

    # Build the groups
    groups = defaultdict(set)
    len_data = len(list(data.values())[0])

    for i in range(len_data):
        pivot_tuple = tuple(data[col][i] for col in pivot_cols)
        to_squash_tuple = tuple(data[col][i] for col in cols_to_squash)
        groups[pivot_tuple].add(to_squash_tuple)

    # Rebuild a dict with the different groups
    squashed_data = defaultdict(list)
    for group_pivot, group_squashed in groups.items():
        # Compute length of squashed groups
        len_squashed = len(next(iter(group_squashed)))

        # Add pivot data
        for pivot_col, pivot_val in zip(pivot_cols, group_pivot):
            squashed_data[pivot_col].append(pivot_val)

        # Add squashed columns
        squashed_vals = [tuple(tup[i] for tup in group_squashed) for i in range(len_squashed)]
        for to_squash_col, squashed_val in zip(cols_to_squash, squashed_vals):
            squashed_data[to_squash_col].append(squashed_val)

    return squashed_data


def merge_by_attributes(
    data, attributes: List[Attribute], primary_key,
):
    """ Apply merging scripts.
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
    # Un-list values in dict
    data = {k: v[0] for k, v in data.items()}

    merged_data = {}
    for attribute in attributes:
        for input_group in attribute.input_groups:
            # Check conditions
            if input_group.check_conditions(data):
                cur_attr_columns = [
                    value for key, value in data.items() if key[0] == input_group.id
                ]

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
                    # TODO I don't think the order of pyrog inputs is preserved here
                    merged_data[attribute.path] = input_group.merging_script.apply(
                        cur_attr_columns, input_group.static_inputs, attribute.path, primary_key,
                    )
                elif len(cur_attr_columns) != 1:
                    raise ValueError(
                        "The mapping contains several unmerged columns "
                        f"for attribute {attribute}"
                    )
                else:
                    merged_data[attribute.path] = cur_attr_columns[0]

                break

    return merged_data
