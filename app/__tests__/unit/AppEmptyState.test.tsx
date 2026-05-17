/**
 * Unit tests for AppEmptyState component.
 */
import React from "react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent } from "@/lib/test-utils";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { MapPin } from "lucide-react";

describe("AppEmptyState", () => {
  it("renders the title", () => {
    render(<AppEmptyState title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<AppEmptyState title="Empty" description="No items to show." />);
    expect(screen.getByText("No items to show.")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<AppEmptyState title="Empty" />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("renders an action button with the correct label", () => {
    const handleClick = jest.fn();
    render(
      <AppEmptyState
        title="Empty"
        action={{ label: "Try again", onClick: handleClick }}
      />,
    );
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls the action onClick handler when button is clicked", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <AppEmptyState
        title="Empty"
        action={{ label: "Retry", onClick: handleClick }}
      />,
    );
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders without an icon when none is provided", () => {
    const { container } = render(<AppEmptyState title="No icon" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders with an icon when one is provided", () => {
    const { container } = render(<AppEmptyState title="Has icon" icon={MapPin} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AppEmptyState title="Styled" className="my-custom-class" />,
    );
    expect(container.querySelector(".my-custom-class")).toBeInTheDocument();
  });
});
