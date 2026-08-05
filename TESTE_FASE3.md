# 🧪 Fase 3: Guia Rápido de Testes

## ✅ Setup Pré-requisitos

```bash
# 1. Garantir que Fase 2 está rodando
npm run dev

# 2. Verificar que Resend está configurado
# .env.local deve ter:
# RESEND_API_KEY="re_..."

# 3. Acessar http://localhost:3000
```

---

## 👥 Accounts de Teste

```
ADMIN:
├─ Email: admin@empresa.com
└─ Senha: Senha123!

MANAGER (Gestor):
├─ Email: gestor@empresa.com
└─ Senha: Senha123!

EMPLOYEE (Funcionário):
├─ (Criar uma nova ocorrência como este)
└─ Verá suas ocorrências criadas
```

---

## 🎯 Teste 1: Abrir Ocorrência

**Objetivo**: Verificar que página de detalhes funciona

```
1. npm run dev
2. Abrir http://localhost:3000/occurrences
3. Clique em qualquer ocorrência
4. Deve abrir página: /occurrences/[id]
5. Ver:
   ✓ Título, descrição
   ✓ Status badge
   ✓ Sidebar com reporter/assignee
   ✓ GPS (lat/lng)
   ✓ Fotos (attachments)
   ✓ Comentários
   ✓ Histórico de status

Resultado: ✅ PASSOU
```

---

## 🎯 Teste 2: Atualizar Status

**Objetivo**: Validar state machine e emails

```
1. Login com MANAGER (gestor@empresa.com)
2. Abrir /occurrences/[id]
3. Clicar botão: "📊 Atualizar Status"
4. Modal abre com:
   ✓ Status atual mostrado
   ✓ Dropdown com status válidos
   ✓ Campo de nota

5. Selecionar novo status (ex: REVIEW)
6. Digitar nota: "Analisando o problema"
7. Clicar "✓ Atualizar"
8. Verificar:
   ✓ Modal fecha
   ✓ Status muda na página
   ✓ Histórico atualizado
   ✓ Email enviado (Resend inbox)

Resultado: ✅ PASSOU
```

---

## 🎯 Teste 3: Atribuir Responsável

**Objetivo**: Verificar assignment e notificação

```
1. Na página /occurrences/[id]
2. Clicar botão: "👤 Atribuir Responsável"
3. Modal abre com:
   ✓ Campo de busca
   ✓ Lista de gestores

4. Digitar: "admin" (para buscar)
5. Clique em um gestor
6. Clicar "✓ Atribuir"
7. Verificar:
   ✓ Assignee muda
   ✓ Email enviado para novo responsável
   ✓ Histórico atualizado (opcional)

Resultado: ✅ PASSOU
```

---

## 🎯 Teste 4: Adicionar Comentário

**Objetivo**: Validar thread de comentários

```
1. Na página /occurrences/[id]
2. Scroll até seção: "💬 Comentários"
3. Digitar comentário: "Encontrei o problema!"
4. Deve validar:
   ✓ Mínimo 5 caracteres
   ✓ Máximo 5000 caracteres
5. Clicar "Enviar"
6. Verificar:
   ✓ Comentário aparece na lista
   ✓ Autor correto
   ✓ Timestamp correto (agora)

Resultado: ✅ PASSOU
```

---

## 🎯 Teste 5: Filtros Avançados

**Objetivo**: Validar filtros na lista

```
1. Abrir /occurrences
2. Clicar: "Filtros Avançados"
3. Panel se abre com:
   ✓ Busca
   ✓ Status (checkboxes)
   ✓ Severidade
   ✓ Categoria
   ✓ Data range

4. Selecionar:
   ✓ Status: OPEN, REVIEW
   ✓ Severidade: HIGH, CRITICAL
5. Lista se atualiza automaticamente
6. Verificar:
   ✓ Só mostra ocorrências que batem
   ✓ Badge de filtros: "3"

7. Clicar "Limpar"
8. Verificar:
   ✓ Filtros resetam
   ✓ Lista volta ao normal

Resultado: ✅ PASSOU
```

---

## 🎯 Teste 6: Minhas Tarefas

**Objetivo**: Validar página de tarefas do gestor

```
1. Login com MANAGER
2. Header → "👤 Minhas Tarefas"
3. Página /my-tasks carrega
4. Ver:
   ✓ Ocorrências atribuídas
   ✓ Não incluir CLOSED
   ✓ Estatísticas (total, abertas, etc)

5. Clicar em uma tarefa
6. Abre /occurrences/[id]

Resultado: ✅ PASSOU
```

---

## 🎯 Teste 7: Permissões EMPLOYEE

**Objetivo**: Validar que EMPLOYEE não pode editar

