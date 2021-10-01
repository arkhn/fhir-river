import { useState, useCallback } from "react";

import { isEqual } from "lodash";
import { useSnackbar } from "notistack";

import {
  useApiJoinsCreateMutation,
  useApiJoinsPartialUpdateMutation,
} from "services/api/endpoints";
import type { Join } from "services/api/generated/api.generated";

type UseJoinProps = {
  /**
   * Initial join value
   */
  initialJoin?: Partial<Join> | undefined;
  /**
   * Specifies if the object already exists in the backend
   */
  exists?: boolean;
};

const useJoin = ({
  initialJoin,
  exists,
}: UseJoinProps): [
  join: Partial<Join> | undefined,
  onChange: (join: Partial<Join>) => void
] => {
  const { enqueueSnackbar } = useSnackbar();
  const [join, setJoin] = useState<Partial<Join> | undefined>(initialJoin);

  const [createJoin] = useApiJoinsCreateMutation();
  const [partialUpdateJoin] = useApiJoinsPartialUpdateMutation();

  const onChange = useCallback(
    async (changedJoin: Partial<Join>) => {
      const isJoinPartial =
        !changedJoin.left || !changedJoin.right || !changedJoin.sql_input;
      if ((!exists || join) && !isJoinPartial && !isEqual(changedJoin, join)) {
        try {
          const apiJoin = changedJoin.id
            ? await partialUpdateJoin({
                id: changedJoin.id,
                patchedJoinRequest: changedJoin,
              }).unwrap()
            : await createJoin({
                joinRequest: changedJoin as Join,
              }).unwrap();
          setJoin(apiJoin);
        } catch (e) {
          enqueueSnackbar(e.error, { variant: "error" });
        }
      } else setJoin(changedJoin);
    },
    [exists, join, partialUpdateJoin, createJoin, enqueueSnackbar]
  );

  return [join, onChange];
};

export default useJoin;
