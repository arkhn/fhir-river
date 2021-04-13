import React, { useMemo, useRef, useState } from "react";

import { Container, Button, makeStyles, Typography } from "@material-ui/core";
import BackIcon from "@material-ui/icons/ArrowBackIos";
import clsx from "clsx";
import { useHistory } from "react-router-dom";

import StepPanel from "common/Stepper/StepPanel";
import MappingCreationStepper from "features/mappings/MappingCreationStepper";
import TableStep from "features/mappings/TableStep";
import { Resource } from "services/api/generated/api.generated";

const FOOTER_HEIGHT = 150;

const useStyles = makeStyles((theme) => ({
  footerContainer: {
    height: FOOTER_HEIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0px 0px 10px ${theme.palette.divider}`,
    width: "100%",
  },
  rootContainer: {
    height: `calc(100vh - ${FOOTER_HEIGHT + theme.spacing(10)}px)`,
  },
  scrollContainer: {
    paddingTop: theme.spacing(5),
    overflowY: "auto",
  },
  button: {
    margin: theme.spacing(2),
    textTransform: "none",
  },
  previousButton: {
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "inherit",
      color: theme.palette.text.primary,
    },
  },
  absolute: {
    position: "absolute",
  },
}));

const CreateMapping = (): JSX.Element => {
  const stepperRef = useRef<HTMLDivElement>();
  const classes = useStyles();
  const history = useHistory();
  const [activeStep, setActiveStep] = useState(0);
  const [mapping, setMapping] = useState<Partial<Resource>>({});
  const isNextDisabled = useMemo((): boolean => {
    let isDisabled = true;
    switch (activeStep) {
      case 0:
        isDisabled =
          mapping.primary_key_table === undefined ||
          mapping.primary_key_column === undefined;
        break;
      case 1:
        isDisabled = mapping.definition_id === undefined;
        break;
      case 2:
        break;
      case 3:
        break;

      default:
        break;
    }

    return isDisabled;
  }, [activeStep, mapping]);

  const updateMapping = (newMapping: Partial<Resource>) => {
    setMapping({ ...mapping, ...newMapping });
  };
  const handlePrevStep = () => {
    activeStep > 0 && setActiveStep(activeStep - 1);
  };
  const handleNextStep = () => {
    activeStep < 3 && setActiveStep(activeStep + 1);
  };
  const handleCancelClick = () => {
    history.goBack();
  };

  return (
    <>
      <Button
        className={clsx(
          classes.button,
          classes.previousButton,
          classes.absolute
        )}
        startIcon={<BackIcon />}
        onClick={handleCancelClick}
        disableRipple
      >
        <Typography>Cancel</Typography>
      </Button>
      <Container className={classes.rootContainer}>
        <MappingCreationStepper ref={stepperRef} activeStep={activeStep} />
        <div
          className={classes.scrollContainer}
          style={{
            height: `calc(100% - ${stepperRef.current?.clientHeight}px)`,
          }}
        >
          <StepPanel index={0} value={activeStep}>
            <TableStep mapping={mapping} onChange={updateMapping} />
          </StepPanel>
          <StepPanel index={1} value={activeStep}>
            <Typography>Truc</Typography>
          </StepPanel>
          <StepPanel index={2} value={activeStep}>
            <Typography>Muche</Typography>
          </StepPanel>
          <StepPanel index={3} value={activeStep}>
            <Typography>Chouette</Typography>
          </StepPanel>
        </div>
      </Container>
      <div className={classes.footerContainer}>
        <Button
          className={clsx(classes.button, classes.previousButton)}
          onClick={handlePrevStep}
          disableRipple
        >
          <Typography>Previous step</Typography>
        </Button>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          onClick={handleNextStep}
          disabled={isNextDisabled}
        >
          <Typography>Next</Typography>
        </Button>
      </div>
    </>
  );
};

export default CreateMapping;
