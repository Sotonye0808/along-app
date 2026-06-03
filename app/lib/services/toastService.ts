type ToastType = "success" | "error" | "info" | "undo";

export type ToastOptions = {
  message: string;
  type: ToastType;
  duration?: number;
  undoLabel?: string;
  onUndo?: () => void;
};

type ToastListener = (options: ToastOptions | null) => void;

class ToastService {
  private listener: ToastListener | null = null;

  register(listener: ToastListener) {
    this.listener = listener;
  }

  unregister() {
    this.listener = null;
  }

  show(options: ToastOptions) {
    this.listener?.(options);
  }

  undo(options: Omit<ToastOptions, "type">) {
    this.listener?.({ ...options, type: "undo" });
  }

  success(message: string) {
    this.show({ message, type: "success", duration: 3000 });
  }

  error(message: string) {
    this.show({ message, type: "error", duration: 5000 });
  }

  info(message: string) {
    this.show({ message, type: "info", duration: 3000 });
  }

  close() {
    this.listener?.(null);
  }
}

export const toastService = new ToastService();
