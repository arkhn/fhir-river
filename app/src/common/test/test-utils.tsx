import React, { FC, ReactElement } from "react";

import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { Provider } from "react-redux";

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
  options?: Omit<RenderOptions, "queries">
): RenderResult => render(ui, { wrapper, ...options });

export * from "@testing-library/react";

export { customRender as render };
