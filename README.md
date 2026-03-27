# TradingSystem Analytics Platform

**Aplicación Web SaaS para gestión y análisis profesional de operaciones de trading**

## 📊 Descripción

Plataforma web moderna para traders que permite:
- Registro y seguimiento detallado de trades
- Análisis de métricas clave (ROI, Drawdown, Win Rate, Risk/Reward)
- Dashboard interactivo con visualizaciones avanzadas
- Reportes y estadísticas por período, activo y estrategia
- Sistema de alertas y insights automáticos

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend:** React 18 + TypeScript + Next.js
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Redis
- **ORM:** Prisma
- **Hosting:** Vercel (frontend) + Railway/Render (backend)

### Componentes Principales
```
┌─────────────────────────────────────────┐
│    React.js Web App (Next.js)           │
│  ├─ Dashboard                           │
│  ├─ Trade Management                    │
│  ├─ Analytics & Reports                 │
│  └─ Settings                            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Backend API (Node.js + Express)       │
│  ├─ Authentication (JWT)                │
│  ├─ Trades CRUD                         │
│  ├─ Analytics Engine                    │
│  ├─ Reports Generator                   │
│  └─ Alerts Service                      │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐   ┌────▼────┐   ┌───▼──┐
│  DB  │   │  Redis  │   │Queues│
│ Pgql │   │ (Cache) │   │(BG)  │
└──────┘   └─────────┘   └──────┘
```

## 📁 Estructura del Proyecto

```
trading-system/
├── frontend/                # React.js + Next.js
│   ├── app/                # Next.js App Router
│   ├── components/         # Componentes React
│   ├── hooks/              # Custom hooks
│   ├── services/           # API clients
│   ├── types/              # TypeScript types
│   ├── styles/             # CSS/Tailwind
│   └── package.json
│
├── backend/                # Node.js + Express
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # Services
│   │   ├── middleware/     # Auth, validation
│   │   ├── models/         # Data models
│   │   ├── utils/          # Utilities
│   │   └── server.ts       # Entry point
│   ├── prisma/             # Database schema
│   └── package.json
│
├── docs/                   # Documentación
│   ├── ARCHITECTURE.md     # Arquitectura técnica
│   ├── DATABASE.md         # Schema & relations
│   ├── API.md              # API documentation
│   ├── UI-WIREFRAMES.md    # UI/UX design
│   └── METRICS.md          # Fórmulas & métricas
│
├── .github/                # GitHub workflows
│   └── workflows/          # CI/CD
│
└── ROADMAP.md              # Plan de desarrollo
```

## 🚀 Quick Start

```bash
# 1. Clonar repositorio
git clone <repo>
cd trading-system

# 2. Frontend
cd frontend
npm install
npm run dev

# 3. Backend (en otra terminal)
cd backend
npm install
npm run dev

# 4. Base de datos
# Ver docs/DATABASE.md para setup PostgreSQL
```

## 📊 Métricas Principales

- **ROI (Return on Investment):** (Ganancia Total / Capital Inicial) × 100
- **Win Rate:** (Trades Ganadores / Total Trades) × 100
- **Drawdown:** Máxima caída en capital desde pico
- **Risk/Reward Ratio:** Riesgo promedio / Ganancia promedio
- **Profit Factor:** Ganancias totales / Pérdidas totales

## 📋 Roadmap

Ver `ROADMAP.md` para plan detallado de desarrollo (MVP → v2.0)

## 💰 Modelo de Negocio

Plan SaaS con 3 tiers:
- **Free:** 5 trades/mes, dashboard básico
- **Pro:** $9.99/mes, unlimited trades
- **Elite:** $29.99/mes, integraciones + API

---

**Estado:** 🚧 En desarrollo
**Última actualización:** 2026-03-27
