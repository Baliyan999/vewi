/**
 * Tiny typed wrapper around IndexedDB for the upload queue.
 * No external deps — keeps the bundle small.
 */

const DB_NAME = "qr-photo-queue";
const DB_VERSION = 1;
const STORE = "outbox";

export type OutboxItem = {
  id: string;
  eventId: string;
  deviceId: string;
  guestName?: string;
  kind: "photo" | "video";
  blob: Blob;
  filename: string;
  createdAt: number;
  attempts: number;
  nextAttemptAt: number;
};

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("nextAttemptAt", "nextAttemptAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueue(item: OutboxItem): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listPending(): Promise<OutboxItem[]> {
  const db = await open();
  const items = await new Promise<OutboxItem[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as OutboxItem[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items.sort((a, b) => a.createdAt - b.createdAt);
}

export async function remove(id: string): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function update(item: OutboxItem): Promise<void> {
  await enqueue(item);
}

export async function count(): Promise<number> {
  const db = await open();
  const n = await new Promise<number>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return n;
}
