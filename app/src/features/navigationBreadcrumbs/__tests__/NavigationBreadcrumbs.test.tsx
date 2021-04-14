import React from "react";

import {
  renderWithRouterMatch as render,
  screen,
} from "common/test/test-utils";

import NavigationBreadcrumbs from "../NavigationBreadcrumbs";

jest.mock("services/api/api");

describe("Source mappings page", () => {
  it("should display the existing mappings", () => {
    render(<NavigationBreadcrumbs />, {
      path: "/source/:sourceId",
      route: "/source/source_1",
    });

    screen.getByText("source_name_1");
  });
});
