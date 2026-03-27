# Arquitectura Técnica - TradingSystem Analytics

## 🏗️ Overview Arquitectónico

### Modelo en Capas

```
┌──────────────────────────────────────────────────┐
│              Presentation Layer                   │
│  (React Components, Pages, UI State)             │
└────────────────────┬─────────────────────────────┘
                     │ (HTTP/REST)
┌────────────────────▼─────────────────────────────┐
│              API Layer (Node.js)                  │
│  ├─ Route Handlers                               │
│  ├─ Request Validation                           │
│  ├─ Authentication & Authorization               │
│  └─ Error Handling                               │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│          Business Logic Layer                     │
│  ├─ Trade Services                               │
│  ├─ Analytics Engine                             │
│  ├─ Report Generator                             │
│  ├─ Alert Service                                │
│  └─ User Management                              │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│            Data Access Layer                      │
│  (Prisma ORM)                                    │
└────────────────────┬─────────────────────────────┘
                     │
         ┌───────────┴──────────┬──────────┐
         │                      │          │
    ┌────▼────┐         ┌──────▼──┐  ┌───▼──┐
    │PostgreSQL│         │Redis    │  │Queue │
    │Database  │         │Cache    │  │(Bull)│
    └──────────┘         └─────────┘  └──────┘
```

---

## 🎯 Componentes Principales

### 1. Frontend (React + Next.js)

**Tecnologías:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- TailwindCSS + Shadcn/UI
- Zustand (state management)
- React Query / SWR (data fetching)
- Chart.js / Recharts (visualizaciones)

**Carpeta `/app` (Pages):**
```
app/
├── layout.tsx              # Layout principal
├── page.tsx                # Home/Dashboard
├── auth/
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/
│   └── page.tsx            # Dashboard principal
├── trades/
│   ├── page.tsx            # Lista de trades
│   ├── [id]/page.tsx       # Detalle de trade
│   └── new/page.tsx        # Crear nuevo trade
├── analytics/
│   ├── page.tsx            # Analytics principal
│   ├── reports/page.tsx    # Reportes
│   └── performance/page.tsx
├── settings/
│   └── page.tsx
└── api/
    └── [endpoints]         # API routes (backend)
```

**Carpeta `/components`:**
```
components/
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── dashboard/
│   ├── MetricCard.tsx      # KPI display
│   ├── PerformanceChart.tsx
│   ├── RecentTrades.tsx
│   └── EquityCurve.tsx
├── trades/
│   ├── TradeForm.tsx       # Form crear/editar
│   ├── TradeTable.tsx      # Listado con filtros
│   └── TradeDetail.tsx
├── analytics/
│   ├── StatisticsPanel.tsx
│   ├── DrawdownChart.tsx
│   └── WinRateBreakdown.tsx
└── common/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    └── LoadingSpinner.tsx
```

### 2. Backend (Node.js + Express)

**Estructura:**
```
backend/src/
├── routes/                 # API routes
│   ├── auth.routes.ts
│   ├── trades.routes.ts
│   ├── analytics.routes.ts
│   ├── users.routes.ts
│   └── reports.routes.ts
├── controllers/            # Request handlers
│   ├── auth.controller.ts
│   ├── trades.controller.ts
│   ├── analytics.controller.ts
│   └── users.controller.ts
├── services/               # Business logic
│   ├── trade.service.ts
│   ├── analytics.service.ts
│   ├── report.service.ts
│   ├── auth.service.ts
│   └── notification.service.ts
├── middleware/
│   ├── auth.middleware.ts  # JWT verification
│   ├── validation.ts       # Input validation
│   ├── errorHandler.ts
│   └── logger.ts
├── utils/
│   ├── metrics.ts          # Cálculo de métricas
│   ├── helpers.ts
│   └── constants.ts
├── types/
│   ├── trade.types.ts
│   ├── user.types.ts
│   ├── api.types.ts
│   └── index.ts
└── server.ts               # Entry point
```

**Dependencias Backend:**
```json
{
  "express": "^4.18.0",
  "typescript": "^5.0.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "joi": "^17.9.0",
  "dotenv": "^16.0.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "morgan": "^1.10.0"
}
```

---

## 🔐 Autenticación y Autorización

### Flujo JWT
```
1. User registra/login
   ↓
2. Backend genera JWT (Access Token + Refresh Token)
   ↓
3. Frontend almacena tokens (localStorage/cookie)
   ↓
4. Cada request incluye Authorization: Bearer <token>
   ↓
5. Middleware valida token
   ↓
6. Request procesado o rechazado
```

