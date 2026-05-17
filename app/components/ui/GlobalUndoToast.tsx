"use client";

import React from "react";
import { Undo2 } from "lucide-react";
import { useGlobalToast } from "@/app/providers/GlobalToastProvider";
import { AppButton } from "./AppButton";

export interface UndoToastPayload {
  message: string;
  ttlMs?: number;
  onUndo?: () => void;
}

export function GlobalUndoToast(): React.ReactElement {
  const { currentToast, clearToast } = useGlobalToast();
  const payload =
    currentToast?.variant === "undo"
      ? {
          message: currentToast.message,
          ttlMs: currentToast.durationMs,
          onUndo: currentToast.onUndo,
        }
      : null;
  const [progress, setProgress] = React.useState<number>(100);

  React.useEffect(() => {
    if (!payload) {
      return;
    }

    setProgress(100);

    const ttlMs = payload.ttlMs ?? 5000;
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.max(0, 100 - (elapsed / ttlMs) * 100);
      setProgress(next);
      if (elapsed >= ttlMs) {
        window.clearInterval(timer);
        clearToast();
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [payload, clearToast]);

  if (!payload) {
    return <></>;
  }

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] p-3 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[var(--color-text-primary)]">
          {payload.message}
        </span>
        <AppButton
          variant="ghost"
          icon={Undo2}
          onClick={() => {
            payload.onUndo?.();
            clearToast();
          }}>
          Undo
        </AppButton>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-[var(--color-bg-elevated)]">
        <div
          className="h-1.5 rounded-full bg-[var(--color-primary)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
