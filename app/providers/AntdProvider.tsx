'use client';

import React from 'react';
import { ConfigProvider, App } from 'antd';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00623B',
          borderRadius: 8,
          fontFamily: 'Inter, Roboto, system-ui, sans-serif',
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
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}