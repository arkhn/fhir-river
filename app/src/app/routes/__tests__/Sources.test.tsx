import React from "react";

import userEvent from "@testing-library/user-event";

import { cleanup, render, screen } from "common/test/test-utils";
import { Source } from "services/api/generated/api.generated";

import Sources from "../Sources";

jest.mock("services/api/api");
const api = require("services/api/api");

describe("Sources page", () => {
  beforeAll(() => {
    // JSDom does not implement this and an error was being
    // thrown from jest.
    const { getComputedStyle } = window;
    window.getComputedStyle = (elt) => getComputedStyle(elt);
  });

  beforeEach(cleanup);

  it("should display the existing sources", () => {
    render(<Sources />);

    screen.getByText("source_name_1");
    screen.getByText("source_name_2");
  });

  it("should call the api when creating a new source", () => {
    render(<Sources />);

    userEvent.click(screen.getByRole("button", { name: /new source/i }));
    userEvent.type(
      screen.getByRole("textbox", { name: /name/i }),
      "new_source_name"
    );
    userEvent.click(screen.getByRole("button", { name: /create source/i }));

    const source: Source = { name: "new_source_name" };
    expect(api.createSourceMock).toHaveBeenNthCalledWith(1, { source });
  });

  it("should call the api when renaming a source", () => {
    render(<Sources />);

    userEvent.click(
      screen.getByRole("button", { name: /source_name_1 menu/i })
    );
    userEvent.click(screen.getByRole("menuitem", { name: /rename/i }));
    userEvent.clear(screen.getByRole("textbox", { name: /name/i }));
    userEvent.type(
      screen.getByRole("textbox", { name: /name/i }),
      "new_source_name"
    );
    userEvent.click(screen.getByRole("button", { name: /rename source/i }));

    const source: Source = { id: "source_1", name: "new_source_name" };
    expect(api.updateSourceMock).toHaveBeenNthCalledWith(1, {
      id: source.id,
      source,
    });
  });
});
