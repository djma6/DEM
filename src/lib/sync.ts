// Background online sync with a pending-changes queue.
// Every mutation is queued, flushed to the server in the background, and
// surfaced to the UI so the user knows when data is safely stored online.

export type SyncState = "idle" | "syncing" | "saved" | "error";

interface Listener {
  onStateChange: (s: SyncState, detail?: string) => void;
}

type QueueItem =
  | { kind: "event-upsert"; payload: Record<string, unknown>; id?: number }
  | { kind: "event-delete"; id: number }
  | { kind: "reminder-create"; payload: Record<string, unknown> }
  | { kind: "reminder-delete"; id: number }
  | { kind: "bankcard-create"; payload: Record<string, unknown> }
  | { kind: "bankcard-delete"; id: number };

const QUEUE_KEY = "djPendingSyncQueue";
const STATE_KEY = "djLastSyncAt";

let queue: QueueItem[] = [];
let flushing = false;
let state: SyncState = "idle";
const listeners = new Set<Listener>();

function persistQueue() {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* ignore quota errors */
  }
}

function loadQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (raw) queue = JSON.parse(raw) as QueueItem[];
  } catch {
    queue = [];
  }
}

function emit(next: SyncState, detail?: string) {
  state = next;
  listeners.forEach((l) => l.onStateChange(next, detail));
}

export function getSyncState(): SyncState {
  return state;
}

export function pendingCount(): number {
  return queue.length;
}

export function lastSyncAt(): string | null {
  try {
    return localStorage.getItem(STATE_KEY);
  } catch {
    return null;
  }
}

export function subscribeSync(l: Listener): () => void {
  listeners.add(l);
  l.onStateChange(state);
  return () => listeners.delete(l);
}

async function send(item: QueueItem): Promise<void> {
  const payload = "payload" in item ? item.payload : {};
  const json = JSON.stringify(payload);
  switch (item.kind) {
    case "event-upsert": {
      const res = item.id
        ? await fetch(`/api/events/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: json })
        : await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: json });
      if (!res.ok) throw new Error(`event-upsert failed (${res.status})`);
      return;
    }
    case "event-delete": {
      const res = await fetch(`/api/events/${item.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error(`event-delete failed (${res.status})`);
      return;
    }
    case "reminder-create": {
      const res = await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: json });
      if (!res.ok) throw new Error(`reminder-create failed (${res.status})`);
      return;
    }
    case "reminder-delete": {
      const res = await fetch(`/api/reminders/${item.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error(`reminder-delete failed (${res.status})`);
      return;
    }
    case "bankcard-create": {
      const res = await fetch("/api/bank-cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: json });
      if (!res.ok) throw new Error(`bankcard-create failed (${res.status})`);
      return;
    }
    case "bankcard-delete": {
      const res = await fetch(`/api/bank-cards/${item.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error(`bankcard-delete failed (${res.status})`);
      return;
    }
  }
}

/** Run the queue in the background. Safe to call repeatedly. */
export async function flushQueue(): Promise<SyncState> {
  if (flushing) return state;
  if (queue.length === 0) {
    if (state !== "error") emit("idle");
    return state;
  }
  flushing = true;
  emit("syncing");
  try {
    while (queue.length > 0) {
      const item = queue[0];
      await send(item);
      queue = queue.slice(1);
      persistQueue();
    }
    try {
      localStorage.setItem(STATE_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    emit("saved");
    // Return to idle shortly so the badge can settle
    setTimeout(() => { if (state === "saved") emit("idle"); }, 1800);
    return "saved";
  } catch (e) {
    emit("error", e instanceof Error ? e.message : "unknown");
    return "error";
  } finally {
    flushing = false;
  }
}

/** Queue a change and start a background flush immediately. */
export function queueChange(item: QueueItem): void {
  queue.push(item);
  persistQueue();
  void flushQueue();
}

export function retrySync(): void {
  void flushQueue();
}

/** Load any previously persisted queue (e.g. after a reload). */
export function initSync(): void {
  loadQueue();
  if (queue.length > 0) void flushQueue();
}
