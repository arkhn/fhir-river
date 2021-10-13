import React from "react";

import { Container, makeStyles } from "@material-ui/core";

import ProjectCreate from "features/Projects/ProjectCreate";
import ProjectDrawer from "features/Projects/ProjectDrawer";
import ProjectGrid from "features/Projects/ProjectGrid";
import UploadProjectButton from "features/Projects/UploadProjectButton";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    flexGrow: 1,
    paddingTop: theme.spacing(2),
  },
  container: {
    padding: theme.spacing(5, 8),
  },
}));

const Projects = (): JSX.Element => {
  const classes = useStyles();

  return (
    <Container maxWidth="xl" className={classes.container}>
      <ProjectCreate />
      <UploadProjectButton />
      <ProjectGrid />
      <ProjectDrawer />
    </Container>
  );
};

export default Projects;
