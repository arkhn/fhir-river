import React from "react";

import { makeStyles } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import AppBar from "./AppBar";
import CreateMapping from "./CreateMapping";
import PageNotFound from "./PageNotFound";
import SourceMappings from "./SourceMappings";
import Sources from "./Sources";

const useStyles = makeStyles((theme) => ({
  body: {
    marginTop: theme.spacing(10),
  },
}));

const Router = (): JSX.Element => {
  const classes = useStyles();
  return (
    <BrowserRouter>
      <AppBar />
      <div className={classes.body}>
        <Switch>
          <Route exact path={["/", "/sources"]}>
            <Sources />
          </Route>
          <Route exact path="/source/:sourceId">
            <SourceMappings />
          </Route>
          <Route exact path="/source/:sourceId/mapping">
            <CreateMapping />
          </Route>
          <Route exact path="/source/:sourceId/mapping/:mappingId"></Route>
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default Router;
