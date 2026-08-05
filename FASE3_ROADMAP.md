# 🎯 Fase 3: Tratativa de Ocorrências - Roadmap

## 📋 Resumo da Fase 3

Implementação do sistema de tratativa e gestão de ocorrências com funcionalidades para Gestores e Administradores:
- ✅ Página de detalhes da ocorrência
- ✅ Atualização de status
- ✅ Sistema de assignment (responsável)
- ✅ Thread de comentários
- ✅ Dashboard melhorado com filtros
- ✅ Relatórios básicos

**Esforço Estimado**: 25-30% do projeto (~30-40 horas)  
**Duração**: ~5-7 dias

---

## 🎨 Fluxo de Funcionalidades

```
Gestor acessa /occurrences
    ↓
Vê lista com filtros (status, categoria, severidade)
    ↓
Clica em uma ocorrência
    ↓
Abre página /occurrences/[id]
    ↓
Pode:
├─ 📊 Ver detalhes completos
├─ 👤 Atribuir responsável
├─ 📝 Mudar status (com nota)
├─ 💬 Adicionar comentário
├─ 📷 Upload de fotos de correção
└─ 📄 Ver histórico de mudanças

Dashboard Gestor
    ↓
├─ Estatísticas por status
├─ Ocorrências por severidade
├─ Tarefas do usuário
├─ Gráficos e progresso
└─ Filtros avançados
```

---

## 📦 Componentes Novos

### 1. `components/occurrence-detail.tsx` (NEW)
Página de detalhes com todas as informações da ocorrência.

**Props:**
```typescript
{
  occurrence: {
    id, title, description, category, severity,
    status, latitude, longitude,
    reporter: { name, email, role },
    assignee?: { name, email },
    location: { name },
    attachments: Attachment[],
    comments: Comment[],
    statusHistory: StatusHistory[],
    createdAt, updatedAt
  }
}
```

**Seções:**
- Header com título, categoria e gravidade
- Info card com localização e reporter
- Fotos (attachments)
- Histórico de status
- Thread de comentários

---

### 2. `components/status-update-modal.tsx` (NEW)
Modal para atualizar status com nota obrigatória.

**Fluxo:**
```
Modal abre
    ↓
Dropdown: OPEN → REVIEW → IN_PROGRESS → RESOLVED → CLOSED
    ↓
TextField: Nota de atualização
    ↓
Button: Atualizar
    ↓
API POST /api/occurrences/[id]/status
    ↓
Email enviado para reporter
    ↓
Modal fecha + página recarrega
```

---

### 3. `components/assignee-select.tsx` (NEW)
Seletor para designar responsável.

**Features:**
- Dropdown de usuários com role MANAGER/ADMIN
- Avatar + nome
- Botão de atribuir
- Mostrar assignee atual

---

### 4. `components/comment-thread.tsx` (NEW)
Sistema de comentários/discussão.

**Features:**
- Lista de comentários ordenados por data
- Nome do autor + avatar
- Timestamp relativo (e.g., "5 minutos atrás")
- Suporte a formatação básica (bold, italic)
- Botão de adicionar comentário

---

### 5. `components/follow-up-upload.tsx` (NEW)
Upload de fotos de correção/follow-up.

**Features:**
- Câmera ou galeria
- Múltiplos uploads
- Progress bar
- Label opcional para foto

---

### 6. `components/advanced-filters.tsx` (NEW)
Filtros avançados para lista de ocorrências.

**Filtros:**
- Status (multi-select)
- Severidade (multi-select)
- Categoria (multi-select)
- Data range
- Responsável
- Reporter
- Local

---

## 📡 APIs Novas/Atualizadas

### 1. `GET /api/occurrences/[id]` (NEW)
Retorna ocorrência com todos os relacionamentos.

