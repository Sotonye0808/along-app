type QueueItem = {
  id: string;
  endpoint: string;
  method: "POST" | "PATCH" | "DELETE";
  body?: unknown;
  createdAt: number;
};

class OfflineQueue {
  private storageKey = "offlineQueue";
  private queue: QueueItem[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) this.queue = JSON.parse(stored);
      } catch {}
    }
  }

  enqueue(item: Omit<QueueItem, "id" | "createdAt">) {
    const entry: QueueItem = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
    this.queue.push(entry);
    this.persist();
    return entry;
  }

  dequeue(id: string) {
    this.queue = this.queue.filter((item) => item.id !== id);
    this.persist();
  }

  getAll(): QueueItem[] {
    return [...this.queue];
  }

  flush(): Promise<Response[]> {
    const promises = this.queue.map((item) =>
      fetch(item.endpoint, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: item.body ? JSON.stringify(item.body) : undefined,
      }).then((res) => {
        if (res.ok) this.dequeue(item.id);
        return res;
      })
    );
    return Promise.all(promises);
  }

  private persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch {}
  }
}

export const offlineQueue = new OfflineQueue();
