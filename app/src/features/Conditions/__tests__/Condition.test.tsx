import React from "react";

import userEvent from "@testing-library/user-event";
import { ResponseComposition, rest, RestRequest } from "msw";
import { setupServer } from "msw/node";

import { render, screen } from "common/test/test-utils";
import {
  columnFactory,
  credentialFactory,
  inputGroupFactory,
  ownerFactory,
  resourceFactory,
  sqlInputFactory,
  conditionFactory,
} from "services/api/factory";
import {
  ApiColumnsCreateApiResponse,
  ApiConditionsCreateApiResponse,
  ApiCredentialsListApiResponse,
  ApiOwnersListApiResponse,
  ApiResourcesRetrieveApiResponse,
  ApiSqlInputsCreateApiResponse,
  ColumnRequest,
  ConditionRequest,
  SQLInputRequest,
} from "services/api/generated/api.generated";

import Condition from "../Condition";

const mapping = resourceFactory.build({
  primary_key_owner: "public",
  primary_key_table: "table",
  primary_key_column: "column",
});
const credential = credentialFactory.build();
const owner = ownerFactory.build(
  {},
  { associations: { credential: credential.id } }
);
const column = columnFactory.build({
  column: mapping.primary_key_column,
  table: mapping.primary_key_table,
  owner: mapping.primary_key_owner,
});
const sqlInput = sqlInputFactory.build({ column: column.id });
const inputGroup = inputGroupFactory.build({});
const condition = conditionFactory.build({
  action: "INCLUDE",
  input_group: inputGroup.id,
  sql_input: sqlInput.id,
});

const handlers = [
  rest.get("http://example.com/api/resources/:id/", (_, res, ctx) =>
    res(ctx.json<ApiResourcesRetrieveApiResponse>(mapping))
  ),
  rest.get("http://example.com/api/credentials/", (_, res, ctx) =>
    res(
      ctx.json<ApiCredentialsListApiResponse>([credential])
    )
  ),
  rest.get(
    "http://example.com/api/owners/",
    (_, res: ResponseComposition<ApiOwnersListApiResponse>, ctx) =>
      res(
        ctx.json<ApiOwnersListApiResponse>([owner])
      )
  ),
  rest.post(
    "http://example.com/api/columns/",
    (
      req: RestRequest<ColumnRequest>,
      res: ResponseComposition<ApiColumnsCreateApiResponse>,
      ctx
    ) =>
      res.once(
        ctx.json<ApiColumnsCreateApiResponse>({
          ...column,
          ...req.body,
        })
      )
  ),
  rest.post(
    "http://example.com/api/sql-inputs/",
    (
      req: RestRequest<SQLInputRequest>,
      res: ResponseComposition<ApiSqlInputsCreateApiResponse>,
      ctx
    ) =>
      res.once(
        ctx.json<ApiSqlInputsCreateApiResponse>({
          ...sqlInput,
          ...req.body,
        })
      )
  ),
  rest.post(
    "http://example.com/api/conditions/",
    (
      req: RestRequest<ConditionRequest>,
      res: ResponseComposition<ApiConditionsCreateApiResponse>,
      ctx
    ) =>
      res.once(
        ctx.json<ApiConditionsCreateApiResponse>({
          ...condition,
          ...req.body,
        })
      )
  ),
  rest.patch(
    "http://example.com/api/conditions/:id",
    (
      req: RestRequest<ConditionRequest>,
      res: ResponseComposition<ApiConditionsCreateApiResponse>,
      ctx
    ) =>
      res.once(
        ctx.json<ApiConditionsCreateApiResponse>({
          ...condition,
          ...req.body,
        })
      )
  ),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

describe("Condition creation", () => {
  it("should render a condition UI", async () => {
    render(
      <Condition
        condition={{
          action: condition.action,
          input_group: condition.input_group,
        }}
        onDelete={jest.fn}
      />,
      undefined,
      {
        path: "/sources/:sourceId/mappings/:mappingId/attributes/:attributeId",
        route: `/sources/sourceId/mappings/${mapping.id}/attributes/attributeId`,
      }
    );

    await screen.findByText(/condition/i);

    // column table selection
    userEvent.click(screen.getByTestId("table_input"));
    userEvent.click(await screen.findByRole("option", { name: /^table$/i }));

    // column column selection
    userEvent.click(screen.getByTestId("column_input"));
    userEvent.click(await screen.findByRole("option", { name: /^column$/i }));

    userEvent.click(screen.getByText(/select operation/i));
    userEvent.click(screen.getByRole("option", { name: /<=/i }));

    await screen.findByRole("button", { name: /<=/i });
    expect(screen.getByDisplayValue("table")).toBeInTheDocument();
    expect(screen.getByDisplayValue("column")).toBeInTheDocument();
  });
});