"use client";

import React from "react";
import { Modal } from "antd";
import type { LucideIcon } from "lucide-react";

export interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: "primary" | "error" | "warning" | "info";
  size?: "sm" | "default" | "lg" | "xl" | "fullscreen";
  footer?: React.ReactNode | null;
  loading?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  children: React.ReactNode;
  className?: string;
}

const widthMap: Record<NonNullable<AppModalProps["size"]>, number | string> = {
  sm: 420,
  default: 560,
  lg: 760,
  xl: 980,
  fullscreen: "100vw",
};

const iconColorMap: Record<NonNullable<AppModalProps["iconColor"]>, string> = {
  primary: "text-[var(--color-primary)]",
  error: "text-[var(--color-error-text)]",
  warning: "text-[var(--color-warning-text)]",
  info: "text-sky-600",
};

export function AppModal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconColor = "primary",
  size = "default",
  footer,
  loading,
  closable = true,
  maskClosable = true,
  children,
  className,
}: AppModalProps): React.ReactElement {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={widthMap[size]}
      footer={footer}
      confirmLoading={loading}
      closable={closable}
      maskClosable={maskClosable}
      className={className}
      title={
        <div className="flex items-start gap-3">
          {Icon ? (
            <Icon
              className={iconColorMap[iconColor]}
              size={20}
              aria-hidden="true"
            />
          ) : null}
          <div>
            {title ? <div className="font-semibold">{title}</div> : null}
            {subtitle ? (
              <div className="text-sm text-[var(--color-text-secondary)]">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
      }>
      {children}
    </Modal>
  );
}
