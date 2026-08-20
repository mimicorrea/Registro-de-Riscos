'use client';

import { useState } from 'react';
import { ImageUpload } from './image-upload';
import { useRouter } from 'next/navigation';

interface FollowUpUploadProps {
  occurrenceId: string;
}

export default function FollowUpUpload({ occurrenceId }: FollowUpUploadProps) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  const handleUpload = async () => {
    if (images.length === 0 || processingImage) return;

    setLoading(true);
    setError('');

    try {
      for (let i = 0; i < images.length; i++) {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: images[i] }),
        });

        if (!uploadRes.ok) {
          throw new Error('Erro ao enviar imagem');
        }

        const { url } = await uploadRes.json();

        const attachRes = await fetch(`/api/occurrences/${occurrenceId}/attachments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            label: `Correção ${i + 1}`,
          }),
        });

        if (!attachRes.ok) {
          throw new Error('Erro ao registrar foto de correção');
        }
      }

      setImages([]);
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ImageUpload
        value={images}
        onChange={setImages}
        onProcessingChange={setProcessingImage}
        label="Fotos da correção"
        maxImages={3}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">✓ Fotos de correção adicionadas!</p>}

      {images.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || processingImage}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? 'Enviando...'
            : processingImage
              ? 'Finalize a foto para continuar...'
              : 'Salvar fotos de correção'}
        </button>
      )}
    </div>
  );
}
