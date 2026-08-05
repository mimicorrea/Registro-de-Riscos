'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { getPendingCount, processOfflineQueue, type SyncResult } from '@/lib/offline-sync';
import { getQueue } from '@/lib/offline-db';

type SyncState = {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncResult: SyncResult | null;
  lastSyncAt: string | null;
  syncNow: () => Promise<void>;
  refreshCounts: () => Promise<void>;
};

const OfflineSyncContext = createContext<SyncState | null>(null);

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const refreshCounts = useCallback(async () => {
    try {
      const queue = await getQueue();
      setPendingCount(queue.filter((q) => q.status === 'pending' || q.status === 'syncing').length);
      setFailedCount(queue.filter((q) => q.status === 'failed').length);
    } catch {
      setPendingCount(0);
      setFailedCount(0);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await processOfflineQueue();
      setLastSyncResult(result);
      setLastSyncAt(new Date().toISOString());
      await refreshCounts();

      if (result.synced > 0 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: result }));
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshCounts]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  useEffect(() => {
    if (isOnline) {
      syncNow();
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sincronização periódica (a cada 6h quando online)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(
      () => {
        syncNow();
      },
      6 * 60 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [isOnline, syncNow]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncNow();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [syncNow]);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingCount,
        failedCount,
        lastSyncResult,
        lastSyncAt,
        syncNow,
        refreshCounts,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const ctx = useContext(OfflineSyncContext);
  if (!ctx) {
    throw new Error('useOfflineSync deve ser usado dentro de OfflineSyncProvider');
  }
  return ctx;
}
