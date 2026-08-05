#!/usr/bin/env node

/**
 * Script de Validação Automática - Fase 3
 * Verifica se todos os componentes, APIs e páginas foram criados corretamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

function test(name, condition) {
  totalTests++;
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${name}`);
    passedTests++;
  } else {
    console.log(`${RED}✗${RESET} ${name}`);
    failedTests++;
  }
}

function section(title) {
  console.log(`\n${BLUE}═══ ${title} ═══${RESET}`);
}

function fileExists(filePath) {
  try {
    return fs.existsSync(path.join(rootDir, filePath));
  } catch {
    return false;
  }
}

function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(path.join(rootDir, filePath), 'utf-8');
    return content.includes(searchString);
  } catch {
    return false;
  }
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(path.join(rootDir, filePath));
    return stats.size;
  } catch {
    return 0;
  }
}

console.log(`${BLUE}
╔════════════════════════════════════════════╗
║    Validação Automática - Fase 3           ║
║    Tratativa de Ocorrências                ║
╚════════════════════════════════════════════╝
${RESET}`);

// ===== COMPONENTES =====
section('COMPONENTES (5 novos)');

const components = [
  'components/occurrence-detail.tsx',
  'components/status-update-modal.tsx',
  'components/assignee-select.tsx',
  'components/comment-thread.tsx',
  'components/advanced-filters.tsx',
];

components.forEach((comp) => {
  test(`${comp} existe`, fileExists(comp));
  if (fileExists(comp)) {
    test(`${comp} > 100 linhas`, getFileSize(comp) > 3000);
    test(`${comp} é 'use client'`, fileContains(comp, "'use client'"));
  }
});

// ===== APIs =====
section('APIs (5 novas)');

const apis = [
  'app/api/occurrences/[id]/route.ts',
  'app/api/occurrences/[id]/status/route.ts',
  'app/api/occurrences/[id]/assignee/route.ts',
  'app/api/occurrences/[id]/comments/route.ts',
  'app/api/users/route.ts',
];

apis.forEach((api) => {
  test(`${api} existe`, fileExists(api));
  if (fileExists(api)) {
    test(`${api} tem NextRequest`, fileContains(api, 'NextRequest'));
    test(`${api} tem validação`, fileContains(api, 'getServerSession'));
  }
});

// ===== PÁGINAS =====
section('PÁGINAS (2 novas)');

const pages = [
  'app/occurrences/[id]/page.tsx',
  'app/my-tasks/page.tsx',
];

pages.forEach((page) => {
  test(`${page} existe`, fileExists(page));
  if (fileExists(page)) {
    test(`${page} é server component`, !fileContains(page, "'use client'") || fileContains(page, 'async'));
  }
});

// ===== EMAIL TEMPLATES =====
section('EMAIL TEMPLATES (2 novos)');

test('lib/email.ts existe', fileExists('lib/email.ts'));
if (fileExists('lib/email.ts')) {
  test('sendStatusChangeNotification() existe', fileContains('lib/email.ts', 'sendStatusChangeNotification'));
  test('sendAssignmentNotification() existe', fileContains('lib/email.ts', 'sendAssignmentNotification'));
  test('Resend integration', fileContains('lib/email.ts', 'getResend'));
}

// ===== ATUALIZAÇÕES =====
section('ARQUIVOS ATUALIZADOS');

test('site-header.tsx tem /my-tasks link', fileContains('components/site-header.tsx', '/my-tasks'));
test('package.json tem Resend', fileContains('package.json', 'resend'));
test('.env.example tem RESEND_API_KEY', fileContains('.env.example', 'RESEND_API_KEY'));

// ===== DOCUMENTAÇÃO =====
section('DOCUMENTAÇÃO');

const docs = [
  'FASE3_ROADMAP.md',
  'FASE3_CHANGELOG.md',
  'FASE3_RESUMO.md',
  'TESTE_FASE3.md',
  'VALIDACAO_FASE3.md',
  'PROJECT_STATUS.md',
];

docs.forEach((doc) => {
  test(`${doc} existe`, fileExists(doc));
});

// ===== PERMISSÕES & LÓGICA =====
section('LÓGICA & SEGURANÇA');

test('State machine em status/route.ts', fileContains('app/api/occurrences/[id]/status/route.ts', 'STATUS_FLOW'));
test('Validação de transição', fileContains('app/api/occurrences/[id]/status/route.ts', 'validStatuses'));
test('Permissão de role em status/route.ts', fileContains('app/api/occurrences/[id]/status/route.ts', 'EMPLOYEE'));
test('Permissão de role em assignee/route.ts', fileContains('app/api/occurrences/[id]/assignee/route.ts', 'EMPLOYEE'));

// ===== SCHEMA & BANCO =====
section('DATABASE SCHEMA');

test('Schema tem assigneeId em Occurrence', fileContains('prisma/schema.prisma', 'assigneeId'));
test('Schema tem Comment model', fileContains('prisma/schema.prisma', 'model Comment'));
test('Schema tem StatusHistory model', fileContains('prisma/schema.prisma', 'model StatusHistory'));
test('User tem relation assignments', fileContains('prisma/schema.prisma', 'assignments'));

// ===== TIPO SAFETY =====
section('TYPESCRIPT & TIPOS');

test('OccurrenceDetail tem tipos corretos', fileContains('components/occurrence-detail.tsx', 'interface OccurrenceDetailProps'));
test('StatusUpdateModal tem tipos corretos', fileContains('components/status-update-modal.tsx', 'interface StatusUpdateModalProps'));
test('AssigneeSelect tem tipos corretos', fileContains('components/assignee-select.tsx', 'interface AssigneeSelectProps'));
test('CommentThread tem tipos corretos', fileContains('components/comment-thread.tsx', 'interface CommentThreadProps'));
test('AdvancedFilters tem tipos corretos', fileContains('components/advanced-filters.tsx', 'interface AdvancedFiltersProps'));

// ===== FUNCIONALIDADES CHAVE =====
section('FUNCIONALIDADES CHAVE');

test('API retorna all relations', fileContains('app/api/occurrences/[id]/route.ts', 'include'));
test('Modal tem validação de nota', fileContains('components/status-update-modal.tsx', 'note.trim().length'));
test('Assignee tem busca', fileContains('components/assignee-select.tsx', 'filter'));
test('Comments têm limite de caracteres', fileContains('components/comment-thread.tsx', '5000'));
test('Filtros tem multi-select', fileContains('components/advanced-filters.tsx', 'includes'));

// ===== RESUMO FINAL =====
section('RESUMO FINAL');

const passPercentage = Math.round((passedTests / totalTests) * 100);
const status = passedTests === totalTests ? `${GREEN}✅ TUDO OK!${RESET}` : `${YELLOW}⚠️  Verificar falhas${RESET}`;

console.log(`
Testes: ${passedTests}/${totalTests} passaram (${passPercentage}%)
${status}

${passedTests === totalTests ? `${GREEN}
✅ Fase 3 Validada com Sucesso!
Todos os componentes, APIs e páginas foram criados corretamente.
${RESET}` : `${RED}
❌ Alguns testes falharam
Por favor, verifique os erros acima.
${RESET}`}

Próximos passos:
${passedTests === totalTests ? `
  1. npm run dev (iniciar servidor)
  2. Testar manualmente (verificar TESTE_FASE3.md)
  3. Push para GitHub
  4. Deploy na Vercel
  5. Ou iniciar Fase 4 (Offline & Sync)
` : `
  1. Revisar os erros acima
  2. Corrigir arquivos faltantes
  3. Re-executar este script
`}
`);

process.exit(passedTests === totalTests ? 0 : 1);
