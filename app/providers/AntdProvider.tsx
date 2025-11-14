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
          colorPrimary: "#00623B",
          borderRadius: 8,
          fontFamily: "Inter, Roboto, system-ui, sans-serif",
          // Dark mode specific adjustments
          ...(currentTheme === "dark" && {
            colorBgBase: "#1a1a1a",
            colorTextBase: "#e5e5e5",
          }),
        },
        components: {
          Button: {
            controlHeight: 44,
            fontWeight: 500,
          },
          Input: {
            controlHeight: 44,
          },
        },
      }}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
