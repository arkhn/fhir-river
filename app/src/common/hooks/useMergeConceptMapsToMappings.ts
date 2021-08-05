import { useApiConceptMapsListQuery } from "services/api/endpoints";
import type { Mapping } from "services/api/generated/api.generated";

const useMergeConceptMapsToMappings = (params: {
  mappings?: Mapping;
}): Mapping | undefined => {
  const { mappings } = params;

  const ids =
    mappings?.resources?.reduce(
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

  // NOTE we only handle a single target for each source
  const { conceptMapsById } = useApiConceptMapsListQuery(
    { ids: ids },
    {
      skip: !ids,
      selectFromResult: ({ data: conceptMaps }) => ({
        conceptMapsById:
          conceptMaps?.reduce(
            (acc, conceptMap) =>
              conceptMap.id
                ? {
                    [conceptMap.id]: conceptMap.group?.reduce(
                      (acc, group) => ({
                        ...group.element.reduce(
                          (acc, el) =>
                            el.code
                              ? { [el.code]: el.target?.[0]?.code, ...acc }
                              : acc,
                          {} as Record<string, string | undefined>
                        ),
                        ...acc,
                      }),
                      {} as Record<string, string | undefined>
                    ),
                    ...acc,
                  }
                : acc,
            {} as Record<string, Record<string, string | undefined> | undefined>
          ) ?? {},
      }),
    }
  );

  for (const resource of mappings?.resources ?? []) {
    for (const attribute of resource.attributes ?? []) {
      for (const input_group of attribute.input_groups ?? []) {
        for (const input of input_group.inputs ?? []) {
          if (input.concept_map_id)
            input.concept_map = conceptMapsById[input.concept_map_id];
        }
      }
    }
  }

  return mappings;
};

export default useMergeConceptMapsToMappings;
