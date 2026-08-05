'use client';

import { useEffect, useState } from 'react';

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
}

interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste dispositivo');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
        });
        setLoading(false);
      },
      (err) => {
        let errorMsg = 'Erro ao capturar localização';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Permissão de localização negada. Verifique as configurações do navegador.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'Localização indisponível no momento.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'Timeout ao capturar localização.';
        }
        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    // Tentar capturar localização automaticamente ao montar
    requestPermission();
  }, []);

  return { coordinates, loading, error, requestPermission };
}
