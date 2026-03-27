# Platsledning.ai

En fullstack projektledningsapp för byggbranschen byggd med React, TypeScript, Node.js och PostgreSQL.

## 🏗️ Funktioner

### 1. **Projekt**
- Skapa och hantera projekt med namn, nummer, kund, adress, budget
- Projektstatus: planering, produktion, avslutat

### 2. **Tidsplan (Gantt)**
- Aktiviteter med start/slutdatum, beroenden, framsteg
- Statusar: ej_redo, redo, pågår, klar, blockerad
- Milstolpar, faser, yrken
- Ready-check system innan aktivitet startar

### 3. **Ritningshantering**
- Ladda upp och visa PDF-ritningar
- Versionering och jämförelse av ritningar
- Mätverktyg direkt i PDF
- AI-sökning bland ritningar

### 4. **Avvikelser**
- Rapportera avvikelser med foto, plats, prioritet
- Tilldela till underentreprenör
- Statusflöde: upptäckt → tilldelad → åtgärdad → verifierad

### 5. **Egenkontroller & Checklistor**
- Checkpunkter med krav och toleranser
- Digital signering
- Koppling till aktiviteter

### 6. **Skyddsrond**
- Planera och genomföra skyddsronder
- Kategorier: fallskydd, lyft, el, brand, trafik
- Åtgärdshantering

### 7. **Dagbok**
- Daglig logg med väder, personal, utrustning
- AI-sammanfattning

### 8. **Möten**
- Mötesprotokoll med beslut
- Automatisk uppgiftsgenerering
- AI-transkribering

### 9. **ÄTA-hantering**
- Ärenden för ändrings- och tilläggsarbeten
- Statusflöde: utkast → skickad → godkänd → fakturerad

### 10. **Uppgifter & Tavla**
- Kanban-tavla
- Prioritering och deadline

### 11. **Resursplanering**
- Lägg till resurser (personal, maskiner)
- Belastningsdiagram

### 12. **Användarhantering**
- Roller per projekt
- Behörigheter
- Inbjudningssystem

### 13. **AI-assistent**
- Chattgränssnitt kopplat till projektdata
- Riskanalys och åtgärdsförslag

### 14. **Notifikationer**
- Realtidsnotifikationer
- E-postnotifikationer

### 15. **Rapporter & Kundvy**
- PDF-export
- Begränsad kundvy

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Zustand (state management)
- React Query
- PDF.js

### Backend
- Node.js + Express
- PostgreSQL
- Supabase Auth
- JWT
- Socket.io (realtid)
- Winston (logging)

### DevOps / Infrastruktur
- Docker
- PostgreSQL
- S3/Cloudflare R2 (fillagring)
- Anthropic Claude API

## 📁 Projektstruktur

```
Bygglo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities (auth, api)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Entry point
│   ├── migrations/        # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── .github/
│   └── copilot-instructions.md
│
└── README.md

```

## 🚀 Installation & Setup

### Förutsättningar
- Node.js 18+
- PostgreSQL 14+
- npm eller yarn

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend körs på `http://localhost:5173`

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Redigera .env med dina inställningar
npm run dev
```

Backend körs på `http://localhost:3001`

### Database Setup

```bash
# Skapa databasen
createdb platsledning_ai

# Kör migrationer
cd server
npm run migrate

# Seed (optional)
npm run seed
```

## 📝 Environment Variables

Se `.env.example` i `client/` och `server/` mappar.

### Critical Environment Variables

**Server (.env)**
```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=platsledning_ai
JWT_SECRET=your_secret_key
ANTHROPIC_API_KEY=your_key
```

**Client (.env)**
```
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_key
```

## 🧪 Utveckling

### Linting
```bash
# Frontend
cd client && npm run lint

# Backend
cd server && npm run lint
```

### Type Checking
```bash
# Frontend
cd client && npm run type-check

# Backend
cd server && npm run type-check
```

### Building

**Frontend:**
```bash
cd client && npm run build
```

**Backend:**
```bash
cd server && npm run build
```

## 📚 API Dokumentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Activities
- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

*(Och många fler - se server/src/routes för fullständig lista)*

## 🔐 Säkerhet

- JWT-baserad autentisering
- CORS konfigurad
- Rate limiting
- Helmet för säkra headers
- Input validation med Zod
- Environment variables för känslig data

## 🤝 Bidrag

1. Fork projektet
2. Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Push till branchen (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

## 📄 Licens

MIT License

## 📞 Support

För frågor eller support, kontakta utvecklingsteamet.

---

**Senast uppdaterad:** März 2026
