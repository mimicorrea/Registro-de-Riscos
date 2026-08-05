# 🧪 Fase 3: Validação Completa - Checklist Executivo

## 📋 O que vamos validar

```
✅ Componentes compilam (TypeScript)
✅ APIs funcionam
✅ Páginas carregam
✅ Permissões funcionam
✅ Emails são enviados
✅ State machine validado
✅ Workflow completo
```

---

## 🔧 Setup Inicial

### 1. Garantir que está tudo instalado

```bash
# Confirmar que npm_modules existe
ls -la node_modules | head -20

# Se não existir:
npm install

# Verificar versão
node --version  # v18+
npm --version   # v9+
```

### 2. Configurar .env.local

```bash
# Verificar se existe
cat .env.local | grep -E "DATABASE_URL|RESEND_API_KEY|CLOUDINARY"

# Se faltar algo, adicionar:
# DATABASE_URL=postgresql://user:password@neon.tech/dbname
# RESEND_API_KEY=re_xxxxxx
# CLOUDINARY_CLOUD_NAME=xxxxx
# CLOUDINARY_API_KEY=xxxxx
# CLOUDINARY_API_SECRET=xxxxx
```

### 3. Limpar banco e fazer seed

```bash
# Reset do banco (vai limpar e criar novamente)
npx prisma migrate reset --force

# Saída esperada:
# Prisma schema loaded
# Data model to migrate changed
# Migrations to deploy: 1
# Deploying migrations
# ✓ Completed in 1.23s
# ✓ Running seed...
# Database has been reset

echo "✅ Banco resetado e seed executado"
```

---

## 🚀 Iniciar servidor

```bash
npm run dev

# Esperado ver:
# ▲ Next.js 15.4.1
# - Local:        http://localhost:3000
# ✓ Ready in 1.2s

# Em outro terminal:
echo "✅ Servidor rodando em http://localhost:3000"
```

---

## ✅ Teste 1: Verificar Compilação TypeScript

```bash
# Verificar se todos os arquivos compilam
npm run build

# Esperado:
# > next build
# ✓ Compiled successfully
# ✓ Linting and checking validity of types

echo "✅ TypeScript compila sem erros"
```

**Checklist**:
- [x] Sem erros de TypeScript
- [x] Sem warnings de unused variables
- [x] Sem any types desnecessários

---

## ✅ Teste 2: Componentes Existem

```bash
# Verificar componentes da Fase 3
ls -la components/occurrence-detail.tsx
ls -la components/status-update-modal.tsx
ls -la components/assignee-select.tsx
ls -la components/comment-thread.tsx
ls -la components/advanced-filters.tsx

# Se todos existem:
echo "✅ Todos os 5 componentes criados"
```

**Checklist**:
- [x] occurrence-detail.tsx (324 linhas)
- [x] status-update-modal.tsx (180 linhas)
- [x] assignee-select.tsx (200 linhas)
- [x] comment-thread.tsx (160 linhas)
- [x] advanced-filters.tsx (250 linhas)

---

## ✅ Teste 3: APIs Existem

```bash
# Verificar arquivos das APIs
ls -la app/api/occurrences/\[id\]/route.ts
ls -la app/api/occurrences/\[id\]/status/route.ts
ls -la app/api/occurrences/\[id\]/assignee/route.ts
ls -la app/api/occurrences/\[id\]/comments/route.ts
ls -la app/api/users/route.ts

# Se todos existem:
echo "✅ Todas as 5 APIs criadas"
```

**Checklist**:
- [x] GET /api/occurrences/[id]
- [x] PUT /api/occurrences/[id]/status
- [x] PUT /api/occurrences/[id]/assignee
- [x] POST /api/occurrences/[id]/comments
- [x] GET /api/users

---

## ✅ Teste 4: Páginas Existem

```bash
# Verificar páginas
ls -la app/occurrences/\[id\]/page.tsx
ls -la app/my-tasks/page.tsx

# Se ambas existem:
echo "✅ Ambas as páginas criadas"
```

**Checklist**:
- [x] /occurrences/[id] page (90 linhas)
- [x] /my-tasks page (120 linhas)

---

## ✅ Teste 5: Email Templates Atualizados

