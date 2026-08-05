#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

let total = 0;
let passed = 0;

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function test(name, condition) {
  total++;
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${name}`);
    passed++;
  } else {
    console.log(`${RED}✗${RESET} ${name}`);
  }
}

function exists(filePath) {
  return fs.existsSync(path.join(rootDir, filePath));
}

function contains(filePath, text) {
  try {
    return fs.readFileSync(path.join(rootDir, filePath), 'utf-8').includes(text);
  } catch {
    return false;
  }
}

console.log(`${BLUE}\n═══ Validação Fase 4 — Offline & Sync ═══${RESET}\n`);

test('lib/offline-db.ts', exists('lib/offline-db.ts'));
test('lib/offline-sync.ts', exists('lib/offline-sync.ts'));
test('lib/occurrence-submitter.ts', exists('lib/occurrence-submitter.ts'));
test('lib/hooks/useOnlineStatus.ts', exists('lib/hooks/useOnlineStatus.ts'));

test('IndexedDB queue store', contains('lib/offline-db.ts', 'occurrence-queue'));
test('Fila offline no formulário', contains('components/occurrence-form.tsx', 'queueOccurrenceOffline'));
test('Sync provider', exists('components/offline-sync-provider.tsx'));
test('Banner de status', exists('components/sync-status-banner.tsx'));
test('Lazy loading de imagens', exists('components/lazy-image.tsx'));
test('LazyImage no detalhe', contains('components/occurrence-detail.tsx', 'LazyImage'));

test('PWA next-pwa configurado', contains('next.config.mjs', 'next-pwa'));
test('Cache-first assets', contains('next.config.mjs', 'CacheFirst'));
test('Network-first APIs', contains('next.config.mjs', 'NetworkFirst'));
test('Stale-while-revalidate', contains('next.config.mjs', 'StaleWhileRevalidate'));

test('Cache de locais offline', contains('components/location-select.tsx', 'getCachedLocations'));
test('Cache de ocorrências', contains('components/occurrences-list.tsx', 'cacheOccurrences'));
test('Sincronização automática online', contains('components/offline-sync-provider.tsx', 'syncNow'));
test('Sync periódico', contains('components/offline-sync-provider.tsx', 'setInterval'));

test('Providers com OfflineSync', contains('app/providers.tsx', 'OfflineSyncProvider'));
test('Manifest PWA atualizado', contains('public/manifest.json', 'offline'));
test('Página offline', exists('app/offline/page.tsx'));
test('Painel fila offline', exists('components/offline-queue-panel.tsx'));
test('Botão instalar PWA', exists('components/pwa-install-button.tsx'));
test('Indicador online no header', contains('components/site-header.tsx', 'useOnlineStatus'));

const pct = Math.round((passed / total) * 100);
console.log(`\n${passed}/${total} (${pct}%)\n`);
process.exit(passed === total ? 0 : 1);
