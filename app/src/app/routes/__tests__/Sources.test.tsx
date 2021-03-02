import React from "react";

import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "common/test/test-utils";
import { Source } from "services/api/generated/api.generated";

import Sources from "../Sources";

jest.mock("services/api/api");
const api = require("services/api/api");

describe("Sources page", () => {
  it("should display the existing sources", () => {
    render(<Sources />);

    screen.getByText("source_name_1");
    screen.getByText("source_name_2");
  });

  it("should call the api when creating a new source", async () => {
    render(<Sources />);

    userEvent.click(screen.getByRole("button", { name: /new source/i }));
    userEvent.type(screen.getByRole("textbox"), "new_source_name");
    userEvent.click(
      screen.getByRole("button", {
        name: /create source/i,
      })
    );

    const source: Source = { name: "new_source_name" };
    await waitFor(() => {
      expect(api.createSourceMock).toHaveBeenNthCalledWith(1, { source });
    });
  });

  it("should call the api when renaming a source", async () => {
    render(<Sources />);

    userEvent.click(
      screen.getByRole("button", { name: /source_name_1 menu/i })
    );
    const renameMenuItem = await screen.findByRole("menuitem", {
      name: /rename/i,
    });
    userEvent.click(renameMenuItem);
    userEvent.clear(screen.getByRole("textbox"));
    userEvent.type(screen.getByRole("textbox"), "new_source_name");
    userEvent.click(screen.getByRole("button", { name: /rename source/i }));

    const source: Source = { id: "source_1", name: "new_source_name" };
    await waitFor(() => {
      expect(api.updateSourceMock).toHaveBeenNthCalledWith(1, {
        id: source.id,
        source,
      });
    });
  });
});
