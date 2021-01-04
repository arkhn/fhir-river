from typing import List

import requests

# GraphQL requests should be prettified with :
#  - tabWidth set to 4 spaces
#  - printWidth set to stay under flake8's max line length (79)


class PyrogClient:
    def __init__(self, url, auth_header=None):
        self.url = url
        self.headers = {
            "content-type": "application/json",
            "Authorization": auth_header,
        }

    def run_graphql_query(self, request: str, variables=None):
        """
        This function queries a GraphQL endpoint
        and returns a json parsed response.
        """
        try:
            response = requests.post(
                self.url,
                headers=self.headers,
                json={"query": request, "variables": variables},
            )
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to the Pyrog service")

        if response.status_code != 200:
            raise Exception(
                "Graphql query failed with returning code "
                f"{response.status_code}\n{response.json()}."
            )
        content = response.json()
        if "errors" in content:
            status_code = content["errors"][0].get("statusCode")
            error_message = content["errors"][0].get("message")
            if status_code == 401:
                raise Exception(error_message)
            if status_code == 403:
                raise Exception("You don't have the rights to perform this action.")
            raise Exception(
                "GraphQL query failed with errors: "
                f"{[err['message'] for err in content['errors']]}."
            )

        return content["data"]

    def create_template(self, name: str) -> dict:
        request = """
            mutation createTemplate($name: String!) {
                createTemplate(name: $name) {
                    id
                }
            }
        """
        data = self.run_graphql_query(request, variables={"name": name})
        return data["createTemplate"]

    def delete_template(self, id_: str) -> dict:
        request = """
            mutation deleteTemplate($id: ID!) {
                deleteTemplate(id: $id) {
                    id
                }
            }
        """
        data = self.run_graphql_query(request, variables={"id": id_})
        return data["deleteTemplate"]

    def create_source(self, name: str, template_name: str, mapping: str):
        request = """
            mutation createSource(
                $templateName: String!
                $name: String!
                $mapping: String
            ) {
                createSource(
                    templateName: $templateName
                    name: $name
                    mapping: $mapping
                ) {
                    id
                }
            }
        """
        data = self.run_graphql_query(
            request,
            variables={
                "templateName": template_name,
                "name": name,
                "mapping": mapping,
            },
        )
        return data["createSource"]

    def delete_source(self, id_: str) -> dict:
        request = """
            mutation deleteSource($id: ID!) {
                deleteSource(sourceId: $id) {
                    id
                }
            }
        """
        data = self.run_graphql_query(request, variables={"id": id_})
        return data["deleteSource"]

    def upsert_credentials(self, source_id: str, credentials: dict) -> dict:
        request = """
            mutation upsertCredential(
                $sourceId: ID!
                $host: String!
                $port: String!
                $login: String!
                $password: String!
                $database: String!
                $owner: String!
                $model: String!
            ) {
                upsertCredential(
                    sourceId: $sourceId
                    host: $host
                    port: $port
                    login: $login
                    password: $password
                    database: $database
                    owner: $owner
                    model: $model
                ) {
                    id
                }
            }
        """
        data = self.run_graphql_query(
            request, variables={**credentials, "sourceId": source_id}
        )
        return data["upsertCredential"]

    def list_resources_by_source(self, source_id: str) -> List:
        request = """
            query listResourcesBySource($sourceId: ID!) {
                source(sourceId: $sourceId) {
                    id
                    resources {
                        id
                        definitionId
                    }
                }
            }
        """
        data = self.run_graphql_query(request, variables={"sourceId": source_id})
        return [
            {"resource_id": resource["id"], "resource_type": resource["definitionId"]}
            for resource in data["source"]["resources"]
        ]