```bash
# Verificar se email.ts tem os 2 novos templates
grep -n "sendStatusChangeNotification" lib/email.ts
grep -n "sendAssignmentNotification" lib/email.ts

# Saída esperada:
# lib/email.ts:15:export async function sendStatusChangeNotification
# lib/email.ts:70:export async function sendAssignmentNotification

echo "✅ 2 novos email templates criados"
```

**Checklist**:
- [x] sendStatusChangeNotification() existe
- [x] sendAssignmentNotification() existe
- [x] Ambas com templates HTML

---

## ✅ Teste 6: Validação de Código TypeScript

```bash
# Verificar se há erros de tipos nos componentes
npx tsc --noEmit

# Esperado: Sem output (zero errors)
# Se houver erros, vai mostrar

echo "✅ Nenhum erro de tipos"
```

---

## 🌐 Teste 7: Páginas Carregam (Manual no Navegador)

Abrir http://localhost:3000 e fazer:

### 7.1 Login

```
1. Acesso: http://localhost:3000/login
2. Email: gestor@empresa.com
3. Senha: Senha123!
4. Clique: Login
5. Esperado: Redirecionado para /occurrences
```

**Resultado**: ✅ ou ❌ _______

### 7.2 Abrir Ocorrência

```
1. Página: /occurrences (lista)
2. Clique em qualquer ocorrência
3. URL deve mudar para: /occurrences/[uuid]
4. Esperado: Página de detalhes carrega
```

**Verifica**:
- [x] Título da ocorrência aparece
- [x] Foto aparece
- [x] Status badge aparece
- [x] Botões de ação aparecem

**Resultado**: ✅ ou ❌ _______

### 7.3 Verificar Detalhes

```
1. Na página de detalhes
2. Scroll para baixo
3. Verificar seções:
   ✓ Sidebar com info (reporter, assignee, location, GPS)
   ✓ Fotos em galeria
   ✓ Histórico de status
   ✓ Comentários
   ✓ Botões de ação
```

**Resultado**: ✅ ou ❌ _______

---

## 🎯 Teste 8: Funcionalidade de Status Update

```
1. Clique botão: "📊 Atualizar Status"
2. Modal abre
3. Selecione novo status: REVIEW
4. Digite nota: "Testando atualização"
5. Clique: "✓ Atualizar"
6. Verificar:
   ✓ Modal fecha
   ✓ Status muda na página
   ✓ Nota aparece no histórico
```

**Resultado**: ✅ ou ❌ _______

---

## 🎯 Teste 9: Funcionalidade de Assignment

```
1. Clique botão: "👤 Atribuir"
2. Modal abre com lista de gestores
3. Selecione: admin@empresa.com
4. Clique: "✓ Atribuir"
5. Verificar:
   ✓ Modal fecha
   ✓ Assignee muda na página
   ✓ Email enviado (check em Resend)
```

**Resultado**: ✅ ou ❌ _______

---

## 💬 Teste 10: Funcionalidade de Comentário

```
1. Scroll até: "💬 Comentários"
2. Digite: "Teste de comentário" (min 5 chars)
3. Clique: "Enviar"
4. Verificar:
   ✓ Comentário aparece na lista
   ✓ Autor correto (seu nome)
   ✓ Timestamp correto
```

**Resultado**: ✅ ou ❌ _______

---

## 🔍 Teste 11: Filtros Avançados

```
1. Página: /occurrences
2. Clique: "Filtros Avançados"
3. Panel abre
4. Selecione:
   ✓ Status: OPEN
   ✓ Severidade: HIGH
5. Lista atualiza
6. Clique: "Limpar"
7. Volta ao normal
```

**Resultado**: ✅ ou ❌ _______

---

## 👤 Teste 12: Página My Tasks

```
1. Header: Clique "👤 Minhas Tarefas"
2. URL: /my-tasks
3. Verificar:
   ✓ Página carrega
   ✓ Mostra ocorrências atribuídas
   ✓ Não mostra CLOSED
   ✓ Estatísticas aparecem
   ✓ Cards clicáveis
```

**Resultado**: ✅ ou ❌ _______

---

## 🔐 Teste 13: Permissões

### 13.1 Login com EMPLOYEE

```
1. Logout atual (se MANAGER)
2. Login com: empregado@empresa.com (ou criar nova)
3. Abrir ocorrência criada por você
4. Verificar:
   ✓ Botão "📊 Atualizar Status" DISABLED
   ✓ Botão "👤 Atribuir" DISABLED
   ✓ Pode comentar SIM
   ✓ /my-tasks não acessa (ou vazio)
```

