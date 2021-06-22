import React from "react";

import { PendingCondition } from "features/Conditions/conditionSlice";

type ConditionProps = {
  condition: PendingCondition;
};

const Condition = ({ condition }: ConditionProps): JSX.Element => {
  console.log(condition);
  return <></>;
};

export default Condition;
