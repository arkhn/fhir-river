import React from "react";

import { fireEvent } from "@testing-library/dom";

import { cleanup, render, screen } from "common/test/test-utils";

import Sources from "../Sources";

jest.mock("services/api/api");

beforeEach(cleanup);

describe("Sources page", () => {
  it("should render the existing sources", () => {
    render(<Sources />);

    screen.getByText("source_name_1");
    screen.getByText("source_name_2");
  });

  it("should calls useCreateSourceMutation callback when adding a new source", async () => {
    render(<Sources />);

    fireEvent.click(screen.getByRole("button", { name: /new source/i }));
    fireEvent.click(screen.getByRole("button", { name: /create source/i }));
  });
});
