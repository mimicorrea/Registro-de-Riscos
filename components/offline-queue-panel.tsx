'use client';

import { useEffect, useState } from 'react';
import { getQueue, removeFromQueue, updateQueueItem, type QueuedOccurrence } from '@/lib/offline-db';
import { useOfflineSync } from './offline-sync-provider';
import { RefreshCw, Trash2 } from 'lucide-react';

export function OfflineQueuePanel() {
  const { isOnline, isSyncing, pendingCount, failedCount, syncNow, refreshCounts } = useOfflineSync();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<QueuedOccurrence[]>([]);

  const total = pendingCount + failedCount;

  useEffect(() => {
    if (!open) return;

    async function load() {
      const queue = await getQueue();
      setItems(queue);
    }

    load();
  }, [open, pendingCount, failedCount, isSyncing]);

  if (total === 0) return null;

  const handleRetry = async (id: string) => {
    const item = items.find((q) => q.id === id);
    if (!item) return;

    await updateQueueItem({ ...item, status: 'pending', retries: 0, error: undefined });
    await refreshCounts();
    if (isOnline) await syncNow();
    setItems(await getQueue());
  };

  const handleRemove = async (id: string) => {
    await removeFromQueue(id);
    await refreshCounts();
    setItems(await getQueue());
  };

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          {open ? 'Ocultar fila offline' : `Ver fila offline (${total})`}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-3 max-w-7xl space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum item na fila.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{item.payload.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.status === 'failed' ? 'Falhou' : 'Pendente'} ·{' '}
                    {new Date(item.createdAt).toLocaleString('pt-BR')}
                    {item.error ? ` · ${item.error}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {item.status === 'failed' && (
                    <button
                      type="button"
                      onClick={() => handleRetry(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Tentar de novo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
