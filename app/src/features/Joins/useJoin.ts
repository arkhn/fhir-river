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
    async (_join: Partial<Join>) => {
      const isJoinPartial = !_join.left || !_join.right || !_join.sql_input;
      if ((!exists || join) && !isJoinPartial && !isEqual(_join, join)) {
        try {
          const join_ = _join.id
            ? await partialUpdateJoin({
                id: _join.id,
                patchedJoinRequest: _join,
              }).unwrap()
            : await createJoin({
                joinRequest: _join as Join,
              }).unwrap();
          setJoin(join_);
        } catch (e) {
          enqueueSnackbar(e.error, { variant: "error" });
        }
      } else setJoin(_join);
    },
    [exists, join, partialUpdateJoin, createJoin, enqueueSnackbar]
  );

  return [join, onChange];
};

export default useJoin;
