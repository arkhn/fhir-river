import { useState, useCallback } from "react";

import { isEqual } from "lodash";

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

/**
 * Hook handling pending joins the same way a classic useState hook would.
 * It supports back join creation & updates.
 * @returns A tuple with the pending join stored in state & an onChange function
 */
const useJoin = ({
  initialJoin,
  exists,
}: UseJoinProps): [
  join: Partial<Join> | undefined,
  onChange: (join: Partial<Join>) => void
] => {
  const [join, setJoin] = useState<Partial<Join> | undefined>(initialJoin);

  const [createJoin] = useApiJoinsCreateMutation();
  const [partialUpdateJoin] = useApiJoinsPartialUpdateMutation();

  const onChange = useCallback(
    async (changedJoin: Partial<Join>) => {
      const isJoinPartial =
        !changedJoin.left || !changedJoin.right || !changedJoin.sql_input;
      if ((!exists || join) && !isJoinPartial && !isEqual(changedJoin, join)) {
        const apiJoin = changedJoin.id
          ? await partialUpdateJoin({
              id: changedJoin.id,
              patchedJoinRequest: changedJoin,
            }).unwrap()
          : await createJoin({
              joinRequest: changedJoin as Join,
            }).unwrap();
        setJoin(apiJoin);
      } else setJoin(changedJoin);
    },
    [exists, join, partialUpdateJoin, createJoin]
  );

  return [join, onChange];
};

export default useJoin;
