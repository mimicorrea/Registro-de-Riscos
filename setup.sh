#!/bin/bash

# 🚀 Script de Setup - Gestor de Riscos
# Execute este script para configurar o projeto automaticamente

set -e

echo "================================================"
echo "  🚀 Instalando Gestor de Riscos (Phase 1)"
echo "================================================"
echo ""

# Step 1: Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo ""
echo "================================================"
echo "  ⚙️  Próximos Passos"
echo "================================================"
echo ""
echo "1️⃣  Configure as variáveis de ambiente:"
echo "   - Copie .env.example para .env.local"
echo "   - Preencha DATABASE_URL (Neon/Supabase)"
echo "   - Preencha NEXTAUTH_SECRET"
echo "   - Preencha credenciais Cloudinary"
echo ""
echo "2️⃣  Setup do banco de dados:"
echo "   npm run prisma:generate"
echo "   npm run prisma:migrate"
echo "   npm run prisma:seed"
echo ""
echo "3️⃣  Rodar em desenvolvimento:"
echo "   npm run dev"
echo ""
echo "4️⃣  Acessar no navegador:"
echo "   http://localhost:3000"
echo ""
echo "   Credenciais de teste:"
echo "   - admin@empresa.com / Senha123!"
echo "   - gestor@empresa.com / Senha123!"
echo ""
echo "================================================"
echo "  📚 Documentação"
echo "================================================"
echo ""
echo "- SETUP.md          → Guia passo a passo"
echo "- ARQUITETURA.md    → Estrutura técnica"
echo "- README.md         → Visão geral"
echo "- ROADMAP_FASES.md  → Próximas etapas"
echo ""
echo "================================================"
echo "  ✅ Setup concluído!"
echo "================================================"
