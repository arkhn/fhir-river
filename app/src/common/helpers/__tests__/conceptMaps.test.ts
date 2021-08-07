import { IConceptMap } from "@ahryman40k/ts-fhir-types/lib/R4";

import {
  getConceptMapIdsFromMappings,
  getConceptMappingFromResource,
  mergeConceptMapsToMappings,
  CustomConceptMapById,
} from "common/helpers/conceptMaps";
import { Mapping } from "services/api/generated/api.generated";

import conceptMaps from "./data/conceptMaps.json";
import mappings from "./data/mappings.json";
import mappingsWithConceptMaps from "./data/mappingsWithConceptMaps.json";

describe("concept maps", () => {
  test("getting concept map ids from a mapping", () => {
    const conceptMapIds = getConceptMapIdsFromMappings(mappings as Mapping);

    expect(conceptMapIds).toMatchObject(conceptMaps.map(({ id }) => id));
  });

  test("getting a custom concept map from a ConceptMap resource", () => {
    const customConceptMap =
      conceptMaps?.[0] &&
      getConceptMappingFromResource(conceptMaps[0] as IConceptMap);

    expect(customConceptMap).toMatchObject({
      F: "female",
      M: "male",
    });
  });

  test("merging custom concept maps to a mapping", () => {
    const conceptMapsById: CustomConceptMapById = conceptMaps.reduce(
      (acc, conceptMap) => ({
        [conceptMap.id]: getConceptMappingFromResource(
          conceptMap as IConceptMap
        ),
        ...acc,
      }),
      {} as CustomConceptMapById
    );
    const _mappingsWithConceptMaps = mergeConceptMapsToMappings(
      mappings as Mapping,
      conceptMapsById
    );

    expect(_mappingsWithConceptMaps).toMatchObject(mappingsWithConceptMaps);
  });
});
