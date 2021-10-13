import React from "react";

import userEvent from "@testing-library/user-event";
import { ResponseComposition, rest } from "msw";
import { setupServer } from "msw/node";

import { resetState, store } from "app/store";
import { render, screen, waitFor } from "common/test/test-utils";
import {
  attributeFactory,
  credentialFactory,
  filterFactory,
  resourceFactory,
  projectFactory,
} from "services/api/factory";
import {
  ApiResourcesListApiResponse,
  ApiFiltersListApiResponse,
  ApiAttributesListApiResponse,
  ApiProjectsRetrieveApiResponse,
  ApiCredentialsListApiResponse,
} from "services/api/generated/api.generated";

import ProjectMappings from "../ProjectMappings";

const project = projectFactory.build();
const project_credential = credentialFactory.build(
  {},
  {
    associations: { project: project.id },
  }
);
const source_resource = resourceFactory.build(
  {},
  { associations: { project: project.id } }
);

const resource_attributes = attributeFactory.buildList(
  2,
  {},
  { associations: { resource: source_resource.id } }
);
const resource_filters = filterFactory.buildList(
  2,
  {},
  { associations: { resource: source_resource.id } }
);

const handlers = [
  rest.get("http://example.com/api/sources/:id/", (_, res, ctx) =>
    res(ctx.json<ApiProjectsRetrieveApiResponse>(project))
  ),
  rest.get(
    "http://example.com/api/resources/",
    (_, res: ResponseComposition<ApiResourcesListApiResponse>, ctx) =>
      res(
        ctx.json<ApiResourcesListApiResponse>([source_resource])
      )
  ),
  rest.get(
    "http://example.com/api/attributes/",
    (_, res: ResponseComposition<ApiAttributesListApiResponse>, ctx) =>
      res(ctx.json<ApiAttributesListApiResponse>(resource_attributes))
  ),
  rest.get(
    "http://example.com/api/filters/",
    (_, res: ResponseComposition<ApiFiltersListApiResponse>, ctx) =>
      res(ctx.json<ApiFiltersListApiResponse>(resource_filters))
  ),
  rest.get(
    "http://example.com/api/credentials/",
    (_, res: ResponseComposition<ApiCredentialsListApiResponse>, ctx) =>
      res(
        ctx.json<ApiCredentialsListApiResponse>([project_credential])
      )
  ),
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  store.dispatch(resetState());
});
beforeEach(() =>
  render(<ProjectMappings />, undefined, {
    path: "/sources/:sourceId",
    route: `/sources/${project.id}`,
  })
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Source mappings page", () => {
  it("should display the existing mappings", async () => {
    await waitFor(() => screen.getByText("resource_1"));
  });

  it("should open credential drawer with correct values", async () => {
    userEvent.click(screen.getByRole("button", { name: /database settings/i }));

    await screen.findByRole("heading", { name: /edit credential/i });

    expect(screen.getByRole("textbox", { name: /host/i })).toHaveValue(
      project_credential.host
    );
    expect(screen.getByRole("spinbutton", { name: /port/i })).toHaveValue(
      project_credential.port
    );
    expect(screen.getByRole("textbox", { name: /database/i })).toHaveValue(
      project_credential.database
    );
    expect(screen.getByRole("textbox", { name: /login/i })).toHaveValue(
      project_credential.login
    );
    expect(screen.getByLabelText("password")).toHaveValue(
      project_credential.password
    );
  });
});
