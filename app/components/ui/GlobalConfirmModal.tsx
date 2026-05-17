"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { ModalService } from "@/lib/services/modalService";
import { useGlobalModal } from "@/app/providers/GlobalModalProvider";
import { AppButton } from "./AppButton";
import { AppModal } from "./AppModal";

export interface ConfirmState {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void | Promise<void>;
}

export function closeGlobalConfirm(): void {
  ModalService.resolve(false);
}

export function GlobalConfirmModal(): React.ReactElement {
  const { modalState } = useGlobalModal();

  return (
    <AppModal
      open={modalState.open}
      onClose={closeGlobalConfirm}
      title={modalState.title}
      subtitle={modalState.description}
      icon={AlertTriangle}
      iconColor={modalState.destructive ? "error" : "warning"}
      footer={
        <div className="flex justify-end gap-2">
          <AppButton variant="secondary" onClick={closeGlobalConfirm}>
            {modalState.cancelLabel ?? "Cancel"}
          </AppButton>
          <AppButton
            variant={modalState.destructive ? "destructive" : "primary"}
            onClick={async () => {
              ModalService.resolve(true);
            }}>
            {modalState.confirmLabel ?? "Confirm"}
          </AppButton>
        </div>
      }>
      <div className="text-sm text-[var(--color-text-secondary)]">
        Proceed with this action?
      </div>
    </AppModal>
  );
}
