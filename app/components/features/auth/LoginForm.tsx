"use client";

import React, { useState } from "react";
import Link from "next/link";
import { App } from "antd";
import { Chrome } from "lucide-react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";
import { LOGIN_FIELDS } from "@/lib/config/forms";
import { useAuth } from "@/app/providers/AuthProvider";
import { AppButton } from "@/components/ui/AppButton";
import { ConfigDrivenForm } from "@/components/ui/ConfigDrivenForm";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();
  const { login } = useAuth();

  async function handleSubmit(values: LoginCredentials): Promise<void> {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success("Login successful. Redirecting...");
      router.push(APP_ROUTES.DASHBOARD);
    } catch (error) {
      const maybeError = error as { message?: string };
      message.error(maybeError.message || "Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleOAuthLogin(provider: "google" | "apple"): void {
    if (provider === "google") {
      // redirect to server route that starts Google OAuth
      window.location.href = "/api/auth/google";
      return;
    }
    message.info(`${provider} login will be implemented soon`);
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 text-3xl font-semibold">Sign in</h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Welcome back to Along
      </p>

      <ConfigDrivenForm<LoginCredentials>
        fields={LOGIN_FIELDS}
        submitLabel={loading ? "Signing in..." : "Sign In"}
        loading={loading}
        onSubmit={(values) => handleSubmit(values)}
      />

      <div className="mb-6 mt-4">
        <AppButton
          variant="secondary"
          icon={Chrome}
          fullWidth
          onClick={() => handleOAuthLogin("google")}>
          Continue with Google
        </AppButton>
      </div>

      <div className="text-center text-[var(--color-text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link
          href={APP_ROUTES.REGISTER}
          className="font-medium text-[var(--color-primary)] hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
