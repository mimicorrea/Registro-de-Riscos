'use client';

import { useState } from 'react';
import { useCamera } from '@/lib/hooks/useCamera';
import { Camera, X, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const { videoRef, canvasRef, isCameraActive, error, startCamera, stopCamera, capturePhoto, hasCamera } = useCamera();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartCamera = async () => {
    setLoading(true);
    await startCamera();
    setLoading(false);
  };

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      setCapturedImage(photo);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
    }
  };

  if (!hasCamera) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <Camera className="mx-auto mb-3 h-8 w-8" />
        <p>Câmera não disponível neste dispositivo.</p>
        <p className="mt-2 text-sm">Use a opção de upload ou galeria.</p>
      </div>
    );
  }

  if (error && !isCameraActive) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p>{error}</p>
        <button onClick={handleStartCamera} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!isCameraActive && !capturedImage) {
    return (
      <button
        onClick={handleStartCamera}
        disabled={loading}
        className="inline-flex w-full inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 gap-2 disabled:opacity-50"
      >
        <Camera className="h-5 w-5" />
        {loading ? 'Ativando câmera...' : 'Abrir câmera'}
      </button>
    );
  }

  if (isCameraActive && !capturedImage) {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
        <video ref={videoRef} autoPlay playsInline muted controls className="w-full rounded-2xl bg-black" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-3">
          <button
            onClick={handleCapture}
            className="flex-1 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 gap-2"
          >
            <Camera className="h-5 w-5" /> Capturar foto
          </button>
          <button
            onClick={() => {
              stopCamera();
              onCancel();
            }}
            className="flex-1 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 gap-2"
          >
            <X className="h-5 w-5" /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3">
          <img src={capturedImage} alt="Capturada" className="rounded-2xl" />
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 gap-2"
            >
              <Check className="h-5 w-5" /> Usar foto
            </button>
            <button
              onClick={() => {
                setCapturedImage(null);
                handleStartCamera();
              }}
              className="flex-1 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 gap-2"
            >
              <Camera className="h-5 w-5" /> Nova foto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
