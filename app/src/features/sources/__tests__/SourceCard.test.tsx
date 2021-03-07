import React from "react";

import userEvent from "@testing-library/user-event";

import { render, screen } from "common/test/test-utils";
import type { Source } from "services/api/generated/api.generated";

import SourceCard from "../SourceCard";

const source: Source = {
  id: "source_1",
  name: "source_1_name",
};

jest.mock("services/api/api");
const api = require("services/api/api");

describe("SourceCard with source", () => {
  it("should display the source mappings count", () => {
    render(<SourceCard source={source} />);

    screen.getByText("2 mappings");
  });

  it("should display the source attributes count", () => {
    render(<SourceCard source={source} />);

    screen.getByText("2 attributes");
  });

  it("should call the api when deleting a source", () => {
    render(<SourceCard source={source} />);

    userEvent.click(screen.getByRole("button"));
    userEvent.click(screen.getByRole("menuitem", { name: /delete/i }));

    expect(api.deleteSourceMock).toHaveBeenNthCalledWith(1, { id: source.id });
  });
});
