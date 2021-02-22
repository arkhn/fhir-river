import React from "react";
import NavBar from "common/NavBar/NavBar";
import { Box, makeStyles } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import PageNotFound from "app/PageNotFound/PageNotFound";

const useStyles = makeStyles((theme) => ({
  body: {
    marginTop: theme.spacing(10),
  },
}));

const AppNavigator = () => {
  const classes = useStyles();
  return (
    <BrowserRouter>
      <NavBar />
      <Box className={classes.body}>
        <Switch>
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </Box>
    </BrowserRouter>
  );
};

export default AppNavigator;
