import React from "react";

import { InputGroup } from "services/api/generated/api.generated";

type AttributeInputGroupProps = {
  inputGroup: InputGroup;
};

const AttributeInputGroup = ({
  inputGroup,
}: AttributeInputGroupProps): JSX.Element => {
  console.log(inputGroup);
  return <></>;
};

export default AttributeInputGroup;
