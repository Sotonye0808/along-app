"use client";

import React, { useState } from "react";
import Link from "next/link";
import { App } from "antd";
import { Chrome } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS, APP_ROUTES } from "@/lib/constants";
import { REGISTER_FIELDS } from "@/lib/config/forms";
import { AppButton } from "@/components/ui/AppButton";
import { ConfigDrivenForm } from "@/components/ui/ConfigDrivenForm";

type RegisterFormValues = RegisterData & { confirmPassword: string };

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  async function handleSubmit(values: RegisterFormValues): Promise<void> {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword: _confirmPassword, ...registerData } = values;
      await api.post(API_ENDPOINTS.REGISTER, registerData);

      message.success("Registration successful. Please verify your account.");
      localStorage.setItem("verificationEmail", registerData.email);
      router.push(APP_ROUTES.OTP);
    } catch (error) {
      const maybeError = error as {
        response?: { data?: { error?: string } };
      };
      message.error(
        maybeError.response?.data?.error ||
          "Registration failed. Please try again.",
      );
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleOAuthRegister(): void {
    message.info("OAuth registration will be implemented soon");
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 text-3xl font-semibold">Sign up</h1>
      <p className="mb-8 text-sm text-[var(--color-text-secondary)]">
        By signing up, you consent to receive product, service, and event
        updates.
      </p>

      <ConfigDrivenForm<RegisterFormValues>
        fields={REGISTER_FIELDS}
        submitLabel={loading ? "Creating account..." : "Create account"}
        loading={loading}
        onSubmit={(values) => handleSubmit(values)}
      />

      <div className="mb-4 mt-4">
        <AppButton
          variant="secondary"
          icon={Chrome}
          fullWidth
          onClick={handleOAuthRegister}>
          Continue with Google
        </AppButton>
      </div>

      <div className="text-center text-[var(--color-text-secondary)]">
        Already have an account?{" "}
        <Link
          href={APP_ROUTES.LOGIN}
          className="font-medium text-[var(--color-primary)] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
