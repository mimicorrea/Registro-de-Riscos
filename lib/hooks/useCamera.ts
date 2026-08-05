'use client';

import { useRef, useState, useCallback } from 'react';

interface UseCamera {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isCameraActive: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => string | null;
  hasCamera: boolean;
}

export function useCamera(): UseCamera {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Verificar suporte
      const mediaDevices = navigator.mediaDevices || (navigator as any).webkitGetUserMedia;
      if (!mediaDevices) {
        setError('Câmera não suportada neste dispositivo');
        setHasCamera(false);
        return;
      }

      // Solicitar acesso
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmera traseira em celulares
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      let errorMsg = 'Erro ao acessar câmera';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg = 'Permissão de câmera negada';
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'Câmera não encontrada';
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'Câmera está sendo usada por outro aplicativo';
        }
      }
      setError(errorMsg);
      setHasCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  return {
    videoRef,
    canvasRef,
    isCameraActive,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    hasCamera,
  };
}
