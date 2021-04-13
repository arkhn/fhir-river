import React from "react";

import userEvent from "@testing-library/user-event";
import { ResponseComposition, rest, RestRequest } from "msw";
import { setupServer } from "msw/node";

import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "common/test/test-utils";
import type {
  Credential,
  Source,
  Resource,
  Attribute,
  SourceRequest,
  CredentialRequest,
  Owner,
} from "services/api/generated/api.generated";

import Sources from "../Sources";

const handlers = [
  rest.get(
    "http://example.com/api/sources/",
    (_, res: ResponseComposition<Source[]>, ctx) =>
      res(
        ctx.json<Source[]>([
          {
            id: "source_1",
            name: "source_1",
            version: "",
            updatedAt: "",
            createdAt: "",
          },
        ])
      )
  ),
  rest.delete("http://example.com/api/sources/:id/", (_, res, ctx) =>
    res(ctx.status(204))
  ),
  rest.post(
    "http://example.com/api/sources/",
    (req: RestRequest<SourceRequest>, res: ResponseComposition<Source>, ctx) =>
      res(
        ctx.json<Source>({
          id: "source_1",
          updatedAt: "",
          createdAt: "",
          ...req.body,
        })
      )
  ),
  rest.get(
    "http://example.com/api/credentials/",
    (_, rest: ResponseComposition<Credential[]>, ctx) =>
      rest(ctx.json<Credential[]>([]))
  ),
  rest.get(
    "http://example.com/api/owners/",
    (_, rest: ResponseComposition<Owner[]>, ctx) => rest(ctx.json<Owner[]>([]))
  ),
  rest.post(
    "http://example.com/api/credentials/",
    (
      req: RestRequest<CredentialRequest>,
      rest: ResponseComposition<Credential>,
      ctx
    ) =>
      rest(
        ctx.json<Credential>({
          id: "credential_1",
          updatedAt: "",
          createdAt: "",
          availableOwners: ["public"],
          ...req.body,
        })
      )
  ),
  rest.get(
    "http://example.com/api/resources/",
    (_, res: ResponseComposition<Resource[]>, ctx) =>
      res(
        ctx.json<Resource[]>(
          ["resource_1", "resource_2"].map((id) => ({
            id,
            primaryKeyTable: "",
            primaryKeyColumn: "",
            definitionId: "",
            logicalReference: "",
            updatedAt: "",
            createdAt: "",
            source: "source_1",
            primaryKeyOwner: "",
          }))
        )
      )
  ),
  rest.get(
    "http://example.com/api/attributes/",
    (_, res: ResponseComposition<Attribute[]>, ctx) =>
      res(
        ctx.json<Attribute[]>(
          ["attribute_1", "attribute_2", "attribute_3"].map((id) => ({
            id,
            path: "",
            definitionId: "",
            updatedAt: "",
            createdAt: "",
            resource: "",
          }))
        )
      )
  ),
];
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Sources page", () => {
  beforeEach(() => render(<Sources />));

  test("creating a new source", async () => {
    userEvent.click(screen.getByRole("button", { name: /new source/i }));

    screen.getByRole("heading", { name: /new source/i });

    userEvent.type(
      screen.getByRole("textbox", {
        name: /name/i,
      }),
      "source_1"
    );
    userEvent.click(
      screen.getByRole("button", {
        name: /create source/i,
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.getByRole("heading", { name: /new source/i })
    );
    await waitFor(() =>
      screen.getByRole("heading", { name: /new credential/i })
    );

    userEvent.type(screen.getByRole("textbox", { name: /host/i }), "localhost");
    userEvent.type(screen.getByRole("spinbutton", { name: /port/i }), "5432");
    userEvent.type(screen.getByRole("textbox", { name: /database/i }), "river");
    userEvent.type(screen.getByRole("textbox", { name: /login/i }), "river");
    userEvent.type(screen.getByLabelText("password"), "river");
    userEvent.click(screen.getByRole("button", { name: /vendor model/i }));
    userEvent.click(screen.getByRole("option", { name: "POSTGRESQL" }));
    userEvent.click(screen.getByRole("button", { name: /create credential/i }));

    await waitForElementToBeRemoved(() =>
      screen.getByRole("heading", { name: /new credential/i })
    );
    await waitFor(() => {
      screen.getByRole("heading", { name: /select owners/i });
    });

    // TODO: test owners form

    userEvent.click(screen.getByRole("button", { name: /done/i }));
  });

  test("the existing source is present", async () => {
    await waitFor(() => {
      screen.getByText("source_1");
    });
  });

  test("the source mappings and attributes count", async () => {
    await waitFor(() => {
      screen.getByText("2 mappings");
      screen.getByText("3 attributes");
    });
  });

  test("deleting a source", async () => {
    await waitFor(() => {
      screen.getByText("source_1");
    });

    server.use(
      rest.get(
        "http://example.com/api/sources/",
        (_, res: ResponseComposition<Source[]>, ctx) =>
          res(ctx.json<Source[]>([]))
      )
    );

    userEvent.click(screen.getByRole("button", { name: /source_1 menu/i }));
    userEvent.click(screen.getByRole("menuitem", { name: /delete/i }));

    await waitForElementToBeRemoved(() => screen.getByText("source_1"));
  });
});
