import { IStructureDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { ResponseComposition, rest } from "msw";
import { setupServer } from "msw/node";

import { renderHook, waitFor } from "common/test/test-utils";
import {
  resourceFactory,
  structureDefinitionFactory,
} from "services/api/factory";
import { ApiAttributesListApiResponse } from "services/api/generated/api.generated";

import * as resourceTreeSliceUtils from "../resourceTreeSlice";
import useFhirResourceTreeData from "../useFhirResourceTreeData";

const mapping = resourceFactory.build({
  primary_key_owner: "public",
  primary_key_table: "table",
  primary_key_column: "column",
});

const structureDefinition = structureDefinitionFactory.build();

const handlers = [
  rest.get(
    "http://example.com/api/fhir/StructureDefinition/:definitionId",
    (_, res: ResponseComposition<IStructureDefinition>, ctx) =>
      res(ctx.json<IStructureDefinition>(structureDefinition))
  ),
  rest.get(
    "http://example.com/api/attributes/",
    (_, res: ResponseComposition<ApiAttributesListApiResponse>, ctx) =>
      res(ctx.json<ApiAttributesListApiResponse>([]))
  ),
];

const server = setupServer(...handlers);
const spyResourceTreeSliceStateReseted = jest.spyOn(
  resourceTreeSliceUtils,
  "resourceTreeSliceStateReseted"
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

describe("useFhirResourceTreeData", () => {
  it("should return a tree and reset store state when unmounted", async () => {
    const { result, unmount } = renderHook(
      useFhirResourceTreeData,
      { initialProps: { definitionId: "Observation" } },
      {
        path: "/projects/:projectId/mappings/:mappingId",
        route: `/projects/projectId/mappings/${mapping.id}`,
      }
    );

    await waitFor(() => {
      expect(result.current.rootElementNode).not.toBeUndefined();
    });

    unmount();

    // Expect to reset state when hook unmounts
    expect(spyResourceTreeSliceStateReseted).toHaveBeenCalledTimes(1);
  });
});
