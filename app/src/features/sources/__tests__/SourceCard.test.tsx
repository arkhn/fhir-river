import React from "react";

import { cleanup, fireEvent, render, screen } from "common/test/test-utils";
import { Source } from "services/api/generated/api.generated";

import SourceCard from "../SourceCard";

const source: Source = {
  id: "source_1",
  name: "source",
};

jest.mock("services/api/api");

beforeEach(cleanup);

describe("SourceCard tests", () => {
  it("should render basic source", () => {
    render(<SourceCard source={source} />);
    screen.getByText("source");
  });

  it("should open card menu", () => {
    render(<SourceCard source={source} />);
    fireEvent.click(screen.getByTestId("more-button"));
    screen.getByRole("presentation");
    screen.getByText("Manage permissions");
    screen.getByText("Rename");
    screen.getByText("Delete");
  });

  it("should render mappings count", () => {
    render(<SourceCard source={source} />);
    screen.getByText("2 mappings");
  });

  it("should render attributes count", () => {
    render(<SourceCard source={source} />);
    screen.getByText("2 attributes");
  });
});
