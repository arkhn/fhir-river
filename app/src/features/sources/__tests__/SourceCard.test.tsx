import React from "react";

import { fireEvent } from "@testing-library/dom";

import { cleanup, render, screen } from "common/test/test-utils";
import type { Source } from "services/api/generated/api.generated";

import SourceCard from "../SourceCard";
import * as sourceSlice from "../sourceSlice";

const source: Source = {
  id: "source_1",
  name: "source_1_name",
};

jest.mock("services/api/api");
const api = require("services/api/api");

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

  it("should call action editSource with source when clicking on Rename", () => {
    const spy = jest.spyOn(sourceSlice, "editSource");
    render(<SourceCard source={source} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("menuitem", { name: /rename/i }));

    expect(spy).toHaveBeenNthCalledWith(1, source);
  });

  it("should call useDestroySourceMutation callback when clicking on Delete", () => {
    render(<SourceCard source={source} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("menuitem", { name: /delete/i }));

    expect(api.deleteSourceMock).toHaveBeenNthCalledWith(1, { id: source.id });
  });
});
