import React, { useEffect } from "react";

import { isEqual } from "lodash";

import useColumn from "features/Columns/useColumn";
import JoinSelect from "features/Joins/JoinSelect";
import { useApiColumnsRetrieveQuery } from "services/api/endpoints";
import { Join as JoinType } from "services/api/generated/api.generated";
import { Column } from "services/api/generated/api.generated";

import useJoin from "./useJoin";

type JoinProps = {
  join: Partial<JoinType>;
  onDelete: () => void;
};

const Join = ({ join, onDelete }: JoinProps): JSX.Element => {
  const {
    data: apiLeftColumn,
    isUninitialized: isLeftColumnUninitialized,
  } = useApiColumnsRetrieveQuery({ id: join.left ?? "" }, { skip: !join.left });
  const {
    data: apiRightColumn,
    isUninitialized: isRightColumnUninitialized,
  } = useApiColumnsRetrieveQuery(
    { id: join.right ?? "" },
    { skip: !join.right }
  );

  const [leftColumn, setLeftColumn] = useColumn({
    initialColumn: apiLeftColumn,
    exists: !isLeftColumnUninitialized,
  });
  // As soon as the left column is fetched, we set its value
  useEffect(() => {
    if (apiLeftColumn && !leftColumn) setLeftColumn(apiLeftColumn);
  }, [apiLeftColumn, setLeftColumn, leftColumn]);

  const [rightColumn, setRightColumn] = useColumn({
    initialColumn: apiRightColumn,
    exists: !isRightColumnUninitialized,
  });
  // As soon as the right column is fetched, we set its value
  useEffect(() => {
    if (apiRightColumn && !rightColumn) setRightColumn(apiRightColumn);
  }, [apiRightColumn, setRightColumn, rightColumn]);

  const [_join, setJoin] = useJoin({ initialJoin: join });
  // As soon as the left/right columns are created, we add their ids to the join
  useEffect(() => {
    if (!_join?.left && leftColumn?.id)
      setJoin({ ..._join, left: leftColumn.id });
  }, [_join, leftColumn?.id, setJoin]);
  useEffect(() => {
    if (!_join?.right && rightColumn?.id)
      setJoin({ ..._join, right: rightColumn.id });
  }, [_join, rightColumn?.id, setJoin]);

  const handleJoinChange = async (
    _leftColumn: Partial<Column>,
    _rightColumn: Partial<Column>
  ) => {
    if (!isEqual(leftColumn, _leftColumn)) setLeftColumn(_leftColumn);
    else setRightColumn(_rightColumn);
  };

  return (
    <JoinSelect
      key={`join-${join.id}`}
      leftColumn={leftColumn ?? {}}
      rightColumn={rightColumn ?? {}}
      onChange={handleJoinChange}
      onDelete={onDelete}
    />
  );
};

export default Join;