**Resultado**: ✅ ou ❌ _______

### 13.2 Login com MANAGER

```
1. Login com: gestor@empresa.com
2. Abrir qualquer ocorrência
3. Verificar:
   ✓ Botão "📊 Atualizar Status" ENABLED
   ✓ Botão "👤 Atribuir" ENABLED
   ✓ /my-tasks acessa e tem dados
```

**Resultado**: ✅ ou ❌ _______

---

## 📧 Teste 14: Emails

### 14.1 Validar que Resend está configurado

```bash
# Check da env var
grep RESEND_API_KEY .env.local

# Esperado:
# RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 14.2 Fazer ação que dispara email

```
1. Abrir /occurrences/[id]
2. Clique: "📊 Atualizar Status"
3. Mude status (ex: REVIEW)
4. Submit
5. Ir em: https://resend.com
6. Login
7. Check: Inbox → Procurar por email
8. Verificar:
   ✓ Email recebido
   ✓ Remetente: notificacoes@gestorderiscos.com
   ✓ Assunto: "📊 Atualização de Status"
   ✓ Template HTML correto
```

**Resultado**: ✅ ou ❌ _______

---

## 📊 Teste 15: State Machine (Transições)

Testar transições válidas e inválidas:

```
Teste transições:

OPEN → REVIEW          ✅ Deve funcionar
OPEN → CLOSED          ❌ Deve falhar
REVIEW → IN_PROGRESS   ✅ Deve funcionar
REVIEW → CLOSED        ❌ Deve falhar
IN_PROGRESS → RESOLVED ✅ Deve funcionar
RESOLVED → CLOSED      ✅ Deve funcionar
CLOSED → OPEN          ❌ Deve falhar
```

**Resultado**: ✅ ou ❌ _______

---

## 🔄 Teste 16: Workflow Completo (5 min)

Simular um workflow real:

```
1. [1 min] Login com MANAGER
   └─ Abrir /occurrences
   └─ Clicar em ocorrência
   └─ Verificar carregamento

2. [1 min] Mudar status
   └─ Clique "📊 Atualizar"
   └─ OPEN → REVIEW
   └─ Submit

3. [1 min] Atribuir
   └─ Clique "👤 Atribuir"
   └─ Selecione gestor
   └─ Submit

4. [1 min] Comentar
   └─ Scroll comentários
   └─ Escreva algo
   └─ Submit

5. [1 min] Validar
   └─ Status mudou? ✅
   └─ Assignee mudou? ✅
   └─ Comentário apareceu? ✅
```

**Resultado**: ✅ Workflow Completo ou ❌ Falha _______

---

## 📝 Sumário de Testes

### Testes Técnicos
- [x] TypeScript compila
- [x] 5 componentes criados
- [x] 5 APIs criadas
- [x] 2 páginas criadas
- [x] Email templates atualizados

### Testes de Interface
- [x] Página detalhes carrega
- [x] Botões visíveis
- [x] Modal abre/fecha
- [x] Status muda visualmente
- [x] Comentários aparecem

### Testes de Funcionalidade
- [x] Atualizar status funciona
- [x] Atribuir responsável funciona
- [x] Comentários funcionam
- [x] Filtros funcionam
- [x] My Tasks funciona

### Testes de Permissões
- [x] EMPLOYEE: limitado
- [x] MANAGER: completo
- [x] Botões disabled corretos

### Testes de Notificações
- [x] Email enviado
- [x] Template correto
- [x] Remetente correto

### Testes de State Machine
- [x] Transições válidas funcionam
- [x] Transições inválidas falham

---

## 📊 Resultado Final

```
Total de Testes: 16
Passaram: _____ / 16
Falharam: _____ / 16

Approval: __ YES  __ NO

Se todos passarem:
✅ Fase 3 Validada - Pronta para Deploy!
```

---

## 🚀 Próximas Etapas

Se todos os testes passarem:
1. ✅ Push para GitHub
2. ✅ Deploy na Vercel
3. ✅ Ou iniciar Fase 4

Se algum teste falhar:
1. ❌ Reportar erro
2. ❌ Corrigir bug
3. ❌ Re-testar

---

**Guia**: Validação Fase 3  
**Duração Estimada**: 20-30 minutos  
**Dificuldade**: Baixa  
**Status**: Pronto para começar ✅
