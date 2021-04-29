import React from "react";

import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

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
  leftContainer: { minWidth: 350, flex: 1 / 4 },
  rightContainer: { flex: 1 },
  scrollContainer: {
    overflowY: "auto",
  },
}));

const Mapping = (): JSX.Element => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.header}>
        <MappingHeader />
      </div>
      <div className={classes.body}>
        <div className={clsx(classes.leftContainer, classes.scrollContainer)}>
          {/** FHIR RESOURCE TREE */}
        </div>
        <div className={clsx(classes.rightContainer, classes.scrollContainer)}>
          {/** FHIR ATTRIBUTE DISPLAY */}
        </div>
      </div>
    </>
  );
};

export default Mapping;
