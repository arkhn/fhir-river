import React, { useState } from "react";

import { Container, Button, makeStyles, Typography } from "@material-ui/core";

import MappingCreationStepper from "features/mappingCreation/MappingCreationStepper";

const useStyles = makeStyles((theme) => ({
  footerContainer: {
    position: "fixed",
    bottom: 0,
    height: 150,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0px 0px 10px ${theme.palette.divider}`,
    width: "100%",
  },
  button: {
    margin: theme.spacing(2),
    textTransform: "none",
  },
}));

const CreateMapping = (): JSX.Element => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);

  const handlePrevStep = () => {
    activeStep > 0 && setActiveStep(activeStep - 1);
  };
  const handleNextStep = () => {
    activeStep < 3 && setActiveStep(activeStep + 1);
  };
  return (
    <>
      <Container>
        <MappingCreationStepper activeStep={activeStep} />
      </Container>
      <div className={classes.footerContainer}>
        <Button className={classes.button} onClick={handlePrevStep}>
          <Typography color="textSecondary">Previous step</Typography>
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
