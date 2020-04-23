from typing import List

from collections import defaultdict

import transformer
from transformer.src.analyze.attribute import Attribute
from transformer.src.analyze.sql_column import SqlColumn

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
        (attribute.path, table): [val, val, ...],
        (attribute.path, table): [val, val, ...],
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
    squashed_data = defaultdict(lambda: defaultdict(list))
    for group_pivot, group_squashed in groups.items():
        # Compute length of sqaushed groups
        len_squashed = len(next(iter(group_squashed)))

        # Add pivot data
        for pivot_col, pivot_val in zip(pivot_cols, group_pivot):
            squashed_data[pivot_col[0]][pivot_col[1]].append(pivot_val)

        # Add squashed columns
        squashed_vals = [tuple(tup[i] for tup in group_squashed) for i in range(len_squashed)]
        for to_squash_col, squashed_val in zip(cols_to_squash, squashed_vals):
            squashed_data[to_squash_col[0]][to_squash_col[1]].append(squashed_val)

    if parent_cols == []:
        # In this base case, we should have only one element in each list
        squashed_data = {
            k1: {k2: v[0] for k2, v in inner_dict.items()}
            for k1, inner_dict in squashed_data.items()
        }

    return squashed_data


def merge_attributes(
    data, attributes: List[Attribute], primary_key,
):
    """ Apply merging scripts.
    Takes as input a dict of the form

    {
        (attribute1.path, (table1, col1)): val,
        (attribute1.path, (table2, col2)): val,
        (attribute2.path, (table2, col3)): val,
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
    merged_data = {}
    for attribute in attributes:
        attr_path = attribute.path
        if attr_path not in data:
            # If attribute is static or has no input, don't do anything
            continue

        if attribute.merging_script:
            # TODO add PK in func args
            merged_data[attr_path] = attribute.merging_script.apply(
                [data[attr_path][col] for col in data[attr_path]],
                attribute.static_inputs,
                attr_path,
                primary_key,
            )
        else:
            attr_cols = list(data[attr_path].keys())
            assert (
                len(attr_cols) == 1
            ), f"The mapping contains several unmerged columns for attribute {attribute}"
            merged_data[attr_path] = data[attr_path][attr_cols[0]]

    return merged_data
