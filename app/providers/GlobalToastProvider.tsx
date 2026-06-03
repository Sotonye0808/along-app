"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GlobalUndoToast } from "@/app/components/ui";
import { toastService } from "@/app/lib/services/toastService";
import type { ToastOptions } from "@/app/lib/services/toastService";

export function GlobalToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ToastOptions | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setOptions(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    toastService.close();
  }, []);

  useEffect(() => {
    toastService.register((opts) => {
      if (opts) {
        setOptions(opts);
        setOpen(true);
        if (opts.duration) {
          timerRef.current = setTimeout(close, opts.duration);
        }
      } else {
        close();
      }
    });
    return () => {
      toastService.unregister();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [close]);

  return (
    <>
      {children}
      {options && (
        <GlobalUndoToast
          open={open}
          message={options.message}
          undoLabel={options.undoLabel}
          onUndo={options.onUndo || (() => {})}
          onAutoClose={close}
        />
      )}
    </>
  );
}
