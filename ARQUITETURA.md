# Gestor de Riscos - PWA Corporativo 🚀

## Etapa 1: Arquitetura Inicial ✅ Concluída

Este documento resume o setup inicial do projeto e todos os componentes implementados.

---

## 📋 Estrutura de Pastas

```
gestor-de-riscos/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts     # NextAuth configuration
│   │   ├── occurrences/route.ts            # Get/Create occurrences
│   │   ├── locations/route.ts              # Get locations hierarchy
│   │   └── upload/route.ts                 # Image upload to Cloudinary
│   ├── dashboard/page.tsx                  # Manager dashboard
│   ├── login/page.tsx                      # Login form (client-side)
│   ├── occurrences/
│   │   ├── page.tsx                        # Occurrences list
│   │   └── new/page.tsx                    # Create occurrence
│   ├── globals.css                         # Tailwind + Global styles
│   ├── layout.tsx                          # Root layout with SessionProvider
│   ├── page.tsx                            # Homepage
│   └── providers.tsx                       # NextAuth Session wrapper
├── components/
│   ├── location-select.tsx                 # Location picker component
│   ├── occurrence-form.tsx                 # Form for registering occurrences
│   ├── site-header.tsx                     # Navigation header
│   └── status-badge.tsx                    # Status display component
├── lib/
│   ├── auth.ts                             # NextAuth configuration (Credentials provider)
│   ├── prisma.ts                           # Prisma singleton client
│   └── cloudinary.ts                       # Cloudinary image upload
├── prisma/
│   ├── schema.prisma                       # Database schema (PostgreSQL)
│   └── seed.ts                             # Seed data: admin, manager, locations
├── public/
│   ├── manifest.json                       # PWA web app manifest
│   └── icons/
│       ├── icon-192.png                    # App icon (192x192)
│       └── icon-512.png                    # App icon (512x512)
├── scripts/
│   └── generate-icons.js                   # Icon generation script
├── next.config.mjs                         # Next.js + PWA configuration
├── tailwind.config.ts                      # Tailwind design system
├── tsconfig.json                           # TypeScript configuration
├── postcss.config.js                       # PostCSS + Tailwind
├── package.json                            # Dependencies + scripts
└── .env.example                            # Environment template
```

---

## 🗄️ Banco de Dados (Prisma Schema)

### Enums
- **RoleName**: EMPLOYEE, MANAGER, ADMIN
- **Category**: ACCIDENT, NEAR_MISS, RISK, MAINTENANCE, INFRASTRUCTURE, SAFETY, OTHER
- **Severity**: LOW, MEDIUM, HIGH, CRITICAL
- **Status**: OPEN, REVIEW, IN_PROGRESS, RESOLVED, CLOSED

### Modelos Principais
1. **User**: Usuários com roles, autenticação NextAuth
2. **Account**: Integração NextAuth (para futuros provedores)
3. **Session**: Gerenciamento de sessões NextAuth
4. **Location**: Hierarquia de locais (Campus → Blocos → Salas)
5. **Occurrence**: Registro de incidente com fotos, geoloc, histórico
6. **Attachment**: URLs de imagens (Cloudinary)
7. **Comment**: Anotações no incidente
8. **StatusHistory**: Trilha de mudanças de status
9. **AuditLog**: Logs de auditoria de usuários

---

## 🛠️ APIs Implementadas

### 1. `POST /api/auth/[...nextauth]`
- Estratégia Credentials (email/senha)
- Database sessions (Prisma Adapter)
- Callback de sessão com role do usuário

### 2. `GET /api/occurrences` | `POST /api/occurrences`
- Listar todas as ocorrências com relacionamentos
- Criar nova ocorrência com foto e localização
- Suporte a Decimal para GPS (latitude/longitude)

### 3. `GET /api/locations`
- Retorna hierarquia completa de locais
- Estrutura de árvore para seleção em cascata

### 4. `POST /api/upload`
- Upload de imagens para Cloudinary
- Retorna URL segura da imagem

---

## 🎨 Componentes React

### `site-header.tsx`
- Navegação persistente
- Links para dashboard, ocorrências, login
- Ícone de notificações

### `occurrence-form.tsx` (Client Component)
- Campos: Título, Descrição, Categoria, Gravidade, Local
- Seletor de local com dados dinâmicos
- Placeholders para câmera e geolocalização
- Envio para `/api/occurrences`

### `location-select.tsx` (Client Component)
- Carrega locais de `/api/locations`
- Select dropdown para seleção hierárquica
- Dinâmico com fetch

