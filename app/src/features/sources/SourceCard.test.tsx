import React from "react";
import { cleanup, fireEvent, render, screen } from "app/test/test-utils";
import { Source } from "services/api/generated/api.generated";
import SourceCard from "./SourceCard";

const source: Source = {
  name: "source",
};

beforeEach(cleanup);

describe("SourceCard tests", () => {
  it("should render basic source", () => {
    render(<SourceCard source={source} />);
    screen.getByText("source");
  });

  it("should render mappings count", () => {
    render(<SourceCard source={source} mappingCount={0} />);
    screen.getByText("0 mappings");
  });

  it("should render attributes count", () => {
    render(<SourceCard source={source} attributesCount={0} />);
    screen.getByText("0 attributes");
  });

  it("should open card menu", () => {
    render(<SourceCard source={source} />);
    fireEvent.click(screen.getByTestId("more-button"));
    screen.getByRole("presentation");
    screen.getByText("Manage permissions");
    screen.getByText("Rename");
    screen.getByText("Delete");
  });

  it("should call edit source callback", () => {
    const editSource = jest.fn();
    render(<SourceCard source={source} editSource={editSource} />);
    fireEvent.click(screen.getByTestId("more-button"));
    fireEvent.click(screen.getByText("Rename"));

    expect(editSource).toHaveBeenCalledTimes(1);
  });
});
