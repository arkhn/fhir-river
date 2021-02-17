import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/300-italic.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/500-italic.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/700-italic.css";
import { makeStyles, createMuiTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { ThemeProvider } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";

import HomePage from "./HomePage/HomePage";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const App = () => {
  const classes = useStyles();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.root}>
        <HomePage />
      </div>
    </ThemeProvider>
  );
};

export default App;
