import React from "react";

import { makeStyles } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import CreateMapping from "features/Mappings/Create/CreateMapping";

import { PUBLIC_URL } from "../../constants";
import AppBar from "./AppBar";
import Mapping from "./Mapping";
import PageNotFound from "./PageNotFound";
import SourceMappings from "./Sources/SourceMappings";
import Sources from "./Sources/Sources";

const useStyles = makeStyles((theme) => ({
  body: {
    marginTop: theme.spacing(10),
  },
}));

const Router = (): JSX.Element => {
  const classes = useStyles();
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <AppBar />
      <div className={classes.body}>
        <Switch>
          <Route exact path={["/", "/sources"]}>
            <Sources />
          </Route>
          <Route exact path="/sources/:sourceId">
            <SourceMappings />
          </Route>
          <Route exact path="/sources/:sourceId/mappings">
            <CreateMapping />
          </Route>
          <Route exact path="/sources/:sourceId/mappings/:mappingId">
            <Mapping />
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
