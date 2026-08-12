'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

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
  const streamRef = useRef<MediaStream | null>(null);
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

      // Importante: o <video> só é renderizado no JSX quando isCameraActive
      // é true (ver camera-capture.tsx), então nesse momento o elemento
      // ainda NÃO existe no DOM e videoRef.current é null — atribuir o
      // stream aqui não funcionaria. Guardamos o stream numa ref e deixamos
      // o useEffect abaixo (que roda depois do React montar o <video>)
      // fazer a atribuição de fato.
      streamRef.current = stream;
      setIsCameraActive(true);
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

  // Só roda depois que isCameraActive vira true e o React já comitou o
  // <video> no DOM — é aqui, e não dentro de startCamera, que o stream é
  // de fato ligado ao elemento.
  useEffect(() => {
    if (!isCameraActive || !streamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    // Em alguns navegadores mobile (Safari/Chrome Android), atribuir o
    // srcObject não é suficiente para o atributo autoPlay disparar
    // sozinho — a permissão é concedida mas o vídeo fica "preso" sem
    // exibir imagem. Chamamos play() explicitamente para garantir que o
    // stream realmente comece a ser exibido.
    video.play().catch(() => {
      // Se o navegador ainda assim bloquear o autoplay, o atributo
      // controls no <video> permite iniciar manualmente.
    });
  }, [isCameraActive]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Se o vídeo ainda não carregou o primeiro frame (ex.: usuário toca em
    // "Capturar foto" muito rápido, antes da câmera terminar de iniciar),
    // videoWidth/videoHeight ficam 0 — desenhar isso gera um canvas 0x0 e
    // capturePhoto() "funcionaria" retornando uma imagem em branco, sem
    // erro nenhum. Detectamos esse caso aqui e retornamos null para o
    // componente poder avisar em vez de deixar a foto sumir em silêncio.
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

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
