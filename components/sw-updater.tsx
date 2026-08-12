'use client';

import { useEffect } from 'react';

/**
 * O next-pwa registra o Service Worker com skipWaiting: true, então uma
 * versão nova assume o controle assim que termina de instalar. Isso ajuda a
 * evitar páginas presas em versões antigas, mas recarregar a página na hora
 * (via "controllerchange") é arriscado: se o usuário estiver no meio de uma
 * ação — como enviar o login — o reload interrompe a requisição em
 * andamento, e do ponto de vista de quem usa o app parece que "travou".
 *
 * Por isso este componente só força uma checagem de atualização em segundo
 * plano ao abrir o app (sem recarregar nada). A versão nova assume o
 * controle e passa a valer normalmente na próxima navegação/reload natural
 * — o cache de páginas já é curto (5 min, ver next.config.mjs), então essa
 * próxima visita não demora para acontecer.
 */
export function SwUpdater() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration().then((registration) => {
      registration?.update().catch(() => {});
    });
  }, []);

  return null;
}
