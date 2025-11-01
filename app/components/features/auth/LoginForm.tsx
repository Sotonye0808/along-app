"use client";

import React, { useState } from "react";
import { Form, Input, Button, Divider, App } from "antd";
import {
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  AppleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL, API_ENDPOINTS, APP_ROUTES } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const { login } = useAuth();

  const handleSubmit = async (values: LoginCredentials) => {
    setLoading(true);

    try {
      await login(values.email, values.password);
      message.success("Login successful! Redirecting...");
      router.push(APP_ROUTES.DASHBOARD);
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      message.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "apple") => {
    message.info(`${provider} login will be implemented soon`);
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-semibold mb-2">Sign in</h1>
      <p className="text-gray-600 mb-8">Welcome back to Along</p>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="on"
        size="large">
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}>
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="youremail@example.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}>
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="h-11">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Form.Item>

        <Divider plain>OR</Divider>

        <div className="flex gap-4 mb-6">
          <Button
            icon={<GoogleOutlined />}
            onClick={() => handleOAuthLogin("google")}
            block
            className="h-11">
            Google
          </Button>
          <Button
            icon={<AppleOutlined />}
            onClick={() => handleOAuthLogin("apple")}
            block
            className="h-11">
            Apple
          </Button>
        </div>

        <div className="text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href={APP_ROUTES.REGISTER}
            className="text-[#00623B] hover:underline font-medium">
            Sign Up
          </Link>
        </div>
      </Form>
    </div>
  );
}
