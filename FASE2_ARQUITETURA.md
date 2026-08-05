# Fase 2: Arquitetura de Features Principais

## 🏗️ Diagrama de Componentes

```
┌─────────────────────────────────────────────────────┐
│         Occurrence Registration Flow (Fase 2)        │
└─────────────────────────────────────────────────────┘

User Interface
├── /occurrences/new (Page)
│   └── OccurrenceForm (Client)
│       ├── Input Fields (title, desc, category)
│       ├── LocationSelect (dropdown)
│       ├── ImageUpload (new!)
│       │   ├── Camera (new!)
│       │   │   └── CameraCapture (new!)
│       │   │       └── useCamera hook (new!)
│       │   └── Gallery (input type="file")
│       └── Geolocation Display (new!)
│           └── useGeolocation hook (new!)

APIs
├── POST /api/occurrences (updated)
│   ├── Create Occurrence
│   ├── Upload Image → Cloudinary
│   └── Send Email Notification → Resend
│
├── POST /api/upload (updated)
│   └── Compress & Upload → Cloudinary
│
└── POST /api/notifications (new!)
    ├── Type: "occurrence"
    │   └── Email to Managers
    └── Type: "status-change"
        └── Email to Reporter
```

---

## 🔄 Fluxo de Dados

```
┌────────────────────────────────────────────────────┐
│ Usuário no formulário /occurrences/new             │
└────────────────────────────────────────────────────┘
                        ↓
              ┌─────────────────┐
              │ Geolocation API │ (automatic)
              └────────┬────────┘
                       ↓
         Browser captures GPS (background)
              latitude, longitude, accuracy
                       ↓
      ┌───────────────────────────────────┐
      │ User clicks "Camera" or "Gallery" │
      └───────────┬───────────────────────┘
                  ↓
    ┌─────────────────────────────────┐
    │ Camera/File Input API           │
    │ - useCamera hook                │
    │ - navigator.mediaDevices        │
    │ - Canvas capture                │
    └────────────┬────────────────────┘
                 ↓
    Image Data (base64 string)
                 ↓
    ┌─────────────────────────────┐
    │ Form Submission             │
    │ All fields + image + gps    │
    └────────────┬────────────────┘
                 ↓
    ┌─────────────────────────────────────┐
    │ POST /api/occurrences               │
    │ - Create Occurrence in DB           │
    │ - POST /api/upload with image       │
    └────────────┬────────────────────────┘
                 ↓
    ┌──────────────────────────────┐
    │ POST /api/upload             │
    │ - Validate size (max 10MB)   │
    │ - Compress (JPEG 80%)        │
    │ - Upload to Cloudinary       │
    └────────────┬─────────────────┘
                 ↓
    Cloudinary Returns Secure URL
                 ↓
    ┌──────────────────────────────┐
    │ POST /api/notifications      │
    │ - Send Email via Resend      │
    │ - Type: "occurrence"         │
    │ - To: Managers, Admins       │
    └────────────┬─────────────────┘
                 ↓
    Manager Receives Email with:
    - Title, Description
    - Category, Severity
    - Location, Reporter Name
    - Link to view details
                 ↓
    ✅ Success Response to User
```

---

## 📡 API Endpoints

```
POST /api/occurrences
├── Input:
│   ├── title: string
│   ├── description: string
│   ├── category: ENUM
│   ├── severity: ENUM
│   ├── locationId: uuid (optional)
│   ├── reporterId: uuid
│   ├── latitude: decimal (from geolocation)
│   ├── longitude: decimal (from geolocation)
│   └── attachments: [{url, label}]
│
└── Process:
    ├── 1. Validate input
    ├── 2. Create in Prisma
    ├── 3. Query managers
    ├── 4. Send email to each manager
    └── 5. Return created occurrence

POST /api/upload
├── Input:
│   └── imageBase64: string (data:image/jpeg;base64,...)
│
└── Process:
    ├── 1. Validate size (max 10MB)
    ├── 2. Send to Cloudinary
    ├── 3. Cloudinary compresses
    ├── 4. Returns secure URL
    └── 5. Return URL + success flag

POST /api/notifications
├── Input (Type: occurrence):
│   ├── type: "occurrence"
│   ├── managerEmail: string
│   └── occurrenceData: {...}
│
├── Input (Type: status-change):
│   ├── type: "status-change"
│   ├── email: string
│   └── statusData: {...}
│
└── Process:
    ├── 1. Validate type
    ├── 2. Generate HTML email
    ├── 3. Send via Resend
    └── 4. Return success
```

---

## 🎨 Component Hierarchy

```
OccurrenceForm (client component)
├── State Management
│   ├── form (title, desc, category, etc)
│   ├── loading
│   ├── error
│   └── success
│
├── Hooks
│   ├── useGeolocation()
│   │   └── coordinates, loading, error
│   └── (useCamera passed to ImageUpload)
│
└── Children Components
    ├── LocationSelect (existing)
    │
    ├── ImageUpload (NEW)
    │   ├── State
    │   │   ├── preview
    │   │   ├── showCamera
    │   │   └── loading
    │   │
    │   └── Children
    │       └── CameraCapture (NEW)
    │           ├── Hook: useCamera()
    │           ├── video ref
    │           ├── canvas ref
    │           └── Button: Capture / Confirm / Retry / Cancel
    │
    ├── StatusIndicator
    │   └── Geolocation display
    │
    └── Button: Submit
        └── On click: handleSubmit()
            ├── Validate form
            ├── Upload image if exists
            ├── Create occurrence
            ├── Send notifications
            └── Show success
```

---

## 🗂️ File Structure - Fase 2

