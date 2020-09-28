from unittest import mock
from pytest import raises

from analyzer.src.analyze.graphql import PyrogClient


@mock.patch("analyzer.src.analyze.graphql.requests.post")
def test_run_graphql_query(mock_post):
    mock_post.return_value = mock.MagicMock()
    pyrog_client = PyrogClient(None)
    # No error
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"data": "successful query"}

    response = pyrog_client.run_graphql_query("query")
    assert response == {"data": "successful query"}

    # Request error
    mock_post.return_value.status_code = 400
    mock_post.return_value.json.return_value = "reason"

    with raises(Exception, match=f"Graphql query failed with returning code 400\nreason."):
        pyrog_client.run_graphql_query("query")

    # GraphQL error
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {
        "data": None,
        "errors": [{"message": "error message", "statusCode": 400}],
    }

    with raises(Exception, match="GraphQL query failed with errors"):
        pyrog_client.run_graphql_query("query")
