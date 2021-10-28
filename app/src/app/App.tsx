import React, { createRef } from "react";

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
import { ErrorOutline } from "@material-ui/icons";
import { CloseReason, SnackbarKey, SnackbarProvider } from "notistack";

import Router from "app/routes/Router";
import usePyrogTheme from "common/hooks/usePyrogTheme";
import useSnackbar from "features/Snackbar/useSnackbar";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  snackbarIcon: {
    marginRight: 8,
  },
  snackbarError: {
    backgroundColor: theme.palette.error.main,
  },
}));

const App = (): JSX.Element => {
  const classes = useStyles();
  const theme = usePyrogTheme();

  const notistackRef = createRef<SnackbarProvider>();
  useSnackbar(notistackRef);

  const dismissSnackbar = (reason: CloseReason, key: SnackbarKey) => {
    if (reason === "clickaway") {
      notistackRef.current?.closeSnackbar(key);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        classes={{
          variantError: classes.snackbarError,
        }}
        ref={notistackRef}
        autoHideDuration={null}
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        onClose={(event, reason, snackbarKey) =>
          snackbarKey && dismissSnackbar(reason, snackbarKey)
        }
        iconVariant={{
          error: (
            <ErrorOutline fontSize="small" className={classes.snackbarIcon} />
          ),
        }}
      >
        <CssBaseline />
        <div className={classes.root}>
          <Router />
        </div>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
