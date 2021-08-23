import type { IConceptMap } from "@ahryman40k/ts-fhir-types/lib/R4";

import type { Mapping } from "services/api/generated/api.generated";

export type CustomConceptMap = Record<string, string>;
export type CustomConceptMapById = Record<string, CustomConceptMap | undefined>;

export const getConceptMapIdsFromMappings = (mappings: Mapping): string[] =>
  mappings.resources?.reduce(
    (acc, resource) =>
      resource.attributes
        ? [
            ...acc,
            ...resource.attributes.reduce(
              (acc, attribute) =>
                attribute.input_groups
                  ? [
                      ...acc,
                      ...attribute.input_groups.reduce(
                        (acc, input_group) =>
                          input_group.inputs
                            ? [
                                ...acc,
                                ...input_group.inputs.reduce(
                                  (acc, input) =>
                                    input.concept_map_id
                                      ? [...acc, input.concept_map_id]
                                      : acc,
                                  [] as string[]
                                ),
                              ]
                            : acc,
                        [] as string[]
                      ),
                    ]
                  : acc,
              [] as string[]
            ),
          ]
        : acc,
    [] as string[]
  ) ?? [];

/**
 * getConceptMappingFromResource extracts the mapping from a ConceptMap resource
 * @param conceptMap
 * @returns a simple object with the concept mapping
 * Example: { "F": "female", "M": "male" }
 * we only handle a single target for each source
 */
export const getConceptMappingFromResource = (
  conceptMap: IConceptMap
): CustomConceptMap | undefined =>
  conceptMap.group?.reduce(
    (acc, group) => ({
      ...group.element.reduce(
        (acc, el) =>
          el.code && el.target?.[0]?.code
            ? { [el.code]: el.target?.[0]?.code, ...acc }
            : acc,
        {} as CustomConceptMap
      ),
      ...acc,
    }),
    {} as CustomConceptMap
  );

/**
 * mergeConceptMapsToMappings associates the transformed concept maps to their Inputs
 * @param mappings
 * @param conceptMapsById
 * @returns a mapping with conceptmaps
 */
export const mergeConceptMapsToMappings = (
  mappings: Mapping,
  conceptMapsById: CustomConceptMapById
): Mapping => ({
  ...mappings,
  resources: mappings.resources?.map((resource) => ({
    ...resource,
    attributes: resource.attributes?.map((attribute) => ({
      ...attribute,
      input_groups: attribute.input_groups?.map((input_group) => ({
        ...input_group,
        inputs: input_group.inputs?.map((input) =>
          input.concept_map_id
            ? {
                ...input,
                concept_map: conceptMapsById[input.concept_map_id],
              }
            : { ...input }
        ),
      })),
    })),
  })),
});
