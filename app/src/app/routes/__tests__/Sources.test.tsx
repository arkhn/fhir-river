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
  SourceRequest,
  CredentialRequest,
  OwnerRequest,
  ApiSourcesListApiResponse,
  ApiSourcesCreateApiResponse,
  ApiSourcesUpdateApiResponse,
  ApiCredentialsListApiResponse,
  ApiCredentialsCreateApiResponse,
  ApiOwnersListApiResponse,
  ApiOwnersCreateApiResponse,
  ApiAttributesListApiResponse,
  ApiResourcesListApiResponse,
} from "services/api/generated/api.generated";

import Sources from "../Sources";

const handlers = [
  rest.get(
    "http://example.com/api/sources/",
    (_, res: ResponseComposition<ApiSourcesListApiResponse>, ctx) =>
      res(ctx.json<ApiSourcesListApiResponse>([]))
  ),
  rest.delete("http://example.com/api/sources/:id/", (_, res, ctx) =>
    res(ctx.status(204))
  ),
  rest.get(
    "http://example.com/api/credentials/",
    (_, res: ResponseComposition<ApiCredentialsListApiResponse>, ctx) =>
      res(ctx.json<ApiCredentialsListApiResponse>([]))
  ),
  rest.get(
    "http://example.com/api/owners/",
    (_, res: ResponseComposition<ApiOwnersListApiResponse>, ctx) =>
      res(ctx.json<ApiOwnersListApiResponse>([]))
  ),
  rest.get(
    "http://example.com/api/resources/",
    (_, res: ResponseComposition<ApiResourcesListApiResponse>, ctx) =>
      res(
        ctx.json<ApiResourcesListApiResponse>(
          ["resource_1", "resource_2"].map((id) => ({
            id,
            primary_key_table: "",
            primary_key_column: "",
            definition_id: "",
            logical_reference: "",
            updated_at: "",
            created_at: "",
            source: "source_1",
            primary_key_owner: "",
          }))
        )
      )
  ),
  rest.get(
    "http://example.com/api/attributes/",
    (_, res: ResponseComposition<ApiAttributesListApiResponse>, ctx) =>
      res(
        ctx.json<ApiAttributesListApiResponse>(
          ["attribute_1", "attribute_2", "attribute_3"].map((id) => ({
            id,
            path: "",
            definition_id: "",
            updated_at: "",
            created_at: "",
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

    server.use(
      rest.post(
        "http://example.com/api/sources/",
        (
          req: RestRequest<SourceRequest>,
          res: ResponseComposition<ApiSourcesCreateApiResponse>,
          ctx
        ) =>
          res.once(
            ctx.json<ApiSourcesCreateApiResponse>({
              id: "source_1",
              updated_at: "",
              created_at: "",
              ...req.body,
            })
          )
      )
    );

    server.use(
      rest.get(
        "http://example.com/api/sources/",
        (_, res: ResponseComposition<ApiSourcesListApiResponse>, ctx) =>
          res.once(
            ctx.json<ApiSourcesListApiResponse>([
              {
                id: "source_1",
                name: "source_1",
                version: "",
                updated_at: "",
                created_at: "",
              },
            ])
          )
      )
    );

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

    server.use(
      rest.post(
        "http://example.com/api/credentials/",
        (
          req: RestRequest<CredentialRequest>,
          res: ResponseComposition<ApiCredentialsCreateApiResponse>,
          ctx
        ) =>
          res.once(
            ctx.json<ApiCredentialsCreateApiResponse>({
              id: "credential_1",
              updated_at: "",
              created_at: "",
              available_owners: ["public"],
              ...req.body,
            })
          )
      )
    );

    server.use(
      rest.get(
        "http://example.com/api/credentials/",
        (
          req: RestRequest<CredentialRequest>,
          res: ResponseComposition<ApiCredentialsListApiResponse>,
          ctx
        ) => {
          const sourceId = req.url.searchParams.get("source");
          return res.once(
            ctx.json<ApiCredentialsListApiResponse>([
              {
                id: "credential_1",
                updated_at: "",
                created_at: "",
                available_owners: ["public"],
                host: "localhost",
                port: 5432,
                database: "river",
                login: "river",
                password: "river",
                model: "POSTGRES",
                source: sourceId ?? "",
              },
            ])
          );
        }
      )
    );

    userEvent.type(screen.getByRole("textbox", { name: /host/i }), "localhost");
    userEvent.type(screen.getByRole("spinbutton", { name: /port/i }), "5432");
    userEvent.type(screen.getByRole("textbox", { name: /database/i }), "river");
    userEvent.type(screen.getByRole("textbox", { name: /login/i }), "river");
    userEvent.type(screen.getByLabelText("password"), "river");
    userEvent.click(screen.getByRole("button", { name: /vendor model/i }));
    userEvent.click(screen.getByRole("option", { name: /postgresql/i }));
    userEvent.click(screen.getByRole("button", { name: /create credential/i }));

    await waitForElementToBeRemoved(() =>
      screen.getByRole("heading", { name: /new credential/i })
    );
    await waitFor(() => {
      screen.getByRole("heading", { name: /select owners/i });
    });

    server.use(
      rest.post(
        "http://example.com/api/owners/",
        (
          req: RestRequest<OwnerRequest>,
          res: ResponseComposition<ApiOwnersCreateApiResponse>,
          ctx
        ) =>
          res.once(
            ctx.json<ApiOwnersCreateApiResponse>({
              id: "owner_1",
              schema: {},
              ...req.body,
            })
          )
      )
    );

    server.use(
      rest.get(
        "http://example.com/api/owners/",
        (_, rest: ResponseComposition<ApiOwnersListApiResponse>, ctx) =>
          rest.once(
            ctx.json<ApiOwnersListApiResponse>([
              {
                id: "owner_1",
                name: "public",
                schema: {},
                credential: "credential_1",
              },
            ])
          )
      )
    );

    userEvent.click(screen.getByRole("button", { name: /open/i }));
    userEvent.click(screen.getByRole("option", { name: /public/i }));

    await waitFor(() => screen.getByRole("button", { name: /public/i }));

    userEvent.click(screen.getByRole("button", { name: /done/i }));
  });

  test("the existing source is present", async () => {
    screen.getByText("source_1");
  });

  test("the source mappings and attributes count", async () => {
    screen.getByText("2 mappings");
    screen.getByText("3 attributes");
  });

  test("updating a source", async () => {
    server.use(
      rest.put(
        "http://example.com/api/sources/:id/",
        (
          req: RestRequest<SourceRequest>,
          res: ResponseComposition<ApiSourcesUpdateApiResponse>,
          ctx
        ) =>
          res.once(
            ctx.json<ApiSourcesUpdateApiResponse>({
              id: "source_1",
              updated_at: "",
              created_at: "",
              ...req.body,
            })
          )
      )
    );

    server.use(
      rest.get(
        "http://example.com/api/sources/",
        (_, res: ResponseComposition<ApiSourcesListApiResponse>, ctx) =>
          res.once(
            ctx.json<ApiSourcesListApiResponse>([
              {
                id: "source_1",
                name: "source_1_edited",
                updated_at: "",
                created_at: "",
              },
            ])
          )
      )
    );

    userEvent.click(screen.getByRole("button", { name: /source_1 menu/i }));
    userEvent.click(screen.getByRole("menuitem", { name: /edit/i }));
    screen.getByRole("heading", { name: /edit source/i });

    userEvent.type(
      screen.getByRole("textbox", {
        name: /name/i,
      }),
      "source_1_edited"
    );
    userEvent.click(
      screen.getByRole("button", {
        name: /update source/i,
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.getByRole("heading", { name: /edit source/i })
    );
    await waitFor(
      () => screen.getByRole("heading", { name: /edit credential/i }),
      { timeout: 10000 }
    );

    userEvent.click(screen.getByRole("button", { name: /update credential/i }));

    await waitForElementToBeRemoved(() =>
      screen.getByRole("heading", { name: /edit credential/i })
    );
    await waitFor(() => {
      screen.getByRole("heading", { name: /select owners/i });
    });

    userEvent.click(screen.getByRole("button", { name: /done/i }));

    screen.getByText("source_1_edited");
  });

  test("deleting a source", async () => {
    screen.getByText("source_1_edited");

    server.use(
      rest.get(
        "http://example.com/api/sources/",
        (_, res: ResponseComposition<ApiSourcesListApiResponse>, ctx) =>
          res.once(ctx.json<ApiSourcesListApiResponse>([]))
      )
    );

    userEvent.click(
      screen.getByRole("button", { name: /source_1_edited menu/i })
    );
    userEvent.click(screen.getByRole("menuitem", { name: /delete/i }));

    await waitForElementToBeRemoved(() => screen.getByText("source_1_edited"));
  });
});
