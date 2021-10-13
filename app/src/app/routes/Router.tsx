import React from "react";

import { makeStyles } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Batches from "app/routes/Sources/Batches/Batches";
import CreateMapping from "features/Mappings/Create/CreateMapping";
import EditMapping from "features/Mappings/Edit/EditMapping";
import Preview from "features/Preview/Preview";

import { PUBLIC_URL } from "../../constants";
import AppBar from "./AppBar";
import PageNotFound from "./PageNotFound";
import Mapping from "./Sources/Mappings/Mapping";
import ProjectMappings from "./Sources/ProjectMappings";
import Projects from "./Sources/Projects";

const useStyles = makeStyles((theme) => ({
  body: {
    paddingTop: theme.mixins.appbar.height,
    height: "100vh",
  },
}));

const Router = (): JSX.Element => {
  const classes = useStyles();
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <AppBar />
      <div className={classes.body}>
        <Switch>
          <Route exact path={["/", "/projects"]}>
            <Projects />
          </Route>
          <Route exact path="/projects/:projectId">
            <ProjectMappings />
          </Route>
          <Route exact path="/projects/:projectId/batches">
            <Batches />
          </Route>
          <Route exact path="/projects/:projectId/mappings">
            <CreateMapping />
          </Route>
          <Route exact path="/projects/:projectId/mappings/:mappingId">
            <Mapping />
          </Route>
          <Route
            exact
            path="/projects/:projectId/mappings/:mappingId/attributes/:attributeId"
          >
            <Mapping />
          </Route>
          <Route exact path="/projects/:projectId/mappings/:mappingId/edit">
            <EditMapping />
          </Route>
          <Route exact path="/projects/:projectId/mappings/:mappingId/preview">
            <Preview />
          </Route>
          <Route
            exact
            path="/projects/:projectId/mappings/:mappingId/attributes/:attributeId/preview"
          >
            <Preview />
          </Route>
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default Router;
