import React from "react";

interface StepPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const StepPanel = ({
  children,
  value,
  index,
  ...other
}: StepPanelProps): JSX.Element => (
  <div role="stepPanel" hidden={value !== index} {...other}>
    {children}
  </div>
);

export default StepPanel;
