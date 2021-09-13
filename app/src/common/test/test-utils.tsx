import React, { FC, ReactElement } from "react";

import { MuiThemeProvider } from "@material-ui/core";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { createMemoryHistory, MemoryHistory } from "history";
import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import { useLocation } from "react-router-dom";
import { Router, Route, Switch } from "react-router-dom";

import { store } from "app/store";
import usePyrogTheme from "common/hooks/usePyrogTheme";

import "locales/i18n";

const Wrapper: FC = ({ children }) => {
  // JSDom does not implement .getComputedStyle and an error was being
  // thrown from jest.
  const { getComputedStyle } = window;
  const theme = usePyrogTheme();
  window.getComputedStyle = (elt) => getComputedStyle(elt);
  return (
    <MuiThemeProvider theme={theme}>
      <SnackbarProvider>
        <Provider store={store}>{children}</Provider>;
      </SnackbarProvider>
    </MuiThemeProvider>
  );
};

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "queries">,
  {
    path = "/",
    route = "/",
    history = createMemoryHistory({ initialEntries: [route] }),
  }: { path?: string; route?: string; history?: MemoryHistory<unknown> } = {}
): RenderResult => {
  return render(
    <Router history={history}>
      <LocationDisplay />
      <Switch>
        <Route exact path={path}>
          {ui}
        </Route>
      </Switch>
    </Router>,
    { wrapper: Wrapper, ...options }
  );
};

export * from "@testing-library/react";

export { renderWithRouter as render };
