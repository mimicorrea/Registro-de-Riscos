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

      // Solicitar acesso. Alguns dispositivos/navegadores não conseguem
      // satisfazer a combinação de câmera traseira + resolução ideal e
      // lançam OverconstrainedError — nesse caso, tentamos de novo com
      // restrições cada vez mais simples em vez de desistir direto.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Câmera traseira em celulares
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err) {
        if (err instanceof Error && err.name === 'OverconstrainedError') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
              audio: false,
            });
          } catch {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          }
        } else {
          throw err;
        }
      }

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        // Em alguns navegadores mobile (Safari/Chrome Android), atribuir o
        // srcObject via JS depois de um await não é suficiente para o
        // atributo autoPlay disparar sozinho — o vídeo fica "preso" sem
        // exibir a imagem, mesmo com a permissão já concedida. Chamamos
        // play() explicitamente para garantir que o stream realmente comece.
        try {
          await video.play();
        } catch {
          // Se o navegador ainda assim bloquear o autoplay, o próprio
          // elemento <video> com controls (abaixo) permite iniciar manualmente.
        }
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
        } else if (err.name === 'OverconstrainedError') {
          errorMsg = 'Câmera traseira não disponível neste dispositivo';
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
