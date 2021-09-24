import { useState, useCallback } from "react";

import { isEqual } from "lodash";

import {
  useApiJoinsCreateMutation,
  useApiJoinsPartialUpdateMutation,
} from "services/api/endpoints";
import type { Join } from "services/api/generated/api.generated";

type UseJoinProps = Partial<Join> | undefined;

const useJoin = (
  initialJoin: UseJoinProps
): [
  Join: Partial<Join> | undefined,
  onChange: (Join: Partial<Join>) => void
] => {
  const [Join, setJoin] = useState<Partial<Join> | undefined>(initialJoin);

  const [createJoin] = useApiJoinsCreateMutation();
  const [partialUpdateJoin] = useApiJoinsPartialUpdateMutation();

  const onChange = useCallback(
    async (_join: Partial<Join>) => {
      const isJoinPartial = !_join.left || !_join.right || !_join.sql_input;
      if (!isJoinPartial && !isEqual(_join, Join)) {
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
          // TODO: use snackbar
          console.error(e);
        }
      } else setJoin(_join);
    },
    [Join, createJoin, partialUpdateJoin]
  );

  return [Join, onChange];
};

export default useJoin;
