import React from "react";

import { rest } from "msw";
import { setupServer } from "msw/node";

import { resetState, store } from "app/store";
import { render, screen, waitFor } from "common/test/test-utils";
import { projectFactory, resourceFactory } from "services/api/factory";
import {
  ApiFiltersListApiResponse,
  ApiResourcesListApiResponse,
  ApiResourcesRetrieveApiResponse,
  ApiProjectsRetrieveApiResponse,
} from "services/api/generated/api.generated";

import Navbar from "../Navbar";

const project = projectFactory.build();
const mapping = resourceFactory.build(
  {},
  { associations: { project: project.id } }
);

const handlers = [
  rest.get(`http://example.com/api/projects/${project.id}/`, (_, res, ctx) =>
    res(ctx.json<ApiProjectsRetrieveApiResponse>(project))
  ),
  rest.get(`http://example.com/api/resources/${mapping.id}/`, (_, res, ctx) =>
    res(ctx.json<ApiResourcesRetrieveApiResponse>(mapping))
  ),
  rest.get(`http://example.com/api/filters/`, (_, res, ctx) =>
    res(ctx.json<ApiFiltersListApiResponse>([]))
  ),
  rest.get(`http://example.com/api/resources/`, (_, res, ctx) =>
    res(
      ctx.json<ApiResourcesListApiResponse>([mapping])
    )
  ),
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  store.dispatch(resetState());
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Navigation breadcrumbs", () => {
  it("should only display the project name", async () => {
    render(<Navbar />, undefined, {
      path: "/projects/:projectId",
      route: `/projects/${project.id}`,
    });

    await waitFor(() => screen.getByText("project_1"));
  });

  it("should display the project name and mapping name", async () => {
    render(<Navbar />, undefined, {
      path: "/projects/:projectId/mappings/:mappingId",
      route: `/projects/${project.id}/mappings/${mapping.id}`,
    });

    await waitFor(() => screen.getByText("project_1"));
    await waitFor(() => screen.getByText("resource_1"));
  });
});
