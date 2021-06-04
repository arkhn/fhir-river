import React from "react";

import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

import FhirAttributePanel from "features/FhirAttributePanel/FhirAttributePanel";
import FhirResourceTree from "features/FhirResourceTree/FhirResourceTree";
import MappingHeader from "features/Mappings/MappingHeader";

const HEADER_HEIGHT = 100;

const useStyles = makeStyles((theme) => ({
  header: {
    height: HEADER_HEIGHT,
  },
  body: {
    display: "flex",
    height: `calc(100vh - ${HEADER_HEIGHT + theme.spacing(10)}px)`,
  },
  leftContainer: {
    minWidth: 350,
    flex: 1 / 2,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  rightContainer: { flex: 1 },
  scrollContainer: {
    overflowY: "auto",
  },
}));

const Mappings = (): JSX.Element => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.header}>
        <MappingHeader />
      </div>
      <div className={classes.body}>
        <div className={clsx(classes.leftContainer, classes.scrollContainer)}>
          <FhirResourceTree />
        </div>
        <div className={clsx(classes.rightContainer, classes.scrollContainer)}>
          <FhirAttributePanel />
        </div>
      </div>
    </>
  );
};

export default Mappings;
