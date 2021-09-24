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
  join: Partial<Join> | undefined,
  onChange: (join: Partial<Join>) => void
] => {
  const [join, setJoin] = useState<Partial<Join> | undefined>(initialJoin);

  const [createJoin] = useApiJoinsCreateMutation();
  const [partialUpdateJoin] = useApiJoinsPartialUpdateMutation();

  const onChange = useCallback(
    async (_join: Partial<Join>) => {
      const isJoinPartial = !_join.left || !_join.right || !_join.sql_input;
      if (join && !isJoinPartial && !isEqual(_join, join)) {
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
    [join, createJoin, partialUpdateJoin]
  );

  return [join, onChange];
};

export default useJoin;
