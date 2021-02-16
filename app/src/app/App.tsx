import React from "react";
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
