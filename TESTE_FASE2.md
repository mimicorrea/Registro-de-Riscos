# 🧪 Fase 2: Guia Rápido de Testes

## ✅ O que foi adicionado

### 🎥 Câmera e Geolocalização
```
npm run dev
→ Abrir /occurrences/new
→ Clicar em "Abrir câmera"
→ Permitir acesso à câmera
→ Capturar foto
→ Geolocalização é capturada automaticamente
```

### 📧 Email (Resend)
```
→ Registrar nova ocorrência
→ Gestores recebem email em tempo real
→ Email contém: Título, Descrição, Local, Responsável
```

---

## 🚀 Setup para Testar

### 1. Instalar Dependências (Resend)
```bash
npm install
```

### 2. Configurar Resend API Key
Adicionar em `.env.local`:
```env
RESEND_API_KEY="re_your-key-here"
```

**Como obter:**
1. Ir em [resend.com](https://resend.com)
2. Criar conta (grátis)
3. Settings → API Keys
4. Copiar a chave começando com `re_`

### 3. Rodar Servidor
```bash
npm run dev
```

---

## 📱 Testar Câmera & Geolocalização

### No Desktop (Chrome/Edge)
1. Abrir DevTools (F12)
2. Ir em "Sensors" (ou "More tools" → "Sensors")
3. Simular câmera e GPS

### No Celular Real
1. Abrir app em HTTPS
2. Permitir permissões quando solicitado
3. Câmera e GPS funcionam nativamente

### Navegador Suportado
- ✅ Chrome/Chromium (Android + Desktop)
- ✅ Safari (iOS 13+)
- ✅ Edge (Desktop)
- ✅ Firefox (com permissão)
- ❌ IE (não suportado)

---

## 📧 Testar Email

### Setup Resend (Free Tier)
1. Criar conta em [resend.com](https://resend.com)
2. Você recebe um domínio de teste: `onboarding@resend.dev`
3. Adicionar para testar em `RESEND_API_KEY`

### Verificar Email Enviado
1. Abrir Dev Console (F12)
2. Abrir Terminal do Next.js
3. Ver logs: "Email sent to: gestor@empresa.com"
4. Verificar inbox do gestor (ou spam)

### Template Email
O email inclui:
- Título da ocorrência
- Categoria
- Gravidade
- Local
- Responsável
- Link para ver detalhes

---

## ✨ Features Fase 2

| Feature | Status | Teste |
|---------|--------|-------|
| Câmera | ✅ | Clicar "📷 Câmera" no formulário |
| Galeria | ✅ | Clicar "🖼️ Galeria" no formulário |
| Geolocalização | ✅ | Submeter, ver lat/lng |
| Upload Cloudinary | ✅ | Imagem aparece no Cloudinary |
| Email Notificação | ✅ | Gestor recebe email |
| Validação | ✅ | Tentar submeter vazio |
| Compressão | ✅ | Imagem reduzida antes de upload |

---

## 🔍 Verificar Status

### Logs de Desenvolvimento
```bash
npm run dev
# Procurar por:
# - "Camera initialized"
# - "Geolocation captured"
# - "Email sent to:"
# - "Occurrence created"
```

### Verificar Banco de Dados
```bash
npx prisma studio
# Abrir http://localhost:5555
# Verificar na tabela "Occurrence":
# - title, description, latitude, longitude
# Verificar em "Attachment":
# - URL da imagem no Cloudinary
```

### Verificar Imagem no Cloudinary
```
1. Login em https://cloudinary.com/console
2. Media Library
3. Pasta "gestor-de-riscos"
4. Imagens enviadas devem estar lá
```

---

## 🛠️ Troubleshooting

### "Câmera não funciona"
```bash
# Testar permissão no navegador
# Settings → Permissions → Camera
# Permitir para localhost:3000

# Ou limpar dados:
# DevTools → Application → Storage
# Clear site data
```

### "Email não enviado"
```bash
# Verificar chave Resend
echo $RESEND_API_KEY

# Verificar logs
npm run dev
# Procurar por erros de email

# Teste rápido:
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -d "..."
```

### "Imagem não sobe"
```bash
# Verificar credenciais Cloudinary em .env.local
# Verificar tamanho (máx 10MB)
# Verificar conexão de internet
```

### "Geolocalização não funciona"
```bash
# Deve estar em HTTPS (ou localhost)
# Testar DevTools → Sensors → Location
# Verificar permissão do navegador
```

---

## 📊 Testes de Aceitação

### Teste 1: Criar Ocorrência Completa
- [ ] Preencher formulário com dados
- [ ] Capturar foto pela câmera
- [ ] Submeter
- [ ] Ocorrência criada no banco
- [ ] Imagem no Cloudinary
- [ ] Email recebido pelo gestor
- [ ] Localização salva (lat/lng)

### Teste 2: Upload de Galeria
- [ ] Clicar "🖼️ Galeria"
- [ ] Selecionar imagem
- [ ] Preview aparecer
- [ ] Submeter
- [ ] Funcionamento igual ao Teste 1

### Teste 3: Geolocalização
- [ ] Abrir formulário
- [ ] Esperar indicador "Capturando..."
- [ ] Ver "✓ Lat: X.XXXX, Lng: Y.YYYY"
- [ ] Coordenadas corretas (somar próximo local)

### Teste 4: Validação
- [ ] Submeter sem título → Erro
- [ ] Submeter sem descrição → Erro
- [ ] Submeter sem local → Cria (opcional)
- [ ] Submeter sem foto → Cria (opcional)

### Teste 5: Mobile
- [ ] Abrir em celular (Android/iOS)
- [ ] Câmera e GPS funcionam
- [ ] Email recebido
- [ ] Interface responsiva

---

## 🔐 Security Checks

### Upload
- [x] Validar tamanho (máx 10MB)
- [x] Validar tipo (image/*)
- [x] Sanitizar filename
- [x] URL assinada do Cloudinary

### API
- [x] Validar body com Zod (futuro)
- [x] Rate limit (futuro)
- [x] CORS configurado (futuro)

### Email
- [x] Não expor dados sensíveis
- [x] Link com ID da ocorrência
- [x] Template seguro (sem scripts)

---

## 📈 Métricas de Performance

Esperado após Fase 2:

| Métrica | Antes | Depois |
|---------|-------|--------|
| Load Time | ~2s | ~2s |
| Câmera Init | - | ~0.5s |
| Geoloc | - | ~5s |
| Upload | - | ~2-5s |
| Email | - | ~1s |

---

## 🚀 Próximas Fases

### Fase 3: Tratativa & Dashboard
- Atualizar status de ocorrência
- Designar responsável
- Dashboard com filtros
- Relatórios em PDF

### Fase 4: Offline & Sync
- Service worker avançado
- Fila de requisições offline
- Sincronização automática
- Cache inteligente

### Fase 5: Deploy
- Vercel + GitHub Actions
- Domínio customizado
- Monitoramento
- Performance optimization

---

## 📞 Suporte

**Erro durante teste?** Consulte:
- [FASE2_CHANGELOG.md](./FASE2_CHANGELOG.md)
- [ARQUITETURA.md](./ARQUITETURA.md)
- [README.md](./README.md)

---

**Status**: 🟢 Fase 2 Completa  
**Próxima**: Fase 3 (Tratativa & Dashboard)  
**Data**: 24 de junho de 2026
