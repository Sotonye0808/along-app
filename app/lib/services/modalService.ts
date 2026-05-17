export interface ConfirmOptions {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
}

export interface ModalState extends ConfirmOptions {
    open: boolean;
}

type ModalStateListener = (state: ModalState, resolver: ((value: boolean) => void) | null) => void;

class ModalServiceClass {
    private listener: ModalStateListener | null = null;
    private resolver: ((value: boolean) => void) | null = null;

    registerListener(listener: ModalStateListener): void {
        this.listener = listener;
    }

    unregisterListener(): void {
        this.listener = null;
        this.resolver = null;
    }

    async confirm(options: ConfirmOptions): Promise<boolean> {
        if (!this.listener) {
            return false;
        }

        return new Promise<boolean>((resolve) => {
            this.resolver = resolve;
            this.listener?.({ open: true, ...options }, this.resolver);
        });
    }

    resolve(value: boolean): void {
        this.resolver?.(value);
        this.resolver = null;
        this.listener?.({ open: false, title: "" }, null);
    }
}

export const ModalService = new ModalServiceClass();
