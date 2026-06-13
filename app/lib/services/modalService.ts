export type ConfirmOptions = {
  title: string;
  description: string;
  variant: "destructive" | "sensitive";
  onConfirm: () => void;
};

type ModalListener = (options: ConfirmOptions | null) => void;

class ModalService {
  private listener: ModalListener | null = null;

  register(listener: ModalListener) {
    this.listener = listener;
  }

  unregister() {
    this.listener = null;
  }

  confirm(options: ConfirmOptions) {
    this.listener?.(options);
  }

  close() {
    this.listener?.(null);
  }
}

export const modalService = new ModalService();
