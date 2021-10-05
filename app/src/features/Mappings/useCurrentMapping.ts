import { useParams } from "react-router";

import { useApiResourcesRetrieveQuery } from "services/api/endpoints";
import type { Resource } from "services/api/generated/api.generated";

const useCurrentMapping = (): {
  data: Resource | undefined;
  isLoading: boolean;
} => {
  const { mappingId } = useParams<{ mappingId?: Resource["id"] }>();

  const { data, isLoading } = useApiResourcesRetrieveQuery(
    { id: mappingId ?? "" },
    { skip: !mappingId }
  );

  return { data, isLoading };
};

export default useCurrentMapping;
