# 🚀 Guia de Setup - Gestor de Riscos

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18+)
- [Git](https://git-scm.com/)
- Conta em uma das plataformas de banco de dados:
  - [Neon](https://console.neon.tech/) (Free tier)
  - [Supabase](https://supabase.com/) (Free tier)
- Conta [Cloudinary](https://cloudinary.com/) (Free tier)

---

## Passo 1: Clonar o Repositório

```bash
cd c:\Users\06072\Desktop
cd "Gestor de riscos"
```

---

## Passo 2: Instalar Dependências

```bash
npm install
```

Isso pode levar 2-3 minutos. Se houver algum erro, tente:

```bash
npm install --legacy-peer-deps
npm cache clean --force
npm install
```

---

## Passo 3: Configurar Banco de Dados PostgreSQL

### Opção A: Neon (Recomendado - mais simples)

1. Acesse [console.neon.tech](https://console.neon.tech/)
2. Crie uma conta (ou faça login)
3. Clique em "Create a new project"
4. Escolha a região mais próxima
5. Copie a connection string no formato:
   ```
   postgresql://user:password@host:port/database?schema=public
   ```

### Opção B: Supabase

1. Acesse [supabase.com](https://supabase.com/dashboard/projects)
2. Crie um novo projeto
3. Defina a senha do banco de dados
4. Em "Project Settings" > "Database", encontre a connection string

### Opção C: Local (PostgreSQL)

```bash
# No Windows, instale PostgreSQL via https://www.postgresql.org/download/windows/
# Depois crie um banco de dados:
psql -U postgres
CREATE DATABASE gestor_de_riscos;
\q
```

A connection string será:
```
postgresql://postgres:sua_senha@localhost:5432/gestor_de_riscos?schema=public
```

---

## Passo 4: Configurar Cloudinary

1. Acesse [cloudinary.com/console](https://cloudinary.com/console)
2. Crie uma conta (gratuita)
3. No dashboard, você encontrará:
   - **Cloud Name** (no topo da página)
   - **API Key** (em Settings > API Keys > Authentication)
   - **API Secret** (em Settings > API Keys > Authentication)

---

## Passo 5: Configurar NextAuth Secret

Gere um secret forte usando um destes comandos:

### Windows (PowerShell):
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Minimum 10000000 -Maximum 99999999).ToString() + [guid]::NewGuid().ToString()))
```

### Windows (Git Bash / WSL):
```bash
openssl rand -base64 32
```

Copie o resultado gerado.

---

## Passo 6: Criar .env.local

Na raiz do projeto, crie um arquivo `.env.local`:

```bash
# Windows CMD
type .env.example > .env.local

# Windows PowerShell
Copy-Item .env.example .env.local

# Git Bash / WSL
cp .env.example .env.local
```

Abra `.env.local` em um editor e preencha:

```env
# Database - Cole a connection string do Neon/Supabase/Local
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth - Cole o secret gerado acima
NEXTAUTH_SECRET="seu-secret-gerado-aqui"

# URL da aplicação (local = http://localhost:3000)
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary - Preencha com seus dados
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"

# Environment
NODE_ENV="development"
```

---

## Passo 7: Setup do Banco de Dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar tabelas no banco de dados
npm run prisma:migrate

# Popular com dados iniciais (admin, gestor, locais)
npm run prisma:seed
```

Se encontrar erros de permissão, verifique se:
- A connection string está correta
- O banco de dados existe
- As credenciais estão válidas

---

## Passo 8: Rodar o Servidor de Desenvolvimento

```bash
npm run dev
```

Você verá algo como:

```
  ▲ Next.js 15.4.1
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.1s
```

---

## Passo 9: Acessar a Aplicação

### Na tela inicial (localhost:3000):
- Botão "Entrar agora" → página de login
- Botão "Ver painel gestor" → dashboard (sem autenticação por enquanto)

### Na página de login (localhost:3000/login):

Use as credenciais de teste criadas no seed:

| E-mail | Senha | Papel |
|--------|-------|-------|
| admin@empresa.com | Senha123! | Admin |
| gestor@empresa.com | Senha123! | Manager |

---

## ✅ Verificação Final

Após estar logado, você deve ver:

1. ✅ Navegação no topo com "Dashboard", "Ocorrências", "Login"
2. ✅ Dashboard com estatísticas e gráficos
3. ✅ Página de ocorrências com botão "Nova ocorrência"
4. ✅ Formulário para registrar incidentes

Se tudo funcionou, parabéns! 🎉

---

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
```

### "database error" ao fazer login

Verifique:
- `DATABASE_URL` está correto em `.env.local`
- O banco de dados foi criado com `npm run prisma:migrate`
- A conexão funciona (tente acessar via pgAdmin ou DBeaver)

### "Cloudinary error"

Verifique:
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` estão corretos
- A conta Cloudinary está ativa

### Porta 3000 já está em uso

```bash
# Rodar em outra porta
npm run dev -- -p 3001
```

### Build error

```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -r .next node_modules
npm install
npm run build
```

---

## 📱 Testar PWA (Opcional)

1. Rodar em produção:
   ```bash
   npm run build
   npm start
   ```

2. No Chrome/Edge, clicar em "Instalar" na barra de endereço

3. No celular, abrir em Safari (iOS) ou Chrome (Android) e adicionar à tela inicial

---

## 🚀 Próximos Passos

Após o setup inicial, você pode:

1. **Explorar o código** em `app/` e `components/`
2. **Adicionar mais usuários** alterando `prisma/seed.ts`
3. **Customizar locais** em `prisma/seed.ts`
4. **Criar novas páginas** em `app/`
5. **Preparar para deploy** na Vercel

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique [ARQUITETURA.md](./ARQUITETURA.md) para entender a estrutura
2. Consulte a documentação das libs:
   - [Prisma](https://www.prisma.io/docs/)
   - [Next.js](https://nextjs.org/docs)
   - [NextAuth](https://next-auth.js.org/)
3. Abra uma issue no GitHub do seu repositório

---

**Status**: ✅ Pronto para desenvolvimento  
**Última atualização**: 24 de junho de 2026
