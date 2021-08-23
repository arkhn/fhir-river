import {
  getConceptMapIdsFromMappings,
  getConceptMappingFromResource,
  mergeConceptMapsToMappings,
  CustomConceptMapById,
} from "common/helpers/conceptMaps";
import { useApiConceptMapsListQuery } from "services/api/endpoints";
import type { Mapping } from "services/api/generated/api.generated";

const useMergeConceptMapsToMappings = (params: {
  mappings?: Mapping;
}): Mapping | undefined => {
  const { mappings } = params;

  const conceptMapIds = mappings && getConceptMapIdsFromMappings(mappings);

  const { conceptMapsById } = useApiConceptMapsListQuery(
    { ids: conceptMapIds },
    {
      skip: !conceptMapIds,
      selectFromResult: ({ data: conceptMaps }) => ({
        conceptMapsById: conceptMaps?.reduce(
          (acc, conceptMap) =>
            conceptMap.id
              ? {
                  [conceptMap.id]: getConceptMappingFromResource(conceptMap),
                  ...acc,
                }
              : acc,
          {} as CustomConceptMapById
        ),
      }),
    }
  );

  return (
    mappings &&
    conceptMapsById &&
    mergeConceptMapsToMappings(mappings, conceptMapsById)
  );
};

export default useMergeConceptMapsToMappings;
