from collections import defaultdict

from transformer.src.analyze.graphql import get_resource_from_id


def get_mapping(resource_ids):
    """
    Get all available resources from a pyrog mapping.
    The mapping come from a pyrog graphql API.

    Args:
        resource_ids: ids of the resources to process
    """
    for resource_id in resource_ids:
        resource = get_resource_from_id(resource_id)
        yield resource


def build_squash_rules(columns, joins, main_table):
    """
    Using the dependency graph of the joins on the tables (accessed through the
    head node), regroup (using the id) the columns which should be squashed (ie
    those accessed through a OneToMany join)

    Args:
        node: the node of the source table (which can be relative in recursive calls)

    Return:
        [
            main table name,
            [
                table1 joined on parent, [...],
                table2 joined on parent, [...],
                ...
            ]
        ]
    """
    # Build a join graph
    join_graph = build_join_graph(joins)

    squash_rules = rec_build_squash_rules(join_graph, main_table)

    return squash_rules


def rec_build_squash_rules(join_graph, node):
    child_rules = []
    for join_node in join_graph[node]:
        child_rules.append(rec_build_squash_rules(join_graph, join_node))

    return [node, child_rules]


def build_join_graph(joins):
    """
    Transform a join info into SQL fragments and parse the graph of join dependency
    Input:
        {("<owner>.<table>.<col>", "<owner>.<join_table>.<join_col>"), ... }
    Return:
        {
            "<table>": ["<join_table 1>", "<join_table 2>", ...],
            ...
        }
    """
    graph = defaultdict(list)
    for join in joins:
        join_source = join.left
        join_target = join.right

        # Get table names
        source_table = join_source.table_name()
        target_table = join_target.table_name()

        # Add the join in the join_graph
        graph[source_table].append(target_table)

    return graph
