from unittest import mock
from pytest import raises

import transformer.src.analyze.graphql as gql


@mock.patch("transformer.src.analyze.graphql.requests.post")
def test_run_graphql_query(mock_post):
    mock_post.return_value = mock.MagicMock()

    # No error
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"data": "successful query"}

    response = gql.run_graphql_query("query")
    assert response == {"data": "successful query"}

    # Request error
    mock_post.return_value.status_code = 400
    mock_post.return_value.reason = "reason"

    with raises(Exception, match=f"Query failed with returning code 400\nreason."):
        gql.run_graphql_query("query")

    # GraphQL error
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"data": None, "errors": "error message"}

    with raises(Exception, match="GraphQL query failed with errors: error message."):
        gql.run_graphql_query("query")


@mock.patch("transformer.src.analyze.graphql.run_graphql_query")
def test_get_resource_from_id(mock_run_graphql_query):
    # Mock run_graphql_query
    mock_run_graphql_query.return_value = {"data": {"resource": {"id": 1, "content": "content1"}}}

    resources = gql.get_resource_from_id("resource_id_1")

    assert mock_run_graphql_query.call_count == 1
    assert resources == {"id": 1, "content": "content1"}
