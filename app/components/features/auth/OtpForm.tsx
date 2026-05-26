"use client";

import React, { useState, useEffect } from "react";
import { Button, App } from "antd";
import { useRouter } from "next/navigation";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS, APP_ROUTES, VALIDATION } from "@/lib/constants";

export function OtpForm() {
  const [code, setCode] = useState<string[]>(
    Array(VALIDATION.OTP_LENGTH).fill("")
  );
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    // Get email from localStorage
    const verificationEmail = localStorage.getItem("verificationEmail");
    if (verificationEmail) {
      setEmail(verificationEmail);
    } else {
      message.warning("No email found. Redirecting to registration...");
      router.push(APP_ROUTES.REGISTER);
    }
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < VALIDATION.OTP_LENGTH - 1) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, VALIDATION.OTP_LENGTH);
    const newCode = pastedData.split("").filter((char) => /\d/.test(char));

    if (newCode.length === VALIDATION.OTP_LENGTH) {
      setCode(newCode);
      // Focus last input
      const lastInput = document.getElementById(
        `otp-input-${VALIDATION.OTP_LENGTH - 1}`
      );
      lastInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = code.join("");

    if (otpCode.length !== VALIDATION.OTP_LENGTH) {
      message.warning("Please enter the complete verification code");
      return;
    }

    setLoading(true);

    try {
      const verificationData: OtpVerification = {
        email,
        code: otpCode,
      };

      await api.post(API_ENDPOINTS.VERIFY_OTP, verificationData);

      message.success("Verification successful! Redirecting to login...");
      localStorage.removeItem("verificationEmail");

      setTimeout(() => {
        router.push(APP_ROUTES.LOGIN);
      }, 1500);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Verification failed. Please try again.";
      message.error(errorMessage);
      setCode(Array(VALIDATION.OTP_LENGTH).fill(""));
      document.getElementById("otp-input-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);

    try {
      // Mock resend - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Verification code sent!");
      setCountdown(60); // Start 60 second countdown
    } catch (error) {
      message.error("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangeNumber = () => {
    localStorage.removeItem("verificationEmail");
    router.push(APP_ROUTES.REGISTER);
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold mb-2">Enter Verification Code</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        We have just sent a verification code to{" "}
        <span className="font-medium text-[var(--color-text-primary)]">{email}</span>
      </p>

      <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <>
            <label
              htmlFor={`otp-input-${index}`}
              key={index}
              className="sr-only"
            >
              OTP Digit {index + 1}
            </label>
            <input
              key={index}
              id={`otp-input-${index}`}
              name={`otp-input-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-semibold bg-[var(--color-bg-elevated)] border-2 border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              autoComplete="one-time-code"
            />
          </>
        ))}
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <button
          onClick={handleResendCode}
          disabled={countdown > 0 || resendLoading}
          className="text-sm font-semibold text-[var(--color-primary)] hover:underline disabled:text-gray-400 disabled:no-underline text-left">
          {countdown > 0
            ? `Resend code in ${countdown}s`
            : "Send me the code again"}
        </button>
        <button
          onClick={handleChangeNumber}
          className="text-sm font-semibold text-[var(--color-primary)] hover:underline text-left">
          Change email address
        </button>
      </div>

      <Button
        type="primary"
        size="large"
        loading={loading}
        onClick={handleVerify}
        block
        className="h-11">
        {loading ? "Verifying..." : "Verify"}
      </Button>
    </div>
  );
}
