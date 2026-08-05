'use client';

import { CloudOff, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOfflineSync } from './offline-sync-provider';
import { OfflineQueuePanel } from './offline-queue-panel';

export function SyncStatusBanner() {
  const { isOnline, isSyncing, pendingCount, failedCount, syncNow } = useOfflineSync();

  if (isOnline && pendingCount === 0 && failedCount === 0) {
    return null;
  }

  return (
    <div
      className={`border-b px-4 py-2 text-sm ${
        !isOnline
          ? 'border-amber-200 bg-amber-50 text-amber-900'
          : failedCount > 0
            ? 'border-red-200 bg-red-50 text-red-800'
            : 'border-blue-200 bg-blue-50 text-blue-900'
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>Modo offline — novos registros serão sincronizados ao reconectar</span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
              <span>Sincronizando dados pendentes...</span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <CloudOff className="h-4 w-4 shrink-0" />
              <span>
                {pendingCount} ocorrência(s) aguardando sincronização
              </span>
            </>
          ) : failedCount > 0 ? (
            <>
              <CloudOff className="h-4 w-4 shrink-0" />
              <span>{failedCount} item(ns) falharam na sincronização</span>
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 shrink-0" />
              <span>Conectado</span>
            </>
          )}
        </div>

        {isOnline && (pendingCount > 0 || failedCount > 0) && (
          <button
            type="button"
            onClick={() => syncNow()}
            disabled={isSyncing}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar agora
          </button>
        )}
      </div>
      <OfflineQueuePanel />
    </div>
  );
}
