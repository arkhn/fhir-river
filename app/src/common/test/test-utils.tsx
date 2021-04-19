import React, { FC, ReactElement } from "react";

import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { createMemoryHistory, MemoryHistory } from "history";
import { Provider } from "react-redux";
import { Router, Route } from "react-router-dom";

import { store } from "app/store";

import "locales/i18n";

const wrapper: FC = ({ children }) => {
  // JSDom does not implement .getComputedStyle and an error was being
  // thrown from jest.
  const { getComputedStyle } = window;
  window.getComputedStyle = (elt) => getComputedStyle(elt);
  return <Provider store={store}>{children}</Provider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "queries">,
  {
    path = "/",
    route = "/",
    history = createMemoryHistory({ initialEntries: [route] }),
  }: { path?: string; route?: string; history?: MemoryHistory<unknown> } = {}
): RenderResult =>
  render(
    <Router history={history}>
      <Route path={path}>{ui}</Route>
    </Router>,
    { wrapper, ...options }
  );

export * from "@testing-library/react";

export { customRender as render };