### Endpoint Auth
```
POST /api/auth/register
  body: { email, password, name }
  response: { accessToken, refreshToken, user }

POST /api/auth/login
  body: { email, password }
  response: { accessToken, refreshToken, user }

POST /api/auth/refresh
  body: { refreshToken }
  response: { accessToken }

POST /api/auth/logout
  header: Authorization: Bearer <token>
```

---

## 📊 API Endpoints

### Trades
```
GET    /api/trades              # Listar trades con filtros
GET    /api/trades/:id          # Detalle trade
POST   /api/trades              # Crear trade
PUT    /api/trades/:id          # Actualizar trade
DELETE /api/trades/:id          # Eliminar trade
```

### Analytics
```
GET    /api/analytics/summary   # Resumen de métricas
GET    /api/analytics/performance
GET    /api/analytics/drawdown
GET    /api/analytics/statistics/:period
GET    /api/analytics/by-asset
GET    /api/analytics/by-strategy
```

### Reports
```
GET    /api/reports/daily
GET    /api/reports/weekly
GET    /api/reports/monthly
GET    /api/reports/export    # PDF/CSV
POST   /api/reports/schedule   # Reporte automático
```

---

## 🗄️ Base de Datos (PostgreSQL)

**Principales entidades:**

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Trades (ver DATABASE.md para schema completo)
CREATE TABLE trades (
  id UUID PRIMARY KEY,
  userId UUID FOREIGN KEY,
  entryDate DATE NOT NULL,
  entryPrice DECIMAL(20,8),
  exitPrice DECIMAL(20,8),
  quantity DECIMAL(20,8),
  asset VARCHAR(50),
  strategy VARCHAR(100),
  side ENUM('LONG', 'SHORT'),
  status ENUM('OPEN', 'CLOSED', 'CANCELLED'),
  profitLoss DECIMAL(20,8),
  roi DECIMAL(10,4),
  notes TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- (Ver DATABASE.md para todas las tablas)
```

---

## ⚡ Cache y Performance

### Redis Usage
```
- Session storage
- Cached analytics (actualizado cada hora)
- Rate limiting
- Job queue (reportes, alertas)
- Real-time metrics
```

### Estrategia de Cache
```javascript
// Ejemplo
const cacheKey = `analytics:${userId}:${period}`;
const cached = await redis.get(cacheKey);

if (cached) return JSON.parse(cached);

const analytics = await calculateAnalytics();
await redis.setex(cacheKey, 3600, JSON.stringify(analytics)); // 1 hora
return analytics;
```

---

## 📤 Integración Futura (Brokers)

Placeholder para integración con:
- **Interactive Brokers** API
- **Alpaca** Trading API
- **IB Gateway** (FIX protocol)
- **Webhooks** para datos en tiempo real

```
Broker API → Backend → Redis Queue → Database
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Automático en push a main
- Build optimizado
- Edge caching
- Serverless functions
```

### Backend (Railway/Render)
```bash
# Docker containerizado
- Auto-scaling
- Load balancing
- Database backups
```

### Infrastructure as Code
```
docker-compose.yml   # Local development
Dockerfile           # Production image
.github/workflows/   # CI/CD pipelines
```

---

## 🔄 Flujo de Datos (Ejemplo: Crear Trade)

```
1. User llena form en Frontend
   ↓
2. Form validation (cliente)
   ↓
3. POST /api/trades { tradeData }
   ↓
4. Middleware: Verificar JWT
   ↓
5. Controller: Validar entrada (Joi schema)
   ↓
6. Service: Crear trade + calcular métricas
   ↓
7. Prisma: INSERT en PostgreSQL
   ↓
8. Invalidar cache de analytics
   ↓
9. Response: { trade, calculatedMetrics }
   ↓
10. Frontend: Update local state + revalidate
    ↓
11. UI: Mostrar success y actualizar dashboard
```

---

## 🛡️ Seguridad

### Prácticas Implementadas
- ✅ HTTPS obligatorio
- ✅ JWT con expiración (15min access, 7d refresh)
- ✅ Password hashing (bcryptjs)
- ✅ CORS configurado
- ✅ Helmet.js (headers seguros)
- ✅ Input validation (Joi)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ Environment variables (.env)

---

## 📈 Escalabilidad

### Crecimiento esperado
```
MVP (100 usuarios)
  → Monolítico en 1 servidor

V1 (1,000 usuarios)
  → Frontend en Vercel
  → Backend en Railway
  → PostgreSQL dedicado

V2 (10,000+ usuarios)
  → Microservicios
  → Read replicas
  → Message queue (RabbitMQ)
  → CDN global
```

---

**Documento actualizado:** 2026-03-27
