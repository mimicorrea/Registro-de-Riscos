'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { OfflineSyncProvider } from '@/components/offline-sync-provider';
import { SyncStatusBanner } from '@/components/sync-status-banner';

export function Providers({ children, session }: { children: React.ReactNode; session?: Session }) {
  return (
    <SessionProvider session={session}>
      <OfflineSyncProvider>
        <SyncStatusBanner />
        {children}
      </OfflineSyncProvider>
    </SessionProvider>
  );
}
