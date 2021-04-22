import React from "react";

import { rest } from "msw";
import { setupServer } from "msw/node";

import { resetState, store } from "app/store";
import { render, screen, waitFor } from "common/test/test-utils";
import { sourceFactory } from "services/api/factory";
import { ApiSourcesRetrieveApiResponse } from "services/api/generated/api.generated";

import NavigationBreadcrumbs from "../NavigationBreadcrumbs";

const source = sourceFactory.build();

const handlers = [
  rest.get("http://example.com/api/sources/:id/", (_, res, ctx) =>
    res(ctx.json<ApiSourcesRetrieveApiResponse>(source))
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
  it("should display the source name", async () => {
    render(<NavigationBreadcrumbs />, undefined, {
      path: "/sources/:sourceId",
      route: `/sources/${source.id}`,
    });

    await waitFor(() => screen.getByText("source_1"));
  });
});
