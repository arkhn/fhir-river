import React from "react";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/300-italic.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/500-italic.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/700-italic.css";

import { ThemeProvider } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";

import Router from "app/routes/Router";

import usePyrogTheme from "./usePyrogTheme";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const App = (): JSX.Element => {
  const classes = useStyles();
  const theme = usePyrogTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.root}>
        <Router />
      </div>
    </ThemeProvider>
  );
};

export default App;
