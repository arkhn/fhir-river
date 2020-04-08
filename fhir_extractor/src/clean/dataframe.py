from typing import List

import pandas as pd

import fhir_extractor
from fhir_extractor.src.analyze.attribute import Attribute
from fhir_extractor.src.analyze.sql_column import SqlColumn

def clean_dataframe(
    df, attributes: List[Attribute], primary_key_column,
):
    """ Apply cleaning scripts and concept maps.
    This function takes the dataframe produced by the sql query and return another
    dataframe which looks like:
            |   Attribute                                           |   Attribute
            |   ({table_col}, table)    |   ({table_col}, table)    |   ({table_col}, table)
            |---------------------------|---------------------------|------------------------
    row 1   |   val                     |   val                     |   val
    row 2   |   val                     |   val                     |   val
    ...     |   ...                     |   ...                     |   ...

    and where all values are cleaned (with cleaning scripts and concept maps).
    """
    cleaned_df = pd.DataFrame()
    df_pk_col = df[primary_key_column.dataframe_column_name()]
    for attribute in attributes:
        attr_df = pd.DataFrame()
        for col in attribute.columns:
            df_col_name = col.dataframe_column_name()

            # The column name in the new intermediary dataframe
            # We put also col.table because it's needed in squash_rows
            attr_col_name = (df_col_name, col.table)

            # Get the original column
            attr_df[attr_col_name] = df[df_col_name]

            # Apply cleaning script
            if col.cleaning_script:
                attr_df[attr_col_name] = col.cleaning_script.apply(
                    attr_df[attr_col_name], df_pk_col
                )

            # Apply concept map
            if col.concept_map:
                attr_df[attr_col_name] = col.concept_map.apply(attr_df[attr_col_name], df_pk_col)

        if not attr_df.empty:
            # Change col names to have hierarchical names in the dataframe with all the attributes
            attr_df.columns = pd.MultiIndex.from_product(([attribute], attr_df.columns))

            # Build the dataframe containing all the attributes
            cleaned_df = pd.concat([cleaned_df, attr_df], axis=1)

    cleaned_df[pk_col_name(primary_key_column)] = df_pk_col

    return cleaned_df


def squash_rows(df, squash_rules, parent_cols=[]):
    """
    Apply the squash rules to have a single row for each instance. This is needed
    because joins will create several rows with the same primary key.

    args:
        df (dataframe): the original dataframe with possibly several rows for the same
            primary key.
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

    new_cols = [col for col in df.columns if col[1][1] == table]
    pivot_cols = parent_cols + new_cols

    to_squash = [col for col in df.columns if any([col[1][1] == rule[0] for rule in child_rules])]

    if not to_squash:
        return df

    for child_rule in child_rules:
        df = squash_rows(df, child_rule, pivot_cols)

    df = (
        df.groupby(pivot_cols, as_index=False)
        .apply(lambda x: x.drop_duplicates())
        .groupby(pivot_cols, as_index=False)
        .agg(flat_tuple_agg)
    )

    return df


def merge_dataframe(
    df, attributes: List[Attribute], primary_key_column,
):
    """ Apply merging scripts.
    Takes as input a dataframe of the form

            |   Attribute                                           |   Attribute
            |   ({table_col}, table)    |   ({table_col}, table)    |   ({table_col}, table)
            |---------------------------|---------------------------|------------------------
    row 1   |   val                     |   val                     |   val
    row 2   |   val                     |   val                     |   val
    ...     |   ...                     |   ...                     |   ...

    and outputs

            |   Attribute               |   Attribute
            |---------------------------|------------------------
    row 1   |   val                     |   val
    row 2   |   val                     |   val
    ...     |   ...                     |   ...

    where values are merge thanks to the mergig scripts.
    """
    merged_df = pd.DataFrame()
    df_pk_col = df[pk_col_name(primary_key_column)]
    for attribute in attributes:
        if attribute not in df:
            # If attribute is static or has no input, don't do anything
            continue

        if attribute.merging_script:
            merged_df[attribute] = attribute.merging_script.apply(
                [df[attribute, col] for col in df[attribute]], attribute.static_inputs, df_pk_col
            )
        else:
            attr_cols = df[attribute].columns
            assert (
                len(attr_cols) == 1
            ), f"The mapping contains several unmerged columns for attribute {attribute}"
            merged_df[attribute] = df[attribute][attr_cols[0]]

    return merged_df


def flat_tuple_agg(values):
    """ We don't want tuples of tuples when squashing several times a columns.
    This function does the aggregation so that the resulting tuple isn't nested.
    """
    res = ()
    for _, val in values.iteritems():
        if isinstance(val, tuple):
            res += val
        else:
            res += (val,)
    return res


def pk_col_name(primary_key_column: SqlColumn):
    return ("pk", (primary_key_column.dataframe_column_name(), primary_key_column.table))
