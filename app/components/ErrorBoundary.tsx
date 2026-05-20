"use client";

import React from "react";
import { Button, Result } from "antd";
import { ReloadOutlined, HomeOutlined } from "@ant-design/icons";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-elevated)] px-4">
          <Result
            status="error"
            title="Something went wrong"
            subTitle={
              process.env.NODE_ENV === "development"
                ? this.state.error?.message
                : "We're sorry for the inconvenience. Please try refreshing the page."
            }
            extra={[
              <Button
                key="reload"
                type="primary"
                size="large"
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
                className="bg-[#00623B]">
                Refresh Page
              </Button>,
              <Button
                key="home"
                size="large"
                icon={<HomeOutlined />}
                onClick={() => (window.location.href = "/home")}>
                Go Home
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
