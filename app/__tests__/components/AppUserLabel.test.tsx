import { render, screen } from "@testing-library/react";
import { AppUserLabel } from "@/app/components/ui/AppUserLabel";

const baseUser = {
  firstName: "John",
  lastName: "Doe",
  userName: "johndoe",
};

describe("AppUserLabel", () => {
  it("renders user name", () => {
    render(<AppUserLabel user={baseUser} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders handle when showHandle is true", () => {
    render(<AppUserLabel user={baseUser} showHandle />);
    expect(screen.getByText("@johndoe")).toBeInTheDocument();
  });

  it("hides handle when showHandle is false", () => {
    render(<AppUserLabel user={baseUser} showHandle={false} />);
    expect(screen.queryByText("@johndoe")).not.toBeInTheDocument();
  });

  it("renders a link when linkToProfile is true", () => {
    render(<AppUserLabel user={baseUser} linkToProfile />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/profile/johndoe");
  });

  it("does not render a link when linkToProfile is false", () => {
    render(<AppUserLabel user={baseUser} linkToProfile={false} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders verification badge for verified user", () => {
    render(<AppUserLabel user={{ ...baseUser, isVerified: true }} />);
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it("does not render verification badge for unverified user", () => {
    render(<AppUserLabel user={{ ...baseUser, isVerified: false }} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders with sm size avatar", () => {
    render(<AppUserLabel user={baseUser} size="sm" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders with md size avatar", () => {
    render(<AppUserLabel user={baseUser} size="md" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("applies vertical layout when vertical is true", () => {
    const { container } = render(<AppUserLabel user={baseUser} vertical />);
    const linkOrDiv = container.querySelector('[class*="inline-flex"]');
    expect(linkOrDiv?.innerHTML).toContain("flex-col");
  });
});
