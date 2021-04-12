import React, { useRef, useState } from "react";

import { Container, Button, makeStyles, Typography } from "@material-ui/core";
import BackIcon from "@material-ui/icons/ArrowBackIos";
import clsx from "clsx";
import { useHistory } from "react-router-dom";

import MappingCreationStepper from "features/mappingCreation/MappingCreationStepper";

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
        ></div>
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
        >
          <Typography>Next</Typography>
        </Button>
      </div>
    </>
  );
};

export default CreateMapping;
