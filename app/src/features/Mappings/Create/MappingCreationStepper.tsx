import React, { forwardRef } from "react";

import { Stepper, Step, StepLabel, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import StepConnector from "common/components/Stepper/StepConnector";
import StepIcon from "common/components/Stepper/StepIcon";

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: "inherit",
  },
}));

type MappingCreationStepperProps = {
  activeStep?: number;
};

const MappingCreationStepper = forwardRef(
  ({ activeStep }: MappingCreationStepperProps, ref) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
      <Stepper
        className={classes.root}
        alternativeLabel
        activeStep={activeStep}
        connector={<StepConnector />}
        ref={ref}
      >
        <Step>
          <StepLabel StepIconComponent={StepIcon}>
            {t("defineSourceTable")}
          </StepLabel>
        </Step>
        <Step>
          <StepLabel StepIconComponent={StepIcon}>
            {t("selectFhirResource")}
          </StepLabel>
        </Step>
        <Step>
          <StepLabel StepIconComponent={StepIcon}>
            {t("chooseFhirProfile")}
          </StepLabel>
        </Step>
        <Step>
          <StepLabel StepIconComponent={StepIcon}>{t("nameMapping")}</StepLabel>
        </Step>
      </Stepper>
    );
  }
);

MappingCreationStepper.displayName = "MappingCreationStepper";

export default MappingCreationStepper;
