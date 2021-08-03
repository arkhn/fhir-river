import React from "react";

import { Container, makeStyles } from "@material-ui/core";

import BatchCreate from "features/Batches/BatchCreate";
import BatchList from "features/Batches/BatchList";
import NavigationBreadcrumbs from "features/NavigationBreadcrumbs/NavigationBreadcrumbs";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: theme.mixins.breadcrumbBar.height,
    padding: theme.spacing(0, 5),
  },
}));

const Batches = (): JSX.Element => {
  const classes = useStyles();
  return (
    <Container maxWidth="xl">
      <div className={classes.header}>
        <NavigationBreadcrumbs />
      </div>
      <BatchCreate />
      <BatchList />
    </Container>
  );
};

export default Batches;
