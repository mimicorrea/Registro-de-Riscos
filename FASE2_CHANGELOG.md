# Fase 2: Features Principais - Changelog

## 📋 Resumo da Implementação

Fase 2 adiciona as funcionalidades essenciais de captura de dados e notificações:
- ✅ Geolocalização automática com Geolocation API
- ✅ Acesso à câmera (Web Camera API)
- ✅ Upload de múltiplas imagens (câmera/galeria)
- ✅ Compressão de imagens antes do upload
- ✅ Notificações por email (Resend)
- ✅ Validação melhorada de formulários

---

## 🔧 Componentes Novos

### 1. Hook `useGeolocation` (`lib/hooks/useGeolocation.ts`)
- Captura automática de GPS ao montar o componente
- Requere permissão do navegador/dispositivo
- Retorna latitude, longitude, acurácia e altitude
- Fallback com mensagens de erro claras

```typescript
const { coordinates, loading, error, requestPermission } = useGeolocation();
```

### 2. Hook `useCamera` (`lib/hooks/useCamera.ts`)
- Acesso à câmera traseira em celulares
- Captura de foto em canvas
- Suporte para dispositivos com múltiplas câmeras
- Tratamento de erros (permissão negada, não encontrada, etc)

```typescript
const { videoRef, canvasRef, startCamera, capturePhoto, stopCamera } = useCamera();
```

### 3. Componente `CameraCapture` (`components/camera-capture.tsx`)
- Interface de câmera com preview
- Captura de foto com confirmação
- Retoma ou substitui foto capturada
- Fallback para upload

### 4. Componente `ImageUpload` (`components/image-upload.tsx`)
- Integração câmera + galeria + arquivo
- Preview de imagem
- Remoção/troca de foto
- Responsivo para mobile

---

## 📡 APIs Novas

### 1. `POST /api/notifications`
Envia notificações por email para gestores/usuários.

**Body (Occurrence):**
```json
{
  "type": "occurrence",
  "managerEmail": "gestor@empresa.com",
  "occurrenceData": {
    "id": "uuid",
    "title": "Vazamento detectado",
    "category": "MAINTENANCE",
    "severity": "HIGH",
    "location": "Bloco A - Sala 101",
    "reporterName": "João Silva",
    "createdAt": "2026-06-24T10:30:00Z"
  }
}
```

**Body (Status Change):**
```json
{
  "type": "status-change",
  "email": "joao@empresa.com",
  "statusData": {
    "title": "Vazamento detectado",
    "previousStatus": "OPEN",
    "newStatus": "IN_PROGRESS",
    "note": "Iniciado reparo"
  }
}
```

### 2. `POST /api/occurrences` (Atualizado)
Agora envia notificações automáticas para todos os gestores ao criar uma ocorrência.

---

## 📦 Dependências Adicionadas

```json
{
  "resend": "^3.0.0"
}
```

---

## 🔐 Variáveis de Ambiente

Adicionar ao `.env.local`:

```env
# Resend Email API
RESEND_API_KEY="re_your-api-key-here"
```

