'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { LocationSelect } from './location-select';
import { ImageUpload } from './image-upload';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useOfflineSync } from '@/components/offline-sync-provider';
import {
  isOnline,
  queueOccurrenceOffline,
  submitOccurrenceOnline,
  type OccurrenceSubmitPayload,
} from '@/lib/occurrence-submitter';
import { CATEGORIES, SEVERITIES } from '@/lib/enums';

const categoryLabels: Record<(typeof CATEGORIES)[number], string> = {
  ACCIDENT: 'Acidente',
  NEAR_MISS: 'Quase acidente',
  RISK: 'Risco',
  MAINTENANCE: 'Manutenção',
  INFRASTRUCTURE: 'Infraestrutura',
  SAFETY: 'Segurança',
  OTHER: 'Outros',
};

const severityLabels: Record<(typeof SEVERITIES)[number], string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export function OccurrenceForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { coordinates, loading: geoLoading, error: geoError, requestPermission } = useGeolocation();
  const { refreshCounts } = useOfflineSync();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'RISK' as (typeof CATEGORIES)[number],
    severity: 'MEDIUM' as (typeof SEVERITIES)[number],
    locationId: '',
    images: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [queuedOffline, setQueuedOffline] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!session?.user?.id) {
      setError('Faça login para registrar uma ocorrência.');
      return;
    }

    if (form.title.trim().length < 3) {
      setError('O título deve ter pelo menos 3 caracteres.');
      return;
    }

    if (form.description.trim().length < 10) {
      setError('A descrição deve ter pelo menos 10 caracteres.');
      return;
    }

    setLoading(true);

    const payload: OccurrenceSubmitPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      severity: form.severity,
      locationId: form.locationId || null,
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
      images: form.images,
    };

    try {
      if (!isOnline()) {
        await queueOccurrenceOffline(payload);
        await refreshCounts();
        setQueuedOffline(true);
        setSuccess(true);
        setForm({
          title: '',
          description: '',
          category: 'RISK',
          severity: 'MEDIUM',
          locationId: '',
          images: [],
        });
        return;
      }

      const data = await submitOccurrenceOnline(payload);

      setSuccess(true);
      setForm({
        title: '',
        description: '',
        category: 'RISK',
        severity: 'MEDIUM',
        locationId: '',
        images: [],
      });

      setTimeout(() => {
        if (data.occurrence?.id) {
          router.push(`/occurrences/${data.occurrence.id}`);
        } else {
          router.push('/occurrences');
        }
      }, 1500);
    } catch (err) {
      if (!isOnline()) {
        try {
          await queueOccurrenceOffline(payload);
          await refreshCounts();
          setQueuedOffline(true);
          setSuccess(true);
          setForm({
            title: '',
            description: '',
            category: 'RISK',
            severity: 'MEDIUM',
            locationId: '',
            images: [],
          });
        } catch {
          setError('Erro ao salvar offline. Tente novamente.');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao registrar ocorrência');
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Carregando sessão...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-800">
        <p>Você precisa estar logado para registrar ocorrências.</p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Ir para login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 ring-1 ring-slate-200">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          {queuedOffline
            ? '✓ Ocorrência salva localmente! Será sincronizada quando houver conexão.'
            : '✓ Ocorrência registrada com sucesso! Redirecionando...'}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">Título da ocorrência</span>
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
            minLength={3}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/95 px-4 py-3 text-slate-900 outline-none"
            placeholder="Descrição rápida do problema"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Categoria</span>
          <select
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value as (typeof CATEGORIES)[number] })
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/95 px-4 py-3 text-slate-900 outline-none"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">Nível de gravidade</span>
          <select
            value={form.severity}
            onChange={(event) =>
              setForm({ ...form, severity: event.target.value as (typeof SEVERITIES)[number] })
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/95 px-4 py-3 text-slate-900 outline-none"
          >
            {SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {severityLabels[severity]}
              </option>
            ))}
          </select>
        </label>
        <LocationSelect
          value={form.locationId}
          onChange={(value) => setForm({ ...form, locationId: value })}
        />
      </div>

      <label className="block">
        <span className="text-sm text-slate-600">Descrição detalhada</span>
        <textarea
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          required
          minLength={10}
          rows={6}
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50/95 px-4 py-3 text-slate-900 outline-none"
          placeholder="Explique o ocorrido, impacto e circunstâncias."
        />
      </label>

      <ImageUpload
        value={form.images}
        onChange={(images) => setForm({ ...form, images })}
        label="Fotos do problema (câmera ou galeria)"
      />

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/95 px-4 py-3">
        <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
        <div className="flex-1">
          <p className="text-sm text-slate-600">Geolocalização</p>
          {geoLoading && <p className="text-xs text-slate-500">Capturando localização...</p>}
          {geoError && <p className="text-xs text-red-500">{geoError}</p>}
          {coordinates && (
            <p className="text-xs text-emerald-600">
              ✓ Lat: {coordinates.latitude.toFixed(4)}, Lng: {coordinates.longitude.toFixed(4)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={requestPermission}
          disabled={geoLoading}
          className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'Registrar ocorrência'}
      </button>
    </form>
  );
}
