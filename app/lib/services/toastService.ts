export type ToastVariant = "success" | "error" | "info" | "warning" | "undo";

export interface ToastPayload {
    variant: ToastVariant;
    message: string;
    durationMs?: number;
    onUndo?: () => void;
}

type ToastListener = (payload: ToastPayload) => void;

class ToastServiceClass {
    private listener: ToastListener | null = null;

    registerListener(listener: ToastListener): void {
        this.listener = listener;
    }

    unregisterListener(): void {
        this.listener = null;
    }

    push(payload: ToastPayload): void {
        this.listener?.(payload);
    }

    success(message: string, durationMs = 3000): void {
        this.push({ variant: "success", message, durationMs });
    }

    error(message: string, durationMs = 4000): void {
        this.push({ variant: "error", message, durationMs });
    }

    info(message: string, durationMs = 3000): void {
        this.push({ variant: "info", message, durationMs });
    }

    warning(message: string, durationMs = 3500): void {
        this.push({ variant: "warning", message, durationMs });
    }

    undo(message: string, onUndo: () => void, durationMs = 5000): void {
        this.push({ variant: "undo", message, durationMs, onUndo });
    }
}

export const ToastService = new ToastServiceClass();
