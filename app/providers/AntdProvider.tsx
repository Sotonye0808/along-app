'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';

interface AntdProviderProps {
  children: React.ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00623B',
            colorSuccess: '#a4f4e7',
            colorWarning: '#f4c790',
            colorError: '#e4626f',
            colorBgBase: '#f7f7f7',
            colorTextBase: '#232323',
            borderRadius: 8,
            fontFamily: 'Inter, Roboto, system-ui, sans-serif',
          },
          algorithm: theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
