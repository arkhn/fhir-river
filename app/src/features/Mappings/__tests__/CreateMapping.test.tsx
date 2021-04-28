import React from "react";

import userEvent from "@testing-library/user-event";
import { ResponseComposition, rest, RestRequest } from "msw";
import { setupServer } from "msw/node";

import { resetState, store } from "app/store";
import { render, screen, waitFor } from "common/test/test-utils";
import {
  credentialFactory,
  ownerFactory,
  resourceFactory,
} from "services/api/factory";
import type {
  ApiOwnersListApiResponse,
  ApiCredentialsListApiResponse,
  ResourceRequest,
  ApiResourcesCreateApiResponse,
} from "services/api/generated/api.generated";

import CreateMapping from "../CreateMapping";
import { resourceAdded } from "../resourceSlice";

const resource = resourceFactory.build();
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

describe("Mapping creation page", () => {
  it("should do all the step to create a mapping (without filters)", async () => {
    store.dispatch(
      resourceAdded({
        id: resource.id,
        source: "sourceId",
      })
    );
    render(<CreateMapping />, undefined, {
      path: "/sources/:sourceId/mappings",
      route: `/sources/sourceId/mappings`,
    });
    await screen.findByText(/define a source table/i);
    await screen.findByText(/select a fhir resource/i);
    await screen.findByText(/choose a fhir profile/i);
    await screen.findByText(/name mapping/i);

    // primary_key_table selection
    userEvent.click(await screen.findByRole("textbox"));
    userEvent.click(await screen.findByRole("option", { name: /^table$/i }));

    // primary_key_column selection
    userEvent.click(
      await screen.findByRole("button", { name: /select column/i })
    );
    userEvent.click(await screen.findByRole("option", { name: /^column$/i }));

    userEvent.click(await screen.findByRole("button", { name: /next/i }));

    // Second step header text
    await screen.findByText(
      /^please select the fhir resource that you want to generate from the source$/i
    );

    // FHIR Resource selection
    userEvent.click(await screen.findByText(/account/i));
    userEvent.click(await screen.findByRole("button", { name: /next/i }));

    // Third step header text
    await screen.findByText(/^Please select a profile for the/i);

    userEvent.click(await screen.findByText(/default profile/i));
    userEvent.click(await screen.findByRole("button", { name: /next/i }));

    // Fourth step header text
    await screen.findByText(
      /^Almost there ! Give a user-friendly name to your mapping$/i
    );

    userEvent.type(
      screen.getByPlaceholderText(/type your name here/i),
      "mapping_name"
    );

    server.use(
      rest.post(
        "http://example.com/api/resources/",
        (
          req: RestRequest<ResourceRequest>,
          res: ResponseComposition<ApiResourcesCreateApiResponse>,
          ctx
        ) =>
          res.once(
            ctx.json<ApiResourcesCreateApiResponse>({
              ...resource,
              ...req.body,
            })
          )
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole("button", { name: /next/i }))
    );

    await waitFor(() =>
      expect(screen.getByTestId("location-display")).toHaveTextContent(
        "sources/sourceId/mappings/1"
      )
    );
  });
});
