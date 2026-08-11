'use client';

import { useEffect } from 'react';

/**
 * O next-pwa registra o Service Worker com skipWaiting: true, então uma
 * versão nova assume o controle assim que termina de instalar — mas a
 * página já aberta continua rodando o HTML/JS antigo em memória até ser
 * recarregada. Sem isso, um app instalado (PWA) pode "parecer" desatualizado
 * mesmo depois do deploy, até o usuário fechar e reabrir manualmente.
 *
 * Este componente força uma checagem de atualização ao abrir o app e
 * recarrega a página automaticamente (uma única vez) quando detecta que o
 * Service Worker que está no controle mudou.
 */
export function SwUpdater() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let reloaded = false;
    const reloadOnce = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;
      registration.update().catch(() => {});
    });

    navigator.serviceWorker.addEventListener('controllerchange', reloadOnce);
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', reloadOnce);
    };
  }, []);

  return null;
}
