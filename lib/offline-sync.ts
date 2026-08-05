import {
  getQueue,
  removeFromQueue,
  setLastSync,
  updateQueueItem,
  type QueuedOccurrence,
} from '@/lib/offline-db';
import { submitOccurrenceOnline } from '@/lib/occurrence-submitter';

const MAX_RETRIES = 3;

export type SyncResult = {
  synced: number;
  failed: number;
  remaining: number;
};

export async function processOfflineQueue(): Promise<SyncResult> {
  const queue = await getQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.status === 'failed' && item.retries >= MAX_RETRIES) {
      failed++;
      continue;
    }

    const syncing: QueuedOccurrence = { ...item, status: 'syncing', error: undefined };
    await updateQueueItem(syncing);

    try {
      await submitOccurrenceOnline(syncing.payload);
      await removeFromQueue(syncing.id);
      synced++;
    } catch (err) {
      const retries = syncing.retries + 1;
      const message = err instanceof Error ? err.message : 'Erro de sincronização';
      await updateQueueItem({
        ...syncing,
        status: retries >= MAX_RETRIES ? 'failed' : 'pending',
        retries,
        error: message,
      });
      failed++;
    }
  }

  const remaining = (await getQueue()).filter((q) => q.status !== 'failed').length;
  await setLastSync('occurrences', new Date().toISOString());

  return { synced, failed, remaining };
}

export async function getPendingCount(): Promise<number> {
  const queue = await getQueue();
  return queue.filter((q) => q.status === 'pending' || q.status === 'syncing').length;
}
