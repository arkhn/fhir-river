import React from "react";

import { CircularProgress, Grid, makeStyles } from "@material-ui/core";

import { useApiProjectsListQuery } from "services/api/endpoints";

import ProjectCard from "./ProjectCard";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    flexGrow: 1,
    paddingBlock: theme.spacing(3),
  },
}));

const ProjectGrid = (): JSX.Element => {
  const classes = useStyles();
  const { isLoading, data: projects } = useApiProjectsListQuery({});

  return (
    <Grid className={classes.gridContainer} container spacing={3}>
      {isLoading ? (
        <CircularProgress />
      ) : (
        projects?.map((project) => (
          <Grid item key={project.id}>
            <ProjectCard project={project} />
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default ProjectGrid;
