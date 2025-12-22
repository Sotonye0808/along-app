"use client";

import React from "react";
import { ConfigProvider, App, theme } from "antd";
import { useTheme } from "./ThemeProvider";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: {
          colorPrimary: currentTheme === "dark" ? "#00a862" : "#00623B",
          borderRadius: 8,
          fontFamily: "Inter, Roboto, system-ui, sans-serif",
          // Light mode tokens
          ...(currentTheme === "light" && {
            colorBgBase: "#ffffff",
            colorBgContainer: "#ffffff",
            colorBgElevated: "#ffffff",
            colorBgLayout: "#f7f7f7",
            colorBorder: "#e5e7eb",
            colorBorderSecondary: "#f3f4f6",
            colorText: "#232323",
            colorTextSecondary: "#6b7280",
            colorTextTertiary: "#9ca3af",
            colorTextQuaternary: "#d1d5db",
          }),
          // Dark mode tokens
          ...(currentTheme === "dark" && {
            colorBgBase: "#0f0f0f",
            colorBgContainer: "#1f1f1f",
            colorBgElevated: "#1a1a1a",
            colorBgLayout: "#0f0f0f",
            colorBorder: "#2d2d2d",
            colorBorderSecondary: "#262626",
            colorText: "#f5f5f5",
            colorTextSecondary: "#d1d5db",
            colorTextTertiary: "#9ca3af",
            colorTextQuaternary: "#6b7280",
          }),
        },
        components: {
          Button: {
            controlHeight: 44,
            fontWeight: 500,
          },
          Input: {
            controlHeight: 44,
            ...(currentTheme === "dark" && {
              colorBgContainer: "#1f1f1f",
              colorBorder: "#2d2d2d",
              colorText: "#f5f5f5",
            }),
          },
          Card: {
            ...(currentTheme === "dark" && {
              colorBgContainer: "#1f1f1f",
              colorBorderSecondary: "#2d2d2d",
            }),
          },
          Modal: {
            ...(currentTheme === "dark" && {
              contentBg: "#1f1f1f",
              headerBg: "#1f1f1f",
            }),
          },
          Dropdown: {
            ...(currentTheme === "dark" && {
              colorBgElevated: "#1f1f1f",
            }),
          },
        },
      }}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
