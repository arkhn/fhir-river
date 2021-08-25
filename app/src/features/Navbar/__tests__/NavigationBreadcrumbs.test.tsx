import React from "react";

import { rest } from "msw";
import { setupServer } from "msw/node";

import { resetState, store } from "app/store";
import { render, screen, waitFor } from "common/test/test-utils";
import { sourceFactory, resourceFactory } from "services/api/factory";
import {
  ApiFiltersListApiResponse,
  ApiResourcesListApiResponse,
  ApiResourcesRetrieveApiResponse,
  ApiSourcesRetrieveApiResponse,
} from "services/api/generated/api.generated";

import Navbar from "../Navbar";

const source = sourceFactory.build();
const mapping = resourceFactory.build(
  {},
  { associations: { source: source.id } }
);

const handlers = [
  rest.get(`http://example.com/api/sources/${source.id}/`, (_, res, ctx) =>
    res(ctx.json<ApiSourcesRetrieveApiResponse>(source))
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
  it("should only display the source name", async () => {
    render(<Navbar />, undefined, {
      path: "/sources/:sourceId",
      route: `/sources/${source.id}`,
    });

    await waitFor(() => screen.getByText("source_1"));
  });

  it("should display the source name and mapping name", async () => {
    render(<Navbar />, undefined, {
      path: "/sources/:sourceId/mappings/:mappingId",
      route: `/sources/${source.id}/mappings/${mapping.id}`,
    });

    await waitFor(() => screen.getByText("source_1"));
    await waitFor(() => screen.getByText("resource_1"));
  });
});