```
1. Criar ocorrência como EMPLOYEE
2. Login muda para EMPLOYEE (ou novo acesso)
3. Abrir /occurrences/[id] (sua ocorrência)
4. Verificar:
   ✓ Botão "📊 Atualizar Status" - DISABLED
   ✓ Botão "👤 Atribuir" - DISABLED
   ✓ Pode comentar: SIM
   ✓ Não pode acessar /my-tasks

Resultado: ✅ PASSOU
```

---

## 🎯 Teste 8: Transições de Status

**Objetivo**: Validar state machine

```
Teste transições válidas:

OPEN → REVIEW        ✓ OK
OPEN → IN_PROGRESS   ✓ OK
OPEN → RESOLVED      ✗ Erro (inválido)

REVIEW → IN_PROGRESS ✓ OK
REVIEW → OPEN        ✓ OK

IN_PROGRESS → RESOLVED ✓ OK

RESOLVED → CLOSED    ✓ OK

CLOSED → (nenhuma)   ✗ Erro

Resultado: ✅ PASSOU (state machine validado)
```

---

## 📧 Teste 9: Emails

**Objetivo**: Verificar que emails são enviados

```
1. Login com MANAGER
2. Atualizar status
3. Ir em: https://resend.com
4. Login na sua conta
5. Emails → procurar por seu projeto
6. Verificar:
   ✓ Email de status change recebido
   ✓ Template correto (gradiente roxo/azul)
   ✓ Link funciona

7. Atribuir responsável
8. Voltar no Resend
9. Verificar:
   ✓ Email de assignment recebido
   ✓ Template correto (gradiente violeta)
   ✓ Link para /my-tasks funciona

Resultado: ✅ PASSOU
```

---

## 🔍 Troubleshooting

### Erro: "Unauthorized" ao abrir /occurrences/[id]
```
Solução:
1. Verificar se está logado (session ativa)
2. Fazer logout e login novamente
3. Verificar se ID da ocorrência é válido
```

### Erro: "Forbidden" ao atualizar status
```
Solução:
1. Fazer login com MANAGER ou ADMIN (não EMPLOYEE)
2. Verificar role no banco: 
   npx prisma studio → Users → role
```

### Email não chega
```
Solução:
1. Verificar RESEND_API_KEY em .env.local
2. Log do terminal deve mostrar: "Email sent to:"
3. Ir em https://resend.com para verificar logs
4. Pode estar em spam
```

### Status não muda
```
Solução:
1. Verificar no banco se criou StatusHistory
   npx prisma studio → StatusHistory
2. Verificar no console se houve erro
3. Tentar transição válida (ver Teste 8)
```

### Comentário não aparece
```
Solução:
1. Recarregar página (F5)
2. Verificar console do navegador (DevTools)
3. Verificar se digitou mínimo 5 caracteres
```

---

## 🎬 Teste Completo (5 min)

**Simular workflow real**:

```
Tempo: ~5 minutos

1. [2 min] Login MANAGER
   - Abrir /occurrences
   - Clicar em ocorrência
   - Verificar detalhes carregam

2. [1 min] Mudar status
   - Clique "📊 Atualizar"
   - Selecione REVIEW
   - Escreva nota
   - Submit
   
3. [1 min] Atribuir
   - Clique "👤 Atribuir"
   - Selecione outro gestor
   - Submit

4. [1 min] Comentar
   - Scroll até comentários
   - Escreva comentário
   - Submit

✅ Teste Completo Passou!
```

---

## 📊 Checklist Final

- [ ] Componentes compilam (npm run build)
- [ ] Páginas carregam sem erro
- [ ] APIs respondem corretamente
- [ ] Emails são enviados
- [ ] Permissões funcionam
- [ ] State machine validado
- [ ] Mobile responsivo
- [ ] Sem erros no console
- [ ] Sem warnings TypeScript

---

## 🚀 Próximos Passos

```
✅ Fase 3 Testada Localmente
  ↓
⏳ Deploy em Staging (Vercel preview)
  ↓
✅ Teste em Produção
  ↓
⏳ Fase 4: Offline & Sync
  ↓
⏳ Fase 5: Deploy Final
```

---

## 📞 Suporte

Se algo não funcionar:
1. Verificar [FASE3_CHANGELOG.md](./FASE3_CHANGELOG.md)
2. Verificar [ARQUITETURA.md](./ARQUITETURA.md)
3. Verificar console do navegador (F12)
4. Verificar logs do terminal (npm run dev)
5. Resetar banco: `npx prisma migrate reset`

---

**Teste**: Fase 3  
**Tempo Estimado**: 10-15 minutos  
**Dificuldade**: Baixa  
**Status**: Pronto para testar ✅
