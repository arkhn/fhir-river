import React, { FC, ReactElement } from "react";

import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "app/store";

import "locales/i18n";

const AllTheProviders: FC = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "queries">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";

export { customRender as render };
