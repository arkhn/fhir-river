from unittest import mock
from pytest import raises

from analyzer.src.analyze.graphql import PyrogClient


@mock.patch("analyzer.src.analyze.graphql.PyrogClient.login")
def test_get_headers(mock_login):
    mock_login.return_value = "token"
    header = PyrogClient().get_headers()

    assert header == {
        "content-type": "application/json",
        "Authorization": "Bearer token",
    }


@mock.patch("analyzer.src.analyze.graphql.PyrogClient.login")
@mock.patch("analyzer.src.analyze.graphql.requests.post")
def test_run_graphql_query(mock_post, mock_login):
    mock_login.return_value = "token"
    mock_post.return_value = mock.MagicMock()
    pyrog_client = PyrogClient()
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
    mock_post.return_value.json.return_value = {"data": None, "errors": "error message"}

    with raises(Exception, match="GraphQL query failed with errors: error message."):
        pyrog_client.run_graphql_query("query")
