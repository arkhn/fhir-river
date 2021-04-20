import React from "react";

import { makeStyles } from "@material-ui/core";
import { BrowserRouter, Switch } from "react-router-dom";

import PrivateRoute from "features/User/UserRoute";

import AppBar from "./AppBar";
import PageNotFound from "./PageNotFound";
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
          <PrivateRoute exact path={["/", "/sources"]}>
            <Sources />
          </PrivateRoute>
          <PrivateRoute>
            <PageNotFound />
          </PrivateRoute>
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default Router;
