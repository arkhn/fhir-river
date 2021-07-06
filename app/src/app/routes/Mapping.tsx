import React from "react";

import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

import FhirAttributePanel from "features/FhirAttributePanel/FhirAttributePanel";
import FhirResourceTree from "features/FhirResourceTree/FhirResourceTree";
import MappingHeader from "features/Mappings/MappingHeader";

const useStyles = makeStyles((theme) => ({
  header: {
    height: theme.mixins.breadcrumbBar.height,
  },
  body: {
    display: "flex",
    height: `calc(100vh - ${
      Number(theme.mixins.breadcrumbBar.height) + theme.spacing(10)
    }px)`,
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

const Mapping = (): JSX.Element => {
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

export default Mapping;
