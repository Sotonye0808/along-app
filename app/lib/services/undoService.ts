import { ToastService } from "./toastService";

export interface UndoAction {
    id: string;
    executeUndo: () => void;
    expiresAt: number;
}

class UndoServiceClass {
    private actions = new Map<string, UndoAction>();

    registerAction(message: string, executeUndo: () => void, ttlMs = 5000): string {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const expiresAt = Date.now() + ttlMs;

        this.actions.set(id, { id, executeUndo, expiresAt });

        ToastService.undo(message, () => this.undo(id), ttlMs);

        globalThis.setTimeout(() => {
            const action = this.actions.get(id);
            if (action && action.expiresAt <= Date.now()) {
                this.actions.delete(id);
            }
        }, ttlMs + 50);

        return id;
    }

    undo(id: string): void {
        const action = this.actions.get(id);
        if (!action) {
            return;
        }
        this.actions.delete(id);
        action.executeUndo();
    }
}

export const UndoService = new UndoServiceClass();
