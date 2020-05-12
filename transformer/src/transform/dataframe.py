from typing import List
from collections import defaultdict

from analyzer.src.analyze.attribute import Attribute

from transformer.src.config.logger import create_logger

logger = create_logger("dataframe")


def apply_str(data):
    for key, rows in data.items():
        data[key] = [str(row) if row is not None else None for row in rows]
    return data


def clean_data(data, attributes: List[Attribute], primary_key):
    """ Apply cleaning scripts and concept maps.
    This function takes the dictionary produced by the Extractor and returns another
    one which looks like:
    {
        (attribute.path, (table, column)): [val, val, ...],
        (attribute.path, (table, column)): [val, val, ...],
        ...
    }
    and where all values are cleaned (with cleaning scripts and concept maps).
    """
    cleaned_data = {}
    for attribute in attributes:
        for col in attribute.columns:
            dict_col_name = col.dataframe_column_name()

            # The column name in the new intermediary dataframe
            # We use col.table because it's needed in squash_rows
            attr_col_name = (attribute.path, (col.table, col.column))

            # Get the original column
            cleaned_data[attr_col_name] = data[dict_col_name]

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

    if parent_cols == []:
        # In this base case, we should have only one element in each list
        squashed_data = {k: v[0] for k, v in squashed_data.items()}

    return squashed_data


def merge_attributes(
    data, attributes: List[Attribute], primary_key,
):
    """ Apply merging scripts.
    Takes as input a dict of the form

   {
        (attribute1.path, (table1, column1)): val,
        (attribute1.path, (table2, column2)): val,
        (attribute2.path, (table3, column3)): val,
        ...
    }

    and outputs

    {
        attribute1.path: val,
        attribute2.path: val,
        ...
    }

    where values are merge thanks to the mergig scripts.
    """
    # TODO I don't think the order of pyrog inputs is preserved here
    merged_data = {}
    for attribute in attributes:
        cur_attr_columns = [value for key, value in data.items() if key[0] == attribute.path]

        if not cur_attr_columns:
            # If attribute is static or has no input, don't do anything
            continue

        if attribute.merging_script:
            merged_data[attribute.path] = attribute.merging_script.apply(
                cur_attr_columns, attribute.static_inputs, attribute.path, primary_key,
            )
        else:
            if len(cur_attr_columns) != 1:
                raise ValueError(
                    f"The mapping contains several unmerged columns for attribute {attribute}"
                )
            merged_data[attribute.path] = cur_attr_columns[0]

    return merged_data
