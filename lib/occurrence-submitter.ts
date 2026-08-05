import { addToQueue, type QueuedOccurrence } from '@/lib/offline-db';

export type OccurrenceSubmitPayload = {
  title: string;
  description: string;
  category: string;
  severity: string;
  locationId: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  contact?: string | null;
};

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

async function submitOccurrence(
  payload: OccurrenceSubmitPayload,
  endpoints: { upload: string; occurrence: string }
) {
  const attachments: { url: string; label: string }[] = [];

  for (let i = 0; i < payload.images.length; i++) {
    const uploadRes = await fetch(endpoints.upload, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: payload.images[i] }),
    });

    if (!uploadRes.ok) {
      const uploadError = await uploadRes.json().catch(() => ({}));
      throw new Error(uploadError.error || 'Erro ao enviar imagem');
    }

    const uploadData = await uploadRes.json();
    attachments.push({
      url: uploadData.url,
      label: payload.images.length > 1 ? `Foto ${i + 1}` : 'Foto do problema',
    });
  }

  const res = await fetch(endpoints.occurrence, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      severity: payload.severity,
      locationId: payload.locationId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      attachments,
      ...(payload.contact !== undefined ? { contact: payload.contact } : {}),
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Erro ao registrar ocorrência');
  }

  return data;
}

export async function submitOccurrenceOnline(payload: OccurrenceSubmitPayload) {
  return submitOccurrence(payload, { upload: '/api/upload', occurrence: '/api/occurrences' });
}

export async function submitAnonymousOccurrenceOnline(payload: OccurrenceSubmitPayload) {
  return submitOccurrence(payload, {
    upload: '/api/public/upload',
    occurrence: '/api/public/occurrences',
  });
}

export async function queueOccurrenceOffline(payload: OccurrenceSubmitPayload): Promise<QueuedOccurrence> {
  const item: QueuedOccurrence = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    retries: 0,
    payload,
  };

  await addToQueue(item);
  return item;
}
