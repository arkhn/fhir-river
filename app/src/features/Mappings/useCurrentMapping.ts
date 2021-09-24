import { useParams } from "react-router";

import { useApiResourcesRetrieveQuery } from "services/api/endpoints";
import { Resource } from "services/api/generated/api.generated";

const useCurrentMapping = (): Resource | undefined => {
  const { mappingId } = useParams<{ mappingId?: Resource["id"] }>();

  const { data: mapping } = useApiResourcesRetrieveQuery(
    { id: mappingId ?? "" },
    { skip: !mappingId }
  );

  return mapping;
};

export default useCurrentMapping;