**Como obter:**
1. Criar conta em [resend.com](https://resend.com)
2. Ir em Settings > API Keys
3. Copiar a chave começando com `re_`

---

## 📝 Formulário Atualizado

O componente `OccurrenceForm` agora inclui:

1. **Captura de Foto**
   - Botões: Câmera | Galeria
   - Preview com opção de visualizar/remover
   - Suporte a drag-and-drop (futuro)

2. **Geolocalização**
   - Captura automática ao carregar
   - Display de coordenadas (lat/lng)
   - Indicador de status

3. **Validação**
   - Campos obrigatórios
   - Tratamento de erros
   - Feedback de sucesso

4. **Estado do Formulário**
   - Loading durante envio
   - Erro exibido ao usuário
   - Mensagem de sucesso

---

## 🚀 Como Usar

### 1. Capturar Foto com Câmera

```tsx
<ImageUpload
  value={photo}
  onChange={(imageData) => setPhoto(imageData)}
  label="Foto do problema"
/>
```

### 2. Usar Geolocalização

```tsx
const { coordinates, error, loading } = useGeolocation();

if (coordinates) {
  console.log(`Latitude: ${coordinates.latitude}`);
  console.log(`Longitude: ${coordinates.longitude}`);
}
```

### 3. Enviar Notificação

```typescript
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'occurrence',
    managerEmail: 'gestor@empresa.com',
    occurrenceData: { /* dados */ }
  })
});
```

---

## 🔄 Fluxo de Funcionamento

```
Usuário preenche formulário
    ↓
Seleciona câmera/galeria
    ↓
Captura/seleciona imagem
    ↓
Localização é capturada automaticamente
    ↓
Submete formulário
    ↓
Upload de imagem → Cloudinary
    ↓
Cria ocorrência no banco de dados
    ↓
Envia notificações para gestores (Resend)
    ↓
Exibe mensagem de sucesso
```

---

## ✅ Checklist de Testes

### Geolocalização
- [ ] Permite/nega permissão do navegador
- [ ] Captura coordenadas corretamente
- [ ] Mostra erro se não disponível
- [ ] Funciona em celular (Android/iOS)

### Câmera
- [ ] Acessa câmera traseira
- [ ] Captura foto com qualidade
- [ ] Cancela sem capturar
- [ ] Troca foto capturada
- [ ] Mostra erro se não disponível

### Upload
- [ ] Valida tamanho máximo (10MB)
- [ ] Comprime imagem
- [ ] Envia para Cloudinary
- [ ] Retorna URL segura

### Email
- [ ] Envia para todos os gestores
- [ ] Template HTML formatado
- [ ] Link para ver ocorrência funciona
- [ ] Sem erros de envio

### Formulário
- [ ] Todos os campos validam
- [ ] Imagem é opcional
- [ ] Geolocalização é capturada
- [ ] Sucesso redireciona ou limpa

---

## 🛠️ Troubleshooting

### "Câmera não disponível"
- Verificar permissões do navegador
- Testar em HTTPS (requerido)
- Tentar em outro navegador

### "Erro ao fazer upload"
- Validar credenciais Cloudinary
- Verificar tamanho da imagem
- Conferir se `CLOUDINARY_API_KEY` está correto

### "Email não enviado"
- Conferir `RESEND_API_KEY` em `.env.local`
- Verificar se o domínio está verificado no Resend
- Checar logs do servidor

### "Geolocalização negada"
- Solicitar novamente permissão do navegador
- Limpar dados do site nas configurações
- Testar em HTTPS

---

## 📱 PWA Updates

A app agora suporta:
- ✅ Permissões de câmera (manifest)
- ✅ Permissões de geolocalização (manifest)
- ✅ Service worker para cache de imagens

**manifest.json** será atualizado automaticamente pelo next-pwa.

---

## 🔮 Próximas Features (Fase 3)

- [ ] Tratativa de ocorrências (status, responsáveis)
- [ ] Dashboard avançado com filtros
- [ ] Relatórios em PDF
- [ ] Modo offline com sincronização
- [ ] Notificações push
- [ ] Multi-upload com thumbnails

---

## 📊 Performance

- **Geolocalização**: 5-10s (primeira vez)
- **Câmera**: Instantâneo
- **Upload**: Depende da conexão (comprimido)
- **Email**: ~1s (assíncrono)

**Otimizações aplicadas:**
- Canvas para captura de foto
- Lazy loading de imagens
- Compressão JPEG 80%
- Debounce em formulários

---

## 📄 Documentação de Referência

### Geolocation API
- [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Suporte por navegador](https://caniuse.com/geolocation)

### Media Capture
- [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [Suporte por navegador](https://caniuse.com/mediastream)

### Resend Email
- [Docs](https://resend.com/docs)
- [React Email](https://react.email/)

---

**Status**: 🟢 Fase 2 - Features Principais ✅ Completa  
**Data**: 24 de junho de 2026  
**Versão**: 0.2.0-beta
