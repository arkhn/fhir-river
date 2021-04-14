import React, { FC, ReactElement } from "react";

import { render, RenderOptions } from "@testing-library/react";
import { createMemoryHistory, MemoryHistory } from "history";
import { Provider } from "react-redux";
import { Router, Route } from "react-router-dom";

import { store } from "app/store";

import "locales/i18n";

const wrapper: FC = ({ children }) => {
  const { getComputedStyle } = window;
  window.getComputedStyle = (elt) => getComputedStyle(elt);
  return <Provider store={store}>{children}</Provider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "queries">
): ReturnType<typeof render> => render(ui, { wrapper, ...options });

const renderWithRouterMatch = (
  ui: ReactElement,
  {
    path = "/",
    route = "/",
    history = createMemoryHistory({ initialEntries: [route] }),
  }: { path?: string; route?: string; history?: MemoryHistory<unknown> } = {}
): ReturnType<typeof render> =>
  customRender(
    <Router history={history}>
      <Route path={path}>{ui}</Route>
    </Router>
  );

export * from "@testing-library/react";

export { customRender as render, renderWithRouterMatch };
