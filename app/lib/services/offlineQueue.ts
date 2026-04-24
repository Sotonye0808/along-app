export interface OfflineQueueAction {
    id: string;
    type: string;
    payload: Record<string, unknown>;
    createdAt: number;
}

const STORAGE_KEY = "along_offline_queue";

class OfflineQueueService {
    private queue: OfflineQueueAction[] = [];

    constructor() {
        if (typeof window !== "undefined") {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            this.queue = raw ? (JSON.parse(raw) as OfflineQueueAction[]) : [];
        }
    }

    enqueue(type: string, payload: Record<string, unknown>): OfflineQueueAction {
        const action: OfflineQueueAction = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            payload,
            createdAt: Date.now(),
        };
        this.queue.push(action);
        this.persist();
        return action;
    }

    dequeue(): OfflineQueueAction | undefined {
        const action = this.queue.shift();
        this.persist();
        return action;
    }

    list(): OfflineQueueAction[] {
        return [...this.queue];
    }

    clear(): void {
        this.queue = [];
        this.persist();
    }

    private persist(): void {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
        }
    }
}

export const OfflineQueue = new OfflineQueueService();
