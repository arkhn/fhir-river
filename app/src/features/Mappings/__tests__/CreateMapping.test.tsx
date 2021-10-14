import React from "react";

import {
  IStructureDefinition,
  IValueSet,
  StructureDefinitionDerivationKind,
} from "@ahryman40k/ts-fhir-types/lib/R4";
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

import CreateMapping from "../Create/CreateMapping";
import { resourceAdded } from "../resourceSlice";

const resource = resourceFactory.build();
const credential = credentialFactory.build();
const owner = ownerFactory.build(
  {},
  { associations: { credential: credential.id } }
);
const accountStructureDef: IStructureDefinition = {
  resourceType: "StructureDefinition",
  title: "Account",
  name: "Account",
  type: "Account",
  id: "Account",
  derivation: StructureDefinitionDerivationKind._specialization,
};

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
  rest.get(
    new RegExp("http://example.com/api/fhir/ValueSet/resource-types/\\$expand"),
    (_, res: ResponseComposition<IValueSet>, ctx) =>
      res(
        ctx.json<IValueSet>({
          resourceType: "ValueSet",
          expansion: { contains: [{ code: "Account" }] },
        })
      )
  ),
  rest.get(
    "http://example.com/api/fhir/StructureDefinition",
    (_, res: ResponseComposition<IStructureDefinition[]>, ctx) =>
      res(
        ctx.json<IStructureDefinition[]>([accountStructureDef])
      )
  ),
  rest.get(
    "http://example.com/api/fhir/StructureDefinition/Account",
    (_, res: ResponseComposition<IStructureDefinition>, ctx) =>
      res(ctx.json<IStructureDefinition>(accountStructureDef))
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
        project: "projectId",
      })
    );
    render(<CreateMapping />, undefined, {
      path: "/projects/:projectId/mappings",
      route: `/projects/projectId/mappings`,
    });
    await screen.findByText(/define a project table/i);
    await screen.findByText(/select a fhir resource/i);
    await screen.findByText(/choose a fhir profile/i);
    await screen.findByText(/name mapping/i);

    // primary_key_table selection
    userEvent.click(await screen.findByPlaceholderText(/select table/i));
    userEvent.click(await screen.findByRole("option", { name: /^table$/i }));

    // primary_key_column selection
    userEvent.click(await screen.findByPlaceholderText(/select column/i));
    userEvent.click(await screen.findByRole("option", { name: /^column$/i }));

    userEvent.click(await screen.findByRole("button", { name: /next/i }));

    // Second step header text
    await screen.findByText(
      /^please select the fhir resource that you want to generate from the project$/i
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
        "projects/projectId/mappings/1"
      )
    );
  });
});
