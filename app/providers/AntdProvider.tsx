"use client";

import React from "react";
import { ConfigProvider, App, theme } from "antd";
import { useTheme } from "./ThemeProvider";

const themeTokens = {
  colorPrimary: "var(--color-primary)",
  borderRadius: 8,
  fontFamily: "var(--font-sans)",
  colorBgBase: "var(--color-bg-base)",
  colorBgContainer: "var(--color-bg-base)",
  colorBgElevated: "var(--color-bg-elevated)",
  colorBgLayout: "var(--color-bg-base)",
  colorBorder: "var(--color-border)",
  colorBorderSecondary: "var(--color-border-light)",
  colorText: "var(--color-text-primary)",
  colorTextSecondary: "var(--color-text-secondary)",
  colorTextTertiary: "var(--color-text-muted)",
  colorTextQuaternary: "var(--color-text-muted)",
} as const;

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: themeTokens,
        components: {
          Button: {
            controlHeight: 44,
            fontWeight: 500,
          },
          Input: {
            controlHeight: 44,
            colorBgContainer: "var(--color-bg-base)",
            colorBorder: "var(--color-border)",
            colorText: "var(--color-text-primary)",
          },
          Card: {
            colorBgContainer: "var(--color-bg-base)",
            colorBorderSecondary: "var(--color-border)",
          },
          Modal: {
            contentBg: "var(--color-bg-base)",
            headerBg: "var(--color-bg-base)",
          },
          Dropdown: {
            colorBgElevated: "var(--color-bg-base)",
          },
        },
      }}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
