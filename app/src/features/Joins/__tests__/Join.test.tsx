import React from "react";

import userEvent from "@testing-library/user-event";
import { ResponseComposition, rest, RestRequest } from "msw";
import { setupServer } from "msw/node";

import { render, screen } from "common/test/test-utils";
import {
  columnFactory,
  credentialFactory,
  ownerFactory,
  resourceFactory,
  sqlInputFactory,
  joinFactory,
} from "services/api/factory";
import {
  ApiColumnsCreateApiResponse,
  ApiCredentialsListApiResponse,
  ApiJoinsCreateApiResponse,
  ApiOwnersListApiResponse,
  ColumnRequest,
  JoinRequest,
} from "services/api/generated/api.generated";

import Join from "../Join";

const mapping = resourceFactory.build({
  primary_key_owner: "public",
  primary_key_table: "table",
  primary_key_column: "column",
});
const credential = credentialFactory.build();
const owner = ownerFactory.build(
  {},
  {
    associations: {
      credential: credential.id,
      schema: { table1: ["column1"], table2: ["column2"] },
    },
  }
);
const leftColumn = columnFactory.build({
  column: "column1",
  table: "table1",
  owner: owner.name,
});
const rightColumn = columnFactory.build({
  column: "column2",
  table: "table2",
  owner: owner.name,
});
const leftSqlInput = sqlInputFactory.build({ column: leftColumn.id });
const rightSqlInput = sqlInputFactory.build({ column: rightColumn.id });
const join = joinFactory.build({
  left: leftSqlInput.id,
  right: rightSqlInput.id,
});

const handlers = [
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
          ...leftColumn,
          ...req.body,
        })
      )
  ),
  rest.post(
    "http://example.com/api/joins/",
    (
      req: RestRequest<JoinRequest>,
      res: ResponseComposition<ApiJoinsCreateApiResponse>,
      ctx
    ) =>
      res.once(
        ctx.json<ApiJoinsCreateApiResponse>({
          ...join,
          ...req.body,
        })
      )
  ),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

describe("Join creation", () => {
  it("should render a join UI", async () => {
    render(
      <Join join={{ sql_input: join.sql_input }} onDelete={jest.fn} />,
      undefined,
      {
        path: "/sources/:sourceId/mappings/:mappingId/attributes/:attributeId",
        route: `/sources/sourceId/mappings/${mapping.id}/attributes/attributeId`,
      }
    );

    // Should be 2 inputs for table
    expect(screen.getAllByTestId("table_input")).toHaveLength(2);
    // Should be 2 inputs for columns
    expect(screen.getAllByTestId("column_input")).toHaveLength(2);

    const [leftColumnTableInput, rightColumnTableInput] = screen.getAllByTestId(
      "table_input"
    );
    const [
      leftColumnColumnInput,
      rightColumnColumnInput,
    ] = screen.getAllByTestId("column_input");

    expect(leftColumnTableInput).not.toBeUndefined();
    expect(rightColumnTableInput).not.toBeUndefined();
    expect(leftColumnColumnInput).not.toBeUndefined();
    expect(rightColumnColumnInput).not.toBeUndefined();

    // Left table select
    leftColumnTableInput && userEvent.click(leftColumnTableInput);
    userEvent.click(await screen.findByRole("option", { name: /table1/i }));
    // Left column select
    leftColumnColumnInput && userEvent.click(leftColumnColumnInput);
    userEvent.click(await screen.findByRole("option", { name: /column1/i }));

    // Right column server mock config
    server.use(
      rest.post(
        "http://example.com/api/columns/",
        (
          req: RestRequest<ColumnRequest>,
          res: ResponseComposition<ApiColumnsCreateApiResponse>,
          ctx
        ) =>
          res.once(
            ctx.json<ApiColumnsCreateApiResponse>({
              ...rightColumn,
              ...req.body,
            })
          )
      )
    );
    // Right column select
    rightColumnTableInput && userEvent.click(rightColumnTableInput);
    userEvent.click(await screen.findByRole("option", { name: /table2/i }));
    // Right table select
    rightColumnColumnInput && userEvent.click(rightColumnColumnInput);
    userEvent.click(await screen.findByRole("option", { name: /column2/i }));

    expect(screen.getByDisplayValue("table1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("table2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("column1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("column2")).toBeInTheDocument();
  });
});
