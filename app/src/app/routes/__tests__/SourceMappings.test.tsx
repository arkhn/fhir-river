import React from "react";

import { ResponseComposition, rest } from "msw";
import { setupServer } from "msw/node";

import { resetState, store } from "app/store";
import { render, screen, waitFor } from "common/test/test-utils";
import {
  attributeFactory,
  filterFactory,
  resourceFactory,
  sourceFactory,
} from "services/api/factory";
import {
  ApiResourcesListApiResponse,
  ApiFiltersListApiResponse,
  ApiAttributesListApiResponse,
  ApiSourcesRetrieveApiResponse,
} from "services/api/generated/api.generated";

import SourceMappings from "../SourceMappings";

const source = sourceFactory.build();
const source_resource = resourceFactory.build(
  {},
  { associations: { source: source.id } }
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
    res(ctx.json<ApiSourcesRetrieveApiResponse>(source))
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
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  store.dispatch(resetState());
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Source mappings page", () => {
  it("should display the existing mappings", async () => {
    render(<SourceMappings />, undefined, {
      path: "/source/:sourceId",
      route: `/source/${source.id}`,
    });

    await waitFor(() => screen.getByText("resource_1"));
  });
});