```
gestor-de-riscos/
│
├── lib/
│   ├── hooks/ (NEW!)
│   │   ├── useGeolocation.ts (NEW)
│   │   ├── useCamera.ts (NEW)
│   │   └── index.ts (NEW)
│   ├── email.ts (NEW!)
│   ├── auth.ts
│   ├── prisma.ts
│   └── types.ts
│
├── components/
│   ├── camera-capture.tsx (NEW!)
│   ├── image-upload.tsx (NEW!)
│   ├── occurrence-form.tsx (UPDATED)
│   ├── location-select.tsx
│   ├── status-badge.tsx
│   └── site-header.tsx
│
├── app/
│   ├── api/
│   │   ├── notifications/route.ts (NEW!)
│   │   ├── occurrences/route.ts (UPDATED)
│   │   ├── upload/route.ts (UPDATED)
│   │   ├── locations/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   │
│   ├── occurrences/
│   │   ├── new/page.tsx
│   │   └── page.tsx
│   │
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
│
├── docs/ (NEW DOCS!)
│   ├── FASE2_CHANGELOG.md
│   ├── FASE2_RESUMO.md
│   ├── TESTE_FASE2.md
│   ├── ROADMAP_FASES.md
│   └── ...
│
├── package.json (UPDATED - +resend)
├── .env.example (UPDATED - +RESEND_API_KEY)
└── ... (config files)
```

---

## 🔌 External Services Integration

```
┌──────────────────────────────────────┐
│      Gestor de Riscos App            │
└──────────────┬───────────────────────┘
               │
    ┌──────────┼──────────┬─────────────┐
    ↓          ↓          ↓             ↓
┌────────┐ ┌──────────┐ ┌────────────┐ ┌──────┐
│ Prisma │ │Cloudinary│ │   Resend   │ │ GPS  │
│(Neon)  │ │ (Images) │ │  (Email)   │ │(Geo) │
└────────┘ └──────────┘ └────────────┘ └──────┘
    │          │          │             │
    ↓          ↓          ↓             ↓
  DB       Image CDN    Email API    Geoloc API
  ✅        ✅          ✅(new)       ✅(native)
```

---

## 🧪 Testing Scenarios

```
Scenario 1: Câmera
┌─ User clicks "📷 Camera"
├─ Browser asks for permission
├─ User grants permission
├─ Video stream shows
├─ User clicks "Capture"
├─ Photo saved to preview
├─ User clicks "Use Photo"
├─ Image added to form
└─ ✅ Success

Scenario 2: Galeria
┌─ User clicks "🖼️ Gallery"
├─ File selector opens
├─ User selects image
├─ Preview displayed
├─ User can remove and retake
└─ ✅ Success

Scenario 3: Geolocalização
┌─ Page loads
├─ Geolocation API requests permission
├─ User grants (or denies)
├─ If granted: lat/lng captured
├─ If denied: error shown, user can retry
├─ Form displays: "✓ Lat: X, Lng: Y"
└─ ✅ Success

Scenario 4: Upload & Email
┌─ User submits form
├─ Image uploaded to Cloudinary
├─ Occurrence created in DB
├─ Email sent to all managers
├─ Email contains: title, desc, location, reporter
├─ Manager receives email
└─ ✅ Success
```

---

## 📊 Performance Metrics

```
Operation          | Time    | Status
─────────────────────────────────────
Geolocation        | ~5s     | ✅
Camera Open        | ~0.5s   | ✅
Photo Capture      | <0.1s   | ✅
Image Upload       | ~2-5s   | ✅ (depends on connection)
Email Send         | ~1s     | ✅ (async)
Form Submit Total  | ~7-10s  | ✅
─────────────────────────────────────
```

---

## 🔐 Security

```
Input Validation
├── Image size: max 10MB
├── Image type: image/* only
├── Form fields: required validation
└── Email: SMTP only (Resend)

Data Protection
├── Cloudinary: HTTPS + secure URL
├── Database: Encrypted via PostgreSQL
├── Email: No sensitive data in body
└── GPS: Optional (user controls)

API Security (Future Phases)
├── Rate limiting on /api/upload
├── CORS configured
├── Request validation with Zod
└── Authentication check
```

---

## 🚀 Deployment Readiness

```
✅ Local Development
├─ npm install
├─ .env configured
├─ npm run dev
└─ Works on localhost:3000

✅ Testing
├─ Geolocation tested on mobile
├─ Camera tested on mobile
├─ Email templates verified
└─ Upload to Cloudinary working

⏳ Vercel Deploy (Fase 3)
├─ Push to GitHub
├─ Connect Vercel
├─ Set env vars (RESEND_API_KEY, etc)
└─ Auto deploy on push

⏳ Production
├─ HTTPS required (for camera/geo)
├─ Email domain verified (Resend)
├─ Cloudinary production settings
└─ Monitoring setup
```

---

## 📈 Next Phase Dependencies

```
Fase 3: Tratativa & Dashboard
├── Depende de:
│   ├── ✅ Occurrence model (Fase 1)
│   ├── ✅ User/Role model (Fase 1)
│   ├── ✅ Email notifications (Fase 2)
│   └── ✅ Occurrence creation (Fase 2)
│
├── Novos requisitos:
│   ├── StatusHistory tracking
│   ├── Comment system
│   ├── Assignment system
│   └── Dashboard aggregations
│
└── Novos componentes:
    ├── OccurrenceDetail page
    ├── StatusUpdate modal
    ├── CommentThread
    ├── Dashboard with filters
    └── Advanced charts
```

---

**Diagrama**: Fase 2 Architecture  
**Status**: ✅ Complete  
**Data**: 24 de junho de 2026
