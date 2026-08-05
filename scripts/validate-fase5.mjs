#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let total = 0;
let passed = 0;

const G = '\x1b[32m', R = '\x1b[31m', B = '\x1b[34m', X = '\x1b[0m';

function test(name, ok) {
  total++;
  console.log(`${ok ? G + '✓' : R + '✗'}${X} ${name}`);
  if (ok) passed++;
}

function exists(p) { return fs.existsSync(path.join(rootDir, p)); }
function has(p, t) { return fs.readFileSync(path.join(rootDir, p), 'utf8').includes(t); }

console.log(`${B}\n═══ Validação Fase 5 — Deploy & Produção ═══${X}\n`);

test('middleware.ts', exists('middleware.ts'));
test('Rate limiting', has('middleware.ts', 'checkRateLimit'));
test('Security headers', has('middleware.ts', 'X-Frame-Options'));
test('CORS configurado', has('middleware.ts', 'Access-Control-Allow-Origin'));
test('Proteção de rotas', has('middleware.ts', 'getToken'));

test('Zod validations', exists('lib/validations/occurrence.ts'));
test('Sanitização', exists('lib/sanitize.ts'));
test('API utils', exists('lib/api-utils.ts'));
test('POST occurrences usa Zod', has('app/api/occurrences/route.ts', 'createOccurrenceSchema'));
test('Upload autenticado', has('app/api/upload/route.ts', 'getServerSession'));

test('vercel.json', exists('vercel.json'));
test('CI GitHub Actions', exists('.github/workflows/ci.yml'));
test('Vercel Analytics', exists('components/vercel-analytics.tsx'));
test('Font/icon preload', has('app/layout.tsx', 'rel="preload"'));
test('Cache headers next.config', has('next.config.mjs', 'Cache-Control'));
test('compress habilitado', has('next.config.mjs', 'compress: true'));
test('Imagens AVIF/WebP', has('next.config.mjs', 'image/avif'));

console.log(`\n${passed}/${total} (${Math.round((passed / total) * 100)}%)\n`);
process.exit(passed === total ? 0 : 1);