```json
{
  "status": 200,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "category": "enum",
    "severity": "enum",
    "status": "enum",
    "latitude": "decimal",
    "longitude": "decimal",
    "reporter": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "enum"
    },
    "assignee": {
      "id": "uuid",
      "name": "string",
      "email": "string"
    },
    "location": {
      "id": "uuid",
      "name": "string"
    },
    "attachments": [
      {
        "id": "uuid",
        "url": "string",
        "label": "string",
        "createdAt": "timestamp"
      }
    ],
    "comments": [
      {
        "id": "uuid",
        "text": "string",
        "author": {
          "id": "uuid",
          "name": "string",
          "email": "string"
        },
        "createdAt": "timestamp"
      }
    ],
    "statusHistory": [
      {
        "id": "uuid",
        "status": "enum",
        "note": "string",
        "user": {
          "name": "string"
        },
        "createdAt": "timestamp"
      }
    ],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### 2. `PUT /api/occurrences/[id]/status` (NEW)
Atualiza status da ocorrência.

**Body:**
```json
{
  "status": "IN_PROGRESS",
  "note": "Iniciado reparo da estrutura",
  "userId": "uuid"
}
```

**Process:**
1. Validar novo status (state machine)
2. Atualizar Occurrence
3. Criar StatusHistory
4. Enviar email para reporter
5. Retornar ocorrência atualizada

---

### 3. `PUT /api/occurrences/[id]/assignee` (NEW)
Designa responsável.

**Body:**
```json
{
  "assigneeId": "uuid",
  "note": "Responsabilidade transferida para João"
}
```

**Process:**
1. Validar usuário (role MANAGER/ADMIN)
2. Atualizar assignee
3. Criar comment ou StatusHistory
4. Enviar email para novo responsável
5. Retornar ocorrência

---

### 4. `POST /api/occurrences/[id]/comments` (NEW)
Adiciona comentário.

**Body:**
```json
{
  "text": "Encontrado local exato do problema",
  "userId": "uuid"
}
```

**Process:**
1. Validar texto (min 5 chars, max 5000)
2. Criar Comment
3. Retornar comment criado

---

### 5. `GET /api/occurrences` (UPDATED)
Agora suporta filtros avançados.

**Query params:**
```
?status=OPEN,IN_PROGRESS
&severity=HIGH,CRITICAL
&category=SAFETY
&assigneeId=uuid
&reporterId=uuid
&locationId=uuid
&dateFrom=2026-06-01
&dateTo=2026-06-30
&search=termo
&page=1
&limit=20
&sortBy=createdAt
&sortOrder=desc
```

---

### 6. `GET /api/dashboard` (NEW)
Estatísticas para dashboard.

```json
{
  "totalOccurrences": 45,
  "byStatus": {
    "OPEN": 12,
    "REVIEW": 5,
    "IN_PROGRESS": 15,
    "RESOLVED": 10,
    "CLOSED": 3
  },
  "bySeverity": {
    "LOW": 8,
    "MEDIUM": 20,
    "HIGH": 12,
    "CRITICAL": 5
  },
  "myTasks": 7,
  "overdue": 2,
  "thisWeek": 8
}
```

---

## 📄 Páginas Novas

### 1. `/occurrences/[id]` (NEW)
Página de detalhes da ocorrência.

**Layout:**
```
┌─────────────────────────────────────┐
│ Header (Title, Status Badge)        │
├─────────────────────────────────────┤
│ Left Sidebar         │ Main Content │
├──────────────────────┤──────────────┤
│ - Info Card          │ Photos       │
│ - Reporter           │              │
│ - Assignee           │ Status       │
│ - Location           │ History      │
│ - Created            │              │
│                      │ Comments     │
│ Buttons:             │              │
│ - Edit               │ New Comment  │
│ - Update Status      │              │
│ - Assign to          │              │
│ - Add Photo          │              │
└──────────────────────┴──────────────┘
```

**Features:**
- Carregamento inicial via SSR (GetServerSideProps)
- Real-time updates via polling ou WebSocket (futuro)
- Permissões (só MANAGER/ADMIN podem editar)
- Breadcrumb navigation

---

### 2. `/occurrences` (UPDATED)
Lista melhorada com filtros.

**Mudanças:**
- Sidebar com filtros
- Pagination
- Sort options
- Search box
- Total de resultados

---

### 3. `/my-tasks` (NEW)
Tarefas atribuídas ao usuário.

**Mostra:**
- Ocorrências assignadas para o usuário
- Filtro: não resolvidas
- Ordenação: data de criação
- Status badge colorido

---

### 4. `/dashboard` (UPDATED)
Dashboard melhorado.

**Novos Cards:**
- Total de ocorrências abertas
- Ocorrências por severidade (gráfico de barras)
- Minhas tarefas pendentes
- Ocorrências vencidas (SLA)
- Atividade recente

---

## 🗄️ Schema Updates

### StatusHistory (Already exists, ensure structure)
```prisma
model StatusHistory {
  id        String   @id @default(cuid())
  occurrence Occurrence @relation(fields: [occurrenceId], references: [id], onDelete: Cascade)
  occurrenceId String
  status    Status   // OPEN, REVIEW, IN_PROGRESS, RESOLVED, CLOSED
  note      String
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  createdAt DateTime @default(now())
}
```

### Comment (Already exists, ensure structure)
```prisma
model Comment {
  id        String   @id @default(cuid())
  text      String   @db.Text
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  occurrence Occurrence @relation(fields: [occurrenceId], references: [id], onDelete: Cascade)
  occurrenceId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Occurrence (Update to add assignee)
```prisma
model Occurrence {
  // ... existing fields ...
  assignee   User?     @relation("AssignedOccurrences", fields: [assigneeId], references: [id])
  assigneeId String?
  
  // Relations
  reporter      User     @relation("ReportedOccurrences", fields: [reporterId], references: [id])
  reporterId    String
  comments      Comment[]
  statusHistory StatusHistory[]
  attachments   Attachment[]
}

model User {
  // ... existing fields ...
  reportedOccurrences   Occurrence[] @relation("ReportedOccurrences")
  assignedOccurrences   Occurrence[] @relation("AssignedOccurrences")
  statusHistories       StatusHistory[]
  comments              Comment[]
}
```

---

## 🔄 Email Templates (New)

### 1. Status Change Notification
```html
<h2>Atualização de Status</h2>
<p>Título: {{ title }}</p>
<p>Status Anterior: {{ previousStatus }}</p>
<p>Novo Status: {{ newStatus }}</p>
<p>Nota: {{ note }}</p>
<a href="{{ link }}">Ver Detalhes</a>
```

### 2. Assignment Notification
```html
<h2>Nova Atribuição</h2>
<p>Título: {{ title }}</p>
<p>Atribuído para: {{ assigneeName }}</p>
<p>Data: {{ createdAt }}</p>
<a href="{{ link }}">Ver Detalhes</a>
```

### 3. New Comment Notification
```html
<h2>Novo Comentário</h2>
<p>Em: {{ title }}</p>
<p>Autor: {{ authorName }}</p>
<p>Comentário: {{ comment }}</p>
<a href="{{ link }}">Ver Conversa</a>
```

---

## 🧪 Testes

### Acceptance Tests
- [ ] Abrir ocorrência → ver todos detalhes
- [ ] Atualizar status → email enviado
- [ ] Atribuir responsável → assignee recebe email
- [ ] Adicionar comentário → comentário aparece
- [ ] Filtrar ocorrências → lista atualizada
- [ ] Dashboard → estatísticas corretas
- [ ] Permissões → só MANAGER/ADMIN podem editar

### Edge Cases
- [ ] Ocorrência sem assignee
- [ ] Assignee mudança múltiplas vezes
- [ ] Status updates inválidas (RESOLVED → OPEN)
- [ ] Comentário muito longo
- [ ] Múltiplos usuários editando simultaneamente

---

## 🚀 Implementação (Ordem)

1. **Setup Banco** (1-2 horas)
   - [ ] Atualizar schema Prisma
   - [ ] Criar migration
   - [ ] Executar migration

2. **APIs** (3-4 horas)
   - [ ] GET /api/occurrences/[id]
   - [ ] PUT /api/occurrences/[id]/status
   - [ ] PUT /api/occurrences/[id]/assignee
   - [ ] POST /api/occurrences/[id]/comments
   - [ ] GET /api/occurrences (filtros)
   - [ ] GET /api/dashboard

3. **Componentes** (4-5 horas)
   - [ ] OccurrenceDetail
   - [ ] StatusUpdateModal
   - [ ] AssigneeSelect
   - [ ] CommentThread
   - [ ] FollowUpUpload
   - [ ] AdvancedFilters

4. **Páginas** (3-4 horas)
   - [ ] /occurrences/[id]
   - [ ] /occurrences (updated)
   - [ ] /my-tasks
   - [ ] /dashboard (updated)

5. **Email Templates** (1-2 horas)
   - [ ] Status change
   - [ ] Assignment
   - [ ] Comment notification

6. **Testes & Refinamentos** (2-3 horas)
   - [ ] Testar todos os flows
   - [ ] Validação de permissões
   - [ ] Error handling
   - [ ] Performance

---

## 📊 Exemplo de Workflow

```
João (Employee) cria ocorrência
    ↓
Email enviado para gestores
    ↓
Maria (Manager) recebe email
    ↓
Maria clica link → abre /occurrences/[id]
    ↓
Maria atualiza status OPEN → REVIEW
    ↓
Nota: "Analisando local exato"
    ↓
Submit
    ↓
Email enviado para João: "Seu relato está em análise"
    ↓
Maria atribui para Pedro (Gestor)
    ↓
Pedro recebe email: "Você foi designado responsável"
    ↓
Pedro abre página
    ↓
Pedro muda status REVIEW → IN_PROGRESS
    ↓
Nota: "Iniciando reparo"
    ↓
Pedro adiciona comentário: "Falta material, chegará amanhã"
    ↓
Maria e João recebem email
    ↓
Pedro volta + muda status → RESOLVED
    ↓
Foto de antes/depois uploaded
    ↓
Email de conclusão enviada
    ↓
✅ Done
```

---

## 🔐 Permissões

```
EMPLOYEE:
├─ Criar ocorrência ✅
├─ Ver suas ocorrências ✅
├─ Ver comentários ✅
├─ Adicionar comentário ✅
├─ Editar status ❌
└─ Atribuir responsável ❌

MANAGER:
├─ Criar ocorrência ✅
├─ Ver todas ocorrências ✅
├─ Ver comentários ✅
├─ Adicionar comentário ✅
├─ Editar status ✅
├─ Atribuir responsável ✅
└─ Dashboard com filtros ✅

ADMIN:
├─ Todas as permissões de MANAGER ✅
├─ Deletar ocorrência ✅
├─ Editar ocorrência ✅
└─ Gerenciar usuários ✅ (Fase 4)
```

---

## 📈 Success Metrics

- [ ] Tempo de resolução médio reduzido em 30%
- [ ] Responsabilidade clara (100% das ocorrências com assignee)
- [ ] Comunicação melhorada (comentários + emails)
- [ ] Rastreabilidade completa (status history)
- [ ] Dashboard útil (gestores usam para decisões)

---

## 🔮 Fase 4 Preview

- Offline capabilities (PWA sync)
- Notificações push
- Relatórios em PDF/Excel
- Integração com Slack/Teams
- Mobile app (React Native)

---

**Status**: 🟡 Fase 3 - Em Planejamento  
**Início**: 24 de junho de 2026  
**Duração Estimada**: 5-7 dias  
**Esforço**: 25-30% do projeto total
