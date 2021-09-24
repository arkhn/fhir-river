import React, { useEffect } from "react";

import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
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
  const { data: apiLeftColumn } = useApiColumnsRetrieveQuery(
    { id: join.left ?? "" },
    { skip: !join.left }
  );
  const { data: apiRightColumn } = useApiColumnsRetrieveQuery(
    { id: join.right ?? "" },
    { skip: !join.right }
  );

  const [leftColumn, setLeftColumn] = useColumn(apiLeftColumn);
  // As soon as the left column is fetched, we set its value
  useEffect(() => {
    if (apiLeftColumn) setLeftColumn(apiLeftColumn);
  }, [apiLeftColumn, setLeftColumn]);

  const [rightColumn, setRightColumn] = useColumn(apiRightColumn);
  // As soon as the right column is fetched, we set its value
  useEffect(() => {
    if (apiRightColumn) setRightColumn(apiRightColumn);
  }, [apiRightColumn, setRightColumn]);

  const [_join, setJoin] = useJoin(join);
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

  if (!leftColumn || !rightColumn) return <CircularProgress />;

  return (
    <JoinSelect
      key={`join-${join.id}`}
      leftColumn={leftColumn}
      rightColumn={rightColumn}
      onChange={handleJoinChange}
      onDelete={onDelete}
    />
  );
};

export default Join;
