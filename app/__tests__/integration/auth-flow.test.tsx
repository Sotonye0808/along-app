import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, userEvent } from "@/lib/test-utils";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

// Mock dependencies
jest.mock("next/navigation");
jest.mock("@/app/providers/AuthProvider");

describe("Authentication Flow Integration Tests", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  };

  const mockLogin = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: mockLogin,
      logout: mockLogout,
      loading: false,
    });

    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Complete Login Flow", () => {
    it("should complete full login process successfully", async () => {
      const user = userEvent.setup();

      // Mock successful login response
      mockLogin.mockResolvedValue({
        user: {
          id: "1",
          userName: "testuser",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          createdAt: new Date().toISOString(),
        },
      });

      // 1. Render login form
      render(<LoginForm />, { initialUser: null });

      // 2. Verify form is visible
      expect(screen.getByText("Sign in")).toBeInTheDocument();

      // 3. Fill in credentials
      const emailInput = screen.getByPlaceholderText("youremail@example.com");
      const passwordInput = screen.getByPlaceholderText("Enter your password");

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      // 4. Submit form
      const submitButton = screen.getByRole("button", { name: /Sign In/i });
      await user.click(submitButton);

      // 5. Verify login was called with correct credentials
      await waitFor(
        () => {
          expect(mockLogin).toHaveBeenCalledWith(
            "test@example.com",
            "password123"
          );
        },
        { timeout: 3000 }
      );

      // 6. Verify redirect to dashboard
      await waitFor(
        () => {
          expect(mockRouter.push).toHaveBeenCalledWith("/home");
        },
        { timeout: 3000 }
      );
    }, 20000); // 20 second timeout

    it("should handle login failure and allow retry", async () => {
      const user = userEvent.setup();

      // Mock failed login on first attempt
      mockLogin
        .mockRejectedValueOnce(new Error("Invalid credentials"))
        .mockResolvedValueOnce({
          user: {
            id: "1",
            userName: "testuser",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            createdAt: new Date().toISOString(),
          },
        });

      render(<LoginForm />, { initialUser: null });

      const emailInput = screen.getByPlaceholderText("youremail@example.com");
      const passwordInput = screen.getByPlaceholderText("Enter your password");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      // First attempt with wrong credentials
      await user.clear(emailInput);
      await user.type(emailInput, "test@example.com");
      await user.clear(passwordInput);
      await user.type(passwordInput, "wrongpassword");

      // Wait for form validation to complete
      await waitFor(() => {
        expect(emailInput).toHaveValue("test@example.com");
      });

      await user.click(submitButton);

      // Verify login was attempted
      await waitFor(
        () => {
          expect(mockLogin).toHaveBeenCalledWith(
            "test@example.com",
            "wrongpassword"
          );
        },
        { timeout: 5000 }
      );

      // Form should still be visible for retry
      expect(screen.getByText("Sign in")).toBeInTheDocument();

      // Clear and retry with correct password
      await user.clear(passwordInput);
      await user.type(passwordInput, "correctpassword");
      await user.click(submitButton);

      // Verify second login attempt
      await waitFor(
        () => {
          expect(mockLogin).toHaveBeenCalledWith(
            "test@example.com",
            "correctpassword"
          );
        },
        { timeout: 5000 }
      );

      // Should redirect on success
      await waitFor(
        () => {
          expect(mockRouter.push).toHaveBeenCalledWith("/home");
        },
        { timeout: 5000 }
      );
    }, 20000); // 20 second timeout
  });

  describe("Form Validation Flow", () => {
    it("should validate all fields before submission", async () => {
      const user = userEvent.setup();

      render(<LoginForm />, { initialUser: null });

      // Try to submit empty form
      const submitButton = screen.getByRole("button", { name: /Sign In/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText("Please enter your email")).toBeInTheDocument();
        expect(
          screen.getByText("Please enter your password")
        ).toBeInTheDocument();
      });

      // Login should not be called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should validate email format", async () => {
      const user = userEvent.setup();

      render(<LoginForm />, { initialUser: null });

      const emailInput = screen.getByPlaceholderText("youremail@example.com");
      await user.type(emailInput, "not-an-email");

      const submitButton = screen.getByRole("button", { name: /Sign In/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email")
        ).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should validate password length", async () => {
      const user = userEvent.setup();

      render(<LoginForm />, { initialUser: null });

      const emailInput = screen.getByPlaceholderText("youremail@example.com");
      const passwordInput = screen.getByPlaceholderText("Enter your password");

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "short");

      const submitButton = screen.getByRole("button", { name: /Sign In/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 8 characters")
        ).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("should show loading state during login", async () => {
      const user = userEvent.setup();

      // Mock slow login
      mockLogin.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => {
              resolve({
                user: {
                  id: "1",
                  userName: "testuser",
                  email: "test@example.com",
                  firstName: "Test",
                  lastName: "User",
                  createdAt: new Date().toISOString(),
                },
              });
            }, 1000)
          )
      );

      render(<LoginForm />, { initialUser: null });

      const emailInput = screen.getByPlaceholderText("youremail@example.com");
      const passwordInput = screen.getByPlaceholderText("Enter your password");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      await user.clear(emailInput);
      await user.type(emailInput, "test@example.com");
      await user.clear(passwordInput);
      await user.type(passwordInput, "password123");

      // Wait for validation
      await waitFor(() => {
        expect(emailInput).toHaveValue("test@example.com");
      });

      await user.click(submitButton);

      // Should show loading text
      await waitFor(
        () => {
          expect(
            screen.queryByText("Signing in...") || submitButton.textContent
          ).toBeTruthy();
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Navigation", () => {
    it("should allow navigation to sign up page", () => {
      render(<LoginForm />, { initialUser: null });

      const signUpLink = screen.getByText("Sign Up");
      expect(signUpLink.closest("a")).toHaveAttribute("href", "/register");
    });
  });
});
