type UndoAction = {
  id: string;
  label: string;
  onUndo: () => void;
  createdAt: number;
};

class UndoService {
  private actions: Map<string, UndoAction> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private defaultTimeout = 10000;

  register(action: Omit<UndoAction, "createdAt">, timeout?: number) {
    this.actions.set(action.id, { ...action, createdAt: Date.now() });
    const timer = setTimeout(() => {
      this.actions.delete(action.id);
    }, timeout ?? this.defaultTimeout);
    this.timers.set(action.id, timer);
  }

  execute(id: string) {
    const action = this.actions.get(id);
    if (action) {
      action.onUndo();
      this.dismiss(id);
    }
  }

  dismiss(id: string) {
    this.actions.delete(id);
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
  }

  getAction(id: string): UndoAction | undefined {
    return this.actions.get(id);
  }
}

export const undoService = new UndoService();
