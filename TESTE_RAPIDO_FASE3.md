# 🎬 Fase 3: Teste Rápido (5 min)

## ⚡ Quick Start

```bash
# 1. Validação automática (1 min)
npm run validate:fase3

# 2. Build test (1 min)
npm run build

# 3. Iniciar servidor (1 min)
npm run dev

# 4. Testes manuais (2 min)
# Abrir http://localhost:3000 no navegador
```

---

## 📋 Testes Essenciais (Ordem)

### ✅ Teste 1: Validação Automática (1 min)

```bash
npm run validate:fase3

# Esperado output:
# ✅ 5 componentes criados
# ✅ 5 APIs criadas
# ✅ 2 páginas criadas
# ✅ 2 email templates novos
# ✅ Fase 3 Validada com Sucesso!
```

**Se passar**: ✅ Continuar para Teste 2  
**Se falhar**: ❌ Revisar erros, corrigir, e re-rodar

---

### ✅ Teste 2: Build TypeScript (1 min)

```bash
npm run build

# Esperado:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
```

**Se passar**: ✅ Continuar para Teste 3  
**Se falhar**: ❌ TypeScript error, verificar console

---

### ✅ Teste 3: Iniciar Servidor (30s)

```bash
npm run dev

# Esperado:
# ▲ Next.js 15.4.1
# - Local:        http://localhost:3000
# ✓ Ready in 1.2s
```

**Se passar**: ✅ Abrir navegador  
**Se falhar**: ❌ Verificar porta 3000

---

### ✅ Teste 4: Login (30s)

Abrir http://localhost:3000

```
1. Clicar "Login"
2. Email: gestor@empresa.com
3. Senha: Senha123!
4. Submeter
5. Esperado: /occurrences (lista)
```

**Resultado**: ✅ Logado / ❌ Erro

---

### ✅ Teste 5: Abrir Ocorrência (30s)

```
1. Na lista /occurrences
2. Clicar em qualquer ocorrência
3. Esperado: /occurrences/[uuid] carrega
4. Ver:
   ✓ Título
   ✓ Descrição
   ✓ Fotos
   ✓ Botões de ação
```

**Resultado**: ✅ Carrega / ❌ Erro

---

### ✅ Teste 6: Atualizar Status (30s)

```
1. Clique: "📊 Atualizar Status"
2. Selecione: REVIEW
3. Digite nota: "Teste"
4. Submit
5. Esperado:
   ✓ Modal fecha
   ✓ Status muda
   ✓ Histórico atualiza
```

**Resultado**: ✅ Funciona / ❌ Erro

---

### ✅ Teste 7: Atribuir Responsável (30s)

```
1. Clique: "👤 Atribuir"
2. Selecione: admin@empresa.com
3. Submit
4. Esperado:
   ✓ Modal fecha
   ✓ Assignee muda
   ✓ Email enviado
```

**Resultado**: ✅ Funciona / ❌ Erro

---

### ✅ Teste 8: Comentário (30s)

```
1. Scroll: "💬 Comentários"
2. Digitar: "Teste de comentário"
3. Enviar
4. Esperado: Comentário aparece
```

**Resultado**: ✅ Funciona / ❌ Erro

---

## 🎯 Resultado Final

```
Testes Passaram: ___ / 8
Testes Falharam: ___ / 8

Se TODOS passaram:
✅ Fase 3 VALIDADA - Pronta para Deploy!

Se algum falhou:
❌ Reportar erro e corrigir
```

---

## 🚀 Próximas Ações

### Se Validação Passou ✅

```bash
# 1. Parar servidor (Ctrl+C)
# 2. Push para GitHub
git add .
git commit -m "feat: Fase 3 - Tratativa de Ocorrências"
git push origin main

# 3. Deploy na Vercel
# (Automático se connectado com GitHub)

# 4. Ou continuar com Fase 4
```

### Se Validação Falhou ❌

```bash
# 1. Verificar erro específico
# 2. Consultar documentação:
#    - FASE3_CHANGELOG.md
#    - ARQUITETURA.md
# 3. Corrigir e re-testar
# 4. Re-rodar: npm run validate:fase3
```

---

## 📊 Checklist de Teste

| Teste | Resultado | Status |
|-------|-----------|--------|
| 1. Validação Automática | ✅/❌ | ____ |
| 2. Build TypeScript | ✅/❌ | ____ |
| 3. Servidor Roda | ✅/❌ | ____ |
| 4. Login Funciona | ✅/❌ | ____ |
| 5. Abrir Ocorrência | ✅/❌ | ____ |
| 6. Atualizar Status | ✅/❌ | ____ |
| 7. Atribuir Responsável | ✅/❌ | ____ |
| 8. Comentário | ✅/❌ | ____ |

---

## 📞 Suporte

Se algum teste falhar:

1. **Erro de build**: `npm run build` (vê erro específico)
2. **Componente não encontrado**: `ls -la components/` (verifica arquivos)
3. **API não funciona**: Check console de error do navegador (F12)
4. **Email não envia**: Verificar `.env.local` tem `RESEND_API_KEY`
5. **Permissões erradas**: Re-fazer login

---

**Teste Rápido**: Fase 3  
**Duração**: 5 minutos  
**Dificuldade**: Muito Baixa  
**Status**: Pronto ✅
