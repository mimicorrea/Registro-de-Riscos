'use client';

import { useRef, useState } from 'react';
import { CameraCapture } from './camera-capture';
import { LazyImage } from './lazy-image';
import { Trash2, Eye } from 'lucide-react';
import { compressImage, isHeicFile, validateImageFile } from '@/lib/image-utils';

const MAX_IMAGES = 5;

interface ImageUploadProps {
  value?: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

export function ImageUpload({
  value = [],
  onChange,
  label = 'Fotos do problema',
  maxImages = MAX_IMAGES,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const images = value;
  const canAddMore = images.length < maxImages;

  const addImage = async (dataUrl: string) => {
    setError('');
    setLoading(true);
    try {
      const compressed = await compressImage(dataUrl);
      onChange([...images, compressed]);
    } catch {
      setError('Não foi possível processar a imagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setError('');
    setLoading(true);

    const remaining = maxImages - images.length;
    const toProcess = files.slice(0, remaining);
    const nextImages = [...images];

    for (const file of toProcess) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        // Navegadores Android/Chrome não conseguem decodificar HEIC via <canvas>,
        // então pulamos a compressão nesse caso e enviamos o arquivo original.
        // Diferente do Cloudinary, o armazenamento atual (Vercel Blob) não
        // converte formato — a foto HEIC é salva como está e pode não exibir
        // preview em navegadores sem suporte nativo a HEIC (ex.: Chrome Android).
        const processed = isHeicFile(file) ? dataUrl : await compressImage(dataUrl);
        nextImages.push(processed);
      } catch {
        setError('Falha ao processar uma das imagens.');
      }
    }

    onChange(nextImages);
    setLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = async (imageData: string) => {
    await addImage(imageData);
    setShowCamera(false);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="block">
        <span className="text-sm text-slate-600">
          {label} ({images.length}/{maxImages})
        </span>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        {canAddMore && !showCamera && (
          <div className="mt-3 space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                📷 Câmera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                🖼️ Galeria
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={loading}
              className="hidden"
            />
            {loading && <p className="text-xs text-slate-500">Processando imagem...</p>}
          </div>
        )}

        {showCamera && canAddMore && (
          <div className="mt-3">
            <CameraCapture
              onCapture={handleCameraCapture}
              onCancel={() => setShowCamera(false)}
            />
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {images.map((preview, index) => (
              <div key={`${index}-${preview.slice(0, 32)}`} className="space-y-2">
                <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                  <LazyImage
                    src={preview}
                    alt={`Foto ${index + 1}`}
                    className="h-40 w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => window.open(preview, '_blank')}
                      className="rounded-full bg-white/20 p-2 backdrop-blur hover:bg-white/30"
                      title="Visualizar em tamanho real"
                    >
                      <Eye className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Trash2 className="h-4 w-4" /> Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('Leitura inválida'));
    };
    reader.onerror = () => reject(new Error('Falha na leitura'));
    reader.readAsDataURL(file);
  });
}
