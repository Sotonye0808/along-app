/**
 * Unit tests for AppUserLabel component.
 */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@/lib/test-utils";
import { AppUserLabel } from "@/components/ui/AppUserLabel";

const mockUser = {
  userName: "testuser",
  firstName: "Test",
  lastName: "User",
};

describe("AppUserLabel", () => {
  it("renders the user's full name", () => {
    render(<AppUserLabel user={mockUser} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("renders a link to the user's profile when linkToProfile is true (default)", () => {
    render(<AppUserLabel user={mockUser} />);
    const link = screen.getByRole("link", { name: /test user/i });
    expect(link).toHaveAttribute("href", "/profile/testuser");
  });

  it("does not render a profile link when linkToProfile is false", () => {
    render(<AppUserLabel user={mockUser} linkToProfile={false} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("shows the @handle when showHandle is true (default)", () => {
    render(<AppUserLabel user={mockUser} showHandle />);
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("hides the @handle when showHandle is false", () => {
    render(<AppUserLabel user={mockUser} showHandle={false} />);
    expect(screen.queryByText("@testuser")).not.toBeInTheDocument();
  });

  it("hides the full name when showFullName is false", () => {
    render(<AppUserLabel user={mockUser} showFullName={false} />);
    expect(screen.queryByText("Test User")).not.toBeInTheDocument();
  });

  it("applies custom className to root element", () => {
    const { container } = render(
      <AppUserLabel user={mockUser} className="my-label-class" />,
    );
    expect(container.querySelector(".my-label-class")).toBeInTheDocument();
  });
});
