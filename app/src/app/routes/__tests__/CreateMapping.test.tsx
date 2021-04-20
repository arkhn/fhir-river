import React from "react";

import userEvent from "@testing-library/user-event";
import { ResponseComposition, rest } from "msw";
import { setupServer } from "msw/node";

import { resetState, store } from "app/store";
import { render, screen, waitFor } from "common/test/test-utils";
import { credentialFactory, ownerFactory } from "services/api/factory";
import {
  ApiOwnersListApiResponse,
  ApiCredentialsListApiResponse,
} from "services/api/generated/api.generated";

import CreateMapping from "../CreateMapping";

const credential = credentialFactory.build();
const owner = ownerFactory.build(
  {},
  { associations: { credential: credential.id } }
);

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
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  store.dispatch(resetState());
});
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

describe("Mapping creation page", () => {
  render(<CreateMapping />, undefined, {
    route: `/source/sourceId/mapping`,
  });

  it("should display the stepper with 4 steps", async () => {
    screen.getByText(/define a source table/i);
    screen.getByText(/select a fhir resource/i);
    screen.getByText(/choose a fhir profile/i);
    screen.getByText(/name mapping/i);

    await screen.findByRole("button", { name: /select table/i });
    await screen.findByRole("button", { name: /select column/i });
  });

  it("should be at 1st step", async () => {
    await screen.findByRole("button", { name: /select table/i });
  });

  it("should go to 2nd step", () => {
    userEvent.click(screen.getByRole("button", { name: /select table/i }));
    userEvent.click(screen.getByRole("option", { name: /table/i }));
  });
});
