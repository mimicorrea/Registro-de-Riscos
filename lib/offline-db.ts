const DB_NAME = 'gestor-riscos-offline';
const DB_VERSION = 1;

const STORES = {
  queue: 'occurrence-queue',
  occurrences: 'occurrences-cache',
  locations: 'locations-cache',
  meta: 'sync-meta',
} as const;

export type QueueStatus = 'pending' | 'syncing' | 'failed';

export type QueuedOccurrence = {
  id: string;
  createdAt: string;
  status: QueueStatus;
  retries: number;
  error?: string;
  payload: {
    title: string;
    description: string;
    category: string;
    severity: string;
    locationId: string | null;
    latitude: number | null;
    longitude: number | null;
    images: string[];
  };
};

export type CachedOccurrence = {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: string;
  locationName?: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponível'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.queue)) {
        db.createObjectStore(STORES.queue, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.occurrences)) {
        db.createObjectStore(STORES.occurrences, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.locations)) {
        db.createObjectStore(STORES.locations, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Erro ao abrir IndexedDB'));
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = fn(store);

    tx.oncomplete = () => {
      db.close();
      if (result instanceof IDBRequest) {
        resolve(result.result);
      } else {
        resolve();
      }
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error('Erro na transação IndexedDB'));
    };
  });
}

export async function addToQueue(item: QueuedOccurrence): Promise<void> {
  await withStore(STORES.queue, 'readwrite', (store) => store.put(item));
}

export async function getQueue(): Promise<QueuedOccurrence[]> {
  const items = (await withStore<QueuedOccurrence[]>(STORES.queue, 'readonly', (store) =>
    store.getAll()
  )) as QueuedOccurrence[] | void;
  return (items ?? []).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function updateQueueItem(item: QueuedOccurrence): Promise<void> {
  await withStore(STORES.queue, 'readwrite', (store) => store.put(item));
}

export async function removeFromQueue(id: string): Promise<void> {
  await withStore(STORES.queue, 'readwrite', (store) => store.delete(id));
}

export async function cacheOccurrences(items: CachedOccurrence[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.occurrences, 'readwrite');
    const store = tx.objectStore(STORES.occurrences);
    store.clear();
    for (const item of items) {
      store.put(item);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getCachedOccurrences(): Promise<CachedOccurrence[]> {
  const items = (await withStore<CachedOccurrence[]>(STORES.occurrences, 'readonly', (store) =>
    store.getAll()
  )) as CachedOccurrence[] | void;
  return items ?? [];
}

export async function cacheLocations(
  locations: { id: string; name: string; type: string; parentId?: string | null }[]
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.locations, 'readwrite');
    const store = tx.objectStore(STORES.locations);
    store.clear();
    for (const loc of locations) {
      store.put(loc);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getCachedLocations(): Promise<
  { id: string; name: string; type: string; parentId?: string | null }[]
> {
  const items = (await withStore(STORES.locations, 'readonly', (store) => store.getAll())) as
    | { id: string; name: string; type: string; parentId?: string | null }[]
    | void;
  return items ?? [];
}

export async function setLastSync(key: string, value: string): Promise<void> {
  await withStore(STORES.meta, 'readwrite', (store) => store.put({ key, value }));
}

export async function getLastSync(key: string): Promise<string | null> {
  const result = (await withStore(STORES.meta, 'readonly', (store) =>
    store.get(key)
  )) as { key: string; value: string } | undefined;
  return result?.value ?? null;
}
