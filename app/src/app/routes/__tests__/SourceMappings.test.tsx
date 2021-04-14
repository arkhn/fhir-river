import React from "react";

import {
  renderWithRouterMatch as render,
  screen,
} from "common/test/test-utils";

import SourceMappings from "../SourceMappings";

jest.mock("services/api/api");

describe("Source mappings page", () => {
  it("should display the existing mappings", () => {
    render(<SourceMappings />, {
      path: "/source/:sourceId",
      route: "/source/1",
    });

    screen.getByText("definition_1");
    screen.getByText("definition_2");
  });
});
