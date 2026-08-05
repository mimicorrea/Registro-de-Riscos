'use client';

import { useEffect, useState } from 'react';
import { cacheLocations, getCachedLocations } from '@/lib/offline-db';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

interface LocationNode {
  id: string;
  name: string;
  type: string;
  parentId?: string | null;
}

interface LocationSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function LocationSelect({ value, onChange }: LocationSelectProps) {
  const isOnline = useOnlineStatus();
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    async function loadLocations() {
      if (!isOnline) {
        const cached = await getCachedLocations();
        if (cached.length > 0) {
          setLocations(cached);
          setFromCache(true);
        }
        return;
      }

      try {
        const res = await fetch('/api/locations');
        const data = await res.json();
        const list = data.locations || [];
        setLocations(list);
        setFromCache(false);
        if (list.length > 0) {
          await cacheLocations(list);
        }
      } catch {
        const cached = await getCachedLocations();
        setLocations(cached);
        setFromCache(cached.length > 0);
      }
    }

    loadLocations();
  }, [isOnline]);

  return (
    <label className="block">
      <span className="text-sm text-slate-600">
        Local da ocorrência
        {fromCache && <span className="ml-1 text-xs text-amber-600">(cache offline)</span>}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/95 px-4 py-3 text-slate-800 outline-none"
      >
        <option value="">Selecione um local</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </label>
  );
}