### `status-badge.tsx`
- Exibe status com cores consistentes
- Estilos: OPEN (vermelho), REVIEW (amarelo), IN_PROGRESS (azul), RESOLVED (verde), CLOSED (cinza)

---

## 📄 Páginas Implementadas

| Página | Rota | Status | Descrição |
|--------|------|--------|-----------|
| Homepage | `/` | ✅ | Landing com CTA para login/dashboard |
| Login | `/login` | ✅ | Form com NextAuth credentials (client-side) |
| Dashboard | `/dashboard` | ✅ | Stats, gráficos e visão geral para gestores |
| Ocorrências | `/occurrences` | ✅ | Lista paginada com busca |
| Nova Ocorrência | `/occurrences/new` | ✅ | Form para registrar incidente |

---

## 🔐 Segurança Implementada

- [x] NextAuth com estratégia Credentials
- [x] Sessões baseadas em banco de dados
- [x] Controle de acesso por role (EMPLOYEE, MANAGER, ADMIN)
- [x] Validação de uploads no Cloudinary
- [x] Rota de autenticação centralizada

---

## 📱 PWA Configuration

- `manifest.json`: Metadados do app (nome, cores, icons)
- `next-pwa`: Plugin para geração automática de service worker
- Suporte para instalação em Android e iPhone
- Ícones: 192x192 e 512x512

---

## 🚀 Próximas Etapas

1. **Autenticação Avançada**
   - Implementar OAuth (Google, GitHub, Microsoft)
   - Setup de 2FA
   - Recuperação de senha

2. **Geolocalização & Câmera**
   - Captura automática de GPS
   - Acesso à câmera (foto/vídeo)
   - Sincronização offline

3. **Notificações**
   - Email para gestores (nova ocorrência)
   - Push notifications no app
   - Webhooks para integração

4. **Relatórios & Exportação**
   - Geração de PDF com histórico
   - Excel com dados agregados
   - Gráficos de análise

5. **Tratativa de Ocorrências**
   - Atualização de status com workflows
   - Designação de responsáveis
   - Definição de prazos (SLA)

6. **Service Worker & Offline**
   - Sincronização automática
   - Cache de dados críticos
   - Fila de requisições offline

7. **Deploy na Vercel**
   - CI/CD com GitHub
   - Variáveis de ambiente
   - Domínio customizado

8. **Tema Claro/Escuro**
   - Toggle de tema
   - Persistência em localStorage
   - Suporte a prefers-color-scheme

---

## 📦 Dependências Principais

```json
{
  "next": "^15.4.1",
  "react": "^18.3.1",
  "next-auth": "^5.4.0",
  "@next-auth/prisma-adapter": "^1.0.0",
  "prisma": "^5.11.1",
  "@prisma/client": "^5.11.1",
  "tailwindcss": "^3.4.6",
  "lucide-react": "^0.439.0",
  "zod": "^4.27.0",
  "next-pwa": "^6.6.0",
  "@cloudinary/url-gen": "^1.8.0"
}
```

---

## 🔧 Setup & Instalação

```bash
# Clonar e instalar dependências
npm install

# Gerar cliente Prisma
npm run prisma:generate

# Setup banco de dados (dev)
npm run prisma:migrate

# Seed com dados iniciais
npm run prisma:seed

# Rodar dev
npm run dev

# Build para produção
npm run build
npm start
```

---

## 🌍 Variáveis de Ambiente

Copiar `.env.example` para `.env.local` e preencher:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="seu-secret"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="seu-cloud"
CLOUDINARY_API_KEY="sua-key"
CLOUDINARY_API_SECRET="seu-secret"
```

---

## ✨ Padrões & Convenções

- **Components**: Nomeados em PascalCase, export default
- **Pages**: Index routes em `page.tsx`
- **API Routes**: Métodos `GET`, `POST`, `PUT`, `DELETE` como handlers
- **Estilos**: Tailwind utility-first, componentes em `.tsx`
- **Types**: TypeScript strict, paths aliases (`@/*`)
- **Database**: Prisma migrations para schema changes

---

## 📝 Próximas Etapas de Desenvolvimento

A arquitetura está pronta para as seguintes implementações em sequência:

1. **Geolocalização & Câmera** (30% do projeto)
2. **Notificações por Email** (15% do projeto)
3. **Tratativa de Ocorrências** (25% do projeto)
4. **Exportação & Relatórios** (15% do projeto)
5. **Service Worker & Offline** (10% do projeto)
6. **Deploy & Otimizações** (5% do projeto)

---

**Status**: 🟢 Base architecture complete  
**Data**: 24 de junho de 2026  
**Versão**: 0.1.0-alpha
