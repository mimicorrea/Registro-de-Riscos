# Gestor de Riscos - PWA Corporativo 🏢

Um sistema moderno e responsivo para registro de incidentes e riscos em ambientes corporativos, construído com **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Prisma** e **PostgreSQL**.

## ✨ Características Principais

- ✅ **PWA Instalável**: Funciona como app nativo (Android/iOS)
- ✅ **Autenticação Segura**: NextAuth com Credentials provider
- ✅ **Roles & Permissões**: Funcionário, Gestor, Administrador
- ✅ **Registro de Ocorrências**: Fotos, GPS, categorias, gravidade
- ✅ **Dashboard Gestor**: Estatísticas, gráficos, visão geral
- ✅ **Tratativa de Incidentes**: Status, responsáveis, prazos, comentários
- ✅ **Geolocalização**: Captura automática de GPS
- ✅ **Upload de Imagens**: Integração Cloudinary
- ✅ **Modo Offline**: Sincronização automática ao voltar online
- ✅ **Responsivo**: Totalmente adaptável para celular e desktop
- ✅ **Tema Claro/Escuro**: Suporte a preferências do usuário

## 🛠️ Stack Tecnológico

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 15.4.1 | Framework React com App Router |
| **TypeScript** | 5.5.4 | Type safety |
| **Tailwind CSS** | 3.4.6 | Styling moderno |
| **Prisma** | 5.11.1 | ORM para PostgreSQL |
| **NextAuth** | 5.4.0 | Autenticação |
| **PostgreSQL** | - | Banco de dados (Neon/Supabase) |
| **Cloudinary** | 1.8.0 | Upload de imagens |
| **Lucide React** | 0.439.0 | Ícones |
| **PWA** | 6.6.0 | Suporte Progressive Web App |

## 📁 Estrutura do Projeto

Veja [ARQUITETURA.md](./ARQUITETURA.md) para detalhes completos.

```
gestor-de-riscos/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Painel gestor
│   ├── login/             # Autenticação
│   ├── occurrences/       # Ocorrências
│   └── page.tsx           # Homepage
├── components/            # React components reutilizáveis
├── lib/                   # Utilitários (auth, prisma, cloudinary)
├── prisma/                # Schema e seeds
├── public/                # PWA manifest, ícones, assets
└── scripts/               # Build scripts
```

## 🚀 Quick Start

### 1️⃣ Clonar e instalar

```bash
cd "c:\Users\06072\Desktop\Gestor de riscos"
npm install
```

### 2️⃣ Configurar variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com seus dados:

```env
# Banco de dados (use Neon ou Supabase)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (para upload de imagens)
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

### 3️⃣ Setup banco de dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar tabelas (dev)
npm run prisma:migrate

# Popular com dados iniciais
npm run prisma:seed
```

### 4️⃣ Rodar em desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### 5️⃣ Build para produção

```bash
npm run build
npm start
```

## 🔐 Credenciais Padrão (Seed)

Para teste inicial, use:

| E-mail | Senha | Role |
|--------|-------|------|
| admin@empresa.com | Senha123! | Admin |
| gestor@empresa.com | Senha123! | Manager |

**⚠️ Mude essas senhas em produção!**

## 📱 Testar como PWA

### No navegador (Chrome/Edge)
1. Abra a aplicação
2. Clique em "Instalar" na barra de endereço ou use o menu ⋮ > "Instalar app"
3. O app será instalado como aplicativo nativo

### No celular
1. Abra a URL no navegador (Chrome Android ou Safari iOS)
2. Toque em "Adicionar à tela inicial" ou "Instalar"
3. O app será instalado com acesso a câmera, GPS e modo offline

## 🗂️ Estrutura de Dados

### Locais (Hierarquia)
```
Campus Principal
├── Bloco A
│   ├── Sala 101
│   ├── Sala 102
│   └── Corredor
├── Bloco B
│   ├── Laboratório 1
│   ├── Laboratório 2
│   └── Corredor
└── Área Externa
```

### Categorias de Ocorrência
- Acidente
- Quase acidente
- Risco
- Manutenção
- Infraestrutura
- Segurança
- Outros

### Níveis de Gravidade
- 🟢 Baixa
- 🟡 Média
- 🔴 Alta
- ⚫ Crítica

### Status de Ocorrência
- 🔵 Aberta
- 🟠 Em análise
- 🟣 Em andamento
- ✅ Resolvida
- ⚪ Encerrada

## 🔌 APIs Principais

### Autenticação
- `POST /api/auth/signin` - Login com credenciais
- `GET /api/auth/session` - Obter sessão atual
- `POST /api/auth/signout` - Logout

### Ocorrências
- `GET /api/occurrences` - Listar todas
- `POST /api/occurrences` - Criar nova
- `GET /api/occurrences/[id]` - Detalhes
- `PUT /api/occurrences/[id]` - Atualizar
- `DELETE /api/occurrences/[id]` - Deletar

### Locais
- `GET /api/locations` - Hierarquia completa
- `GET /api/locations/[id]` - Detalhes

### Upload
- `POST /api/upload` - Upload para Cloudinary

## 🎯 Roadmap

### Fase 1: Base (✅ Concluída)
- [x] Arquitetura inicial
- [x] Banco de dados
- [x] Autenticação
- [x] Pages básicas

### Fase 2: Features Principais (🔄 Em progresso)
- [ ] Geolocalização automática
- [ ] Câmera e upload de fotos
- [ ] Notifications por email
- [ ] Tratativa de ocorrências

### Fase 3: Avançado
- [ ] Relatórios em PDF
- [ ] Exportação em Excel
- [ ] Gráficos avançados
- [ ] Integração com sistemas externos

### Fase 4: Produção
- [ ] Deploy na Vercel
- [ ] Otimizações de performance
- [ ] Segurança e compliance
- [ ] Monitoramento

## 📞 Suporte & Documentação

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)

## 📄 Licença

Este projeto é fornecido como template corporativo. Use livremente para sua organização.

---

**Versão**: 0.1.0-alpha  
**Última atualização**: 24 de junho de 2026  
**Status**: 🟢 Em desenvolvimento ativo
