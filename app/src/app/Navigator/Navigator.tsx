import React from "react";

import { Box, makeStyles } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import AppBar from "app/AppBar/AppBar";
import PageNotFound from "app/PageNotFound/PageNotFound";
import Sources from "app/Sources/Sources";

const useStyles = makeStyles((theme) => ({
  body: {
    marginTop: theme.spacing(10),
  },
}));

const Navigator = () => {
  const classes = useStyles();
  return (
    <BrowserRouter>
      <AppBar />
      <Box className={classes.body}>
        <Switch>
          <Route exact path="/">
            <Sources />
          </Route>
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </Box>
    </BrowserRouter>
  );
};

export default Navigator;
