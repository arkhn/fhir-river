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
import { makeStyles, createMuiTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import Router from "app/routes/Router";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const App = (): JSX.Element => {
  const classes = useStyles();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          text: {
            primary: prefersDarkMode ? "#FFFFFF" : "#464646",
            secondary: prefersDarkMode ? "#a0a0a0" : "#858585",
          },
          type: prefersDarkMode ? "dark" : "light",
          primary: {
            main: "#60b2a2",
            light: "#92e4d3",
            dark: "#2d8273",
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: prefersDarkMode ? "#2f7ae2" : "#265EB1",
          },
        },
      }),
    [prefersDarkMode]
  );

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
