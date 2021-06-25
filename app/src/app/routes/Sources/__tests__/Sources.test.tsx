import React from "react";

import userEvent from "@testing-library/user-event";
import { ResponseComposition, rest, RestRequest } from "msw";
import { setupServer } from "msw/node";

import { resetState, store } from "app/store";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "common/test/test-utils";
import {
  sourceFactory,
  credentialFactory,
  resourceFactory,
  attributeFactory,
  ownerFactory,
} from "services/api/factory";
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

const source = sourceFactory.build();
const source_credential = credentialFactory.build(
  {},
  { associations: { source: source.id } }
);
const credential_owner = ownerFactory.build(
  {},
  { associations: { credential: source_credential.id } }
);
const source_resources = resourceFactory.buildList(
  2,
  {},
  { associations: { source: source.id } }
);
const source_attributes = [
  attributeFactory.build(
    {},
    { associations: { resource: source_resources[0].id } }
  ),
  attributeFactory.build(
    {},
    { associations: { resource: source_resources[0].id } }
  ),
  attributeFactory.build(
    {},
    { associations: { resource: source_resources[1].id } }
  ),
];

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
      res(ctx.json<ApiResourcesListApiResponse>(source_resources))
  ),
  rest.get(
    "http://example.com/api/attributes/",
    (_, res: ResponseComposition<ApiAttributesListApiResponse>, ctx) =>
      res(ctx.json<ApiAttributesListApiResponse>(source_attributes))
  ),
];
const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  store.dispatch(resetState());
});
beforeEach(() => render(<Sources />));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Sources page", () => {
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
              ...source,
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
                ...source,
                name: "source_1",
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
              ...source_credential,
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
                ...source_credential,
                source: sourceId ?? "",
                host: "localhost",
                port: 5432,
                database: "river",
                login: "river",
                password: "river",
                model: "POSTGRES",
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
              ...credential_owner,
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
            ctx.json<ApiOwnersListApiResponse>([credential_owner])
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
              ...source,
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
                ...source,
                name: "source_1_edited",
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
    await waitFor(() =>
      screen.getByRole("heading", { name: /edit credential/i })
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
    userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));

    await waitForElementToBeRemoved(() => screen.getByText("source_1_edited"));
  });
});
