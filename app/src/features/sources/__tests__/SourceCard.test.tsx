import React from "react";

import { cleanup, render, screen } from "common/test/test-utils";
import { Source } from "services/api/generated/api.generated";

import SourceCard from "../SourceCard";

const source: Source = {
  id: "source_1",
  name: "source",
};

jest.mock("services/api/api");

beforeEach(cleanup);

describe("SourceCard with source", () => {
  it("should render the source mappings count", () => {
    render(<SourceCard source={source} />);

    screen.getByText("2 mappings");
  });

  it("should render the source attributes count", () => {
    render(<SourceCard source={source} />);

    screen.getByText("2 attributes");
  });
});
