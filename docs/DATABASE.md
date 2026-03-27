# Modelo de Base de Datos - TradingSystem

## 📊 Diagrama ER (Entity Relationship)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Users     │─────────│   Trades     │─────────│  Assets     │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │
      │                        │
      │                   ┌────┴────┐
      │                   │          │
      └──────────┬────────┴┐   ┌────▼──────────┐
                 │         │   │               │
            ┌────▼─┐  ┌────▼───▼─┐      ┌──────▼──┐
            │Notes │  │Strategies│      │Portfolio│
            └──────┘  └──────────┘      └─────────┘
                │                              │
                └──────────────┬───────────────┘
                               │
                        ┌──────▼────────┐
                        │ AnalyticsCache│
                        └───────────────┘
```

---

## 🗂️ Tablas Detalladas

### 1. **users**
Gestión de usuarios de la plataforma

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  profileImageUrl VARCHAR(500),

  -- Configuración
  preferredCurrency VARCHAR(10) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'UTC',
  theme ENUM('light', 'dark') DEFAULT 'dark',

  -- Estado
  isEmailVerified BOOLEAN DEFAULT FALSE,
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin TIMESTAMP,

  -- Metadata
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  deletedAt TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

---

### 2. **assets**
Activos que se pueden tradear (stocks, forex, crypto, etc.)

```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,

  -- Tipo de activo
  assetType ENUM('STOCK', 'FOREX', 'CRYPTO', 'COMMODITY', 'FUTURES', 'OPTION'),
  exchange VARCHAR(100),

  -- Metadata
  description TEXT,
  logoUrl VARCHAR(500),
  isActive BOOLEAN DEFAULT TRUE,

  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE UNIQUE INDEX idx_assets_active ON assets(symbol) WHERE isActive = TRUE;
```

---

### 3. **strategies**
Estrategias de trading

```sql
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Configuración
  riskPerTrade DECIMAL(5,2),                    -- % de capital en riesgo
  targetRiskRewardRatio DECIMAL(5,2) DEFAULT 2, -- Mínimo ratio R:R

  color VARCHAR(7) DEFAULT '#3B82F6',           -- Color en charts
  isActive BOOLEAN DEFAULT TRUE,

  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_strategies_user ON strategies(userId);
```

---

### 4. **trades** (Tabla Principal)
Registro de cada operación de trading

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assetId UUID NOT NULL REFERENCES assets(id),
  strategyId UUID REFERENCES strategies(id),

  -- Información de entrada
  entryDate DATE NOT NULL,
  entryTime TIME,
  entryPrice DECIMAL(20,8) NOT NULL,
  entryQuantity DECIMAL(20,8) NOT NULL,

  -- Información de salida
  exitDate DATE,
  exitTime TIME,
  exitPrice DECIMAL(20,8),
  exitQuantity DECIMAL(20,8),

  -- Direcciones y estados
  direction ENUM('LONG', 'SHORT') NOT NULL,
  status ENUM('OPEN', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',

  -- Métricas calculadas
  profitLoss DECIMAL(20,8),                    -- $ ganancia/pérdida
  profitLossPercentage DECIMAL(10,4),          -- % ganancia/pérdida
  roi DECIMAL(10,4),                           -- ROI %

  -- Risk Management
  stopLoss DECIMAL(20,8),                      -- Precio de stop loss
  takeProfit DECIMAL(20,8),                    -- Precio de take profit
  riskAmount DECIMAL(20,8),                    -- $ en riesgo
  rewardAmount DECIMAL(20,8),                  -- $ potencial ganancia
  riskRewardRatio DECIMAL(5,2),                -- Ratio R:R

  -- Notas y metadata
  notes TEXT,
  tags VARCHAR(255),                           -- Tags separados por coma
  imageUrl VARCHAR(500),                       -- Screenshot/screenshot

  -- Auditoría
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  closedAt TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_trades_user ON trades(userId);
CREATE INDEX idx_trades_asset ON trades(assetId);
CREATE INDEX idx_trades_strategy ON trades(strategyId);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_entryDate ON trades(entryDate);
CREATE INDEX idx_trades_user_date ON trades(userId, entryDate);
```

---

### 5. **portfolio**
Estado actual del capital y posiciones

```sql
CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Capital
  initialCapital DECIMAL(20,2) NOT NULL,
  currentCapital DECIMAL(20,2) NOT NULL,
  availableCapital DECIMAL(20,2),              -- Capital no invertido

  -- Métricas globales
  totalProfitLoss DECIMAL(20,2),               -- $ ganancia/pérdida acumulada
  totalROI DECIMAL(10,4),                      -- % ROI total

  -- Drawdown
  currentDrawdown DECIMAL(10,4),               -- % drawdown actual
  maxDrawdown DECIMAL(10,4),                   -- % máximo drawdown histórico

  -- Estadísticas
  totalTrades INT DEFAULT 0,
  winTrades INT DEFAULT 0,
  lossTrades INT DEFAULT 0,
  winRate DECIMAL(5,2),                        -- % de trades ganadores

  -- Ratios
  profitFactor DECIMAL(5,2),                   -- Ganancias / Pérdidas
  consecutiveWins INT DEFAULT 0,
  consecutiveLosses INT DEFAULT 0,

  -- Fechas
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  lastTradeDate DATE
);

CREATE INDEX idx_portfolio_user ON portfolio(userId);
```

---

### 6. **daily_snapshots**
Snapshot diario del portfolio para tracking histórico

```sql
CREATE TABLE daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshotDate DATE NOT NULL,

  capital DECIMAL(20,2) NOT NULL,
  equity DECIMAL(20,2),                        -- Capital + ganancias no realizadas
  profitLoss DECIMAL(20,2),
  drawdown DECIMAL(10,4),

  openTrades INT,
  closedTodayTrades INT,

  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_snapshots_user_date ON daily_snapshots(userId, snapshotDate);
```

---

### 7. **analytics_cache**
Cache de análisis calculados para mejor performance

```sql
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  period VARCHAR(20) NOT NULL,                 -- 'daily', 'weekly', 'monthly', 'all'
  dataType VARCHAR(50) NOT NULL,               -- 'summary', 'by_asset', 'by_strategy'

  cachedData JSONB NOT NULL,                   -- Datos en JSON

  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),

  UNIQUE(userId, period, dataType)
);

CREATE INDEX idx_cache_expires ON analytics_cache(expiresAt);
```

---

### 8. **alerts**
Sistema de alertas y notificaciones

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL,                   -- 'drawdown_warning', 'bad_streak', etc.
  message TEXT NOT NULL,

  isRead BOOLEAN DEFAULT FALSE,
  actionUrl VARCHAR(500),                      -- Link a donde ir al hacer click

  createdAt TIMESTAMP DEFAULT NOW(),
  readAt TIMESTAMP
);

CREATE INDEX idx_alerts_user_read ON alerts(userId, isRead);
```

---

### 9. **subscription_tiers**
Planes de pago

```sql
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,            -- 'free', 'pro', 'elite'
  price DECIMAL(10,2),
  billingPeriod VARCHAR(20) DEFAULT 'monthly',

  features JSONB NOT NULL,                     -- Features disponibles
  tradesPerMonth INT,

  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

### 10. **user_subscriptions**
Suscripción activa de cada usuario

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL UNIQUE REFERENCES users(id),
  tierId UUID NOT NULL REFERENCES subscription_tiers(id),

  status VARCHAR(20) DEFAULT 'active',         -- 'active', 'cancelled', 'expired'
  startDate TIMESTAMP DEFAULT NOW(),
  endDate TIMESTAMP,

  stripeSubscriptionId VARCHAR(100),           -- Para Stripe integration

  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON user_subscriptions(userId);
```

---

## 📐 Relaciones Principales

### Trade Lifecycle
```
1. User crea trade
   ├─ Valida entrada vs capital disponible
   ├─ Calcula risk/reward
   └─ Inserta en trades (status = OPEN)

2. User cierra trade
   ├─ Inserta exit price/date
   ├─ Calcula profit/loss
   ├─ Actualiza portfolio
   └─ Crea daily_snapshot

3. Sistema calcula análisis
   ├─ Win rate, drawdown, ROI
   ├─ Cachea en analytics_cache
   └─ Genera alertas si necesario
```

---

## 🔍 Queries Optimizadas

### Trades recientes del usuario
```sql
SELECT t.*, a.symbol, s.name as strategyName
FROM trades t
LEFT JOIN assets a ON t.assetId = a.id
LEFT JOIN strategies s ON t.strategyId = s.id
WHERE t.userId = $1
ORDER BY t.entryDate DESC
LIMIT 50;
```

### Métricas del mes actual
```sql
SELECT
  COUNT(*) as total_trades,
  SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END) as winning_trades,
  SUM(CASE WHEN profitLoss < 0 THEN 1 ELSE 0 END) as losing_trades,
  SUM(profitLoss) as total_profit_loss,
  (SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END)::FLOAT /
   COUNT(*)) * 100 as win_rate,
  AVG(CASE WHEN profitLoss > 0 THEN profitLoss END) as avg_win,
  AVG(CASE WHEN profitLoss < 0 THEN profitLoss END) as avg_loss
FROM trades
WHERE userId = $1
  AND entryDate >= date_trunc('month', CURRENT_DATE)
  AND status = 'CLOSED';
```

### Drawdown máximo
```sql
WITH daily_equity AS (
  SELECT snapshotDate, capital,
         MAX(capital) OVER (
           ORDER BY snapshotDate
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         ) as running_max
  FROM daily_snapshots
  WHERE userId = $1
)
SELECT MAX((running_max - capital) / running_max * 100) as max_drawdown
FROM daily_equity;
```

---

## 🔒 Constraints y Validaciones

```sql
-- P&L debe calcularse correctamente
ALTER TABLE trades ADD CONSTRAINT check_pl_calculation
CHECK (
  (direction = 'LONG' AND profitLoss = (exitPrice - entryPrice) * exitQuantity)
  OR (direction = 'SHORT' AND profitLoss = (entryPrice - exitPrice) * exitQuantity)
  OR profitLoss IS NULL
);

-- Risk/Reward debe ser válido
ALTER TABLE trades ADD CONSTRAINT check_rr_positive
CHECK (riskRewardRatio IS NULL OR riskRewardRatio > 0);

-- Portfolio debe tener valores válidos
ALTER TABLE portfolio ADD CONSTRAINT check_capital_positive
CHECK (initialCapital > 0 AND currentCapital >= 0);
```

---

## 📈 Migrations

Prisma schema (`prisma/schema.prisma`):
```prisma
// Ver prisma/schema.prisma para schema completo
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String          @id @default(uuid())
  email             String          @unique
  passwordHash      String
  // ... campos
  trades            Trade[]
  portfolio         Portfolio?
  strategies        Strategy[]
  alerts            Alert[]

  @@index([email])
}

model Trade {
  id                String          @id @default(uuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  // ... campos

  @@index([userId])
  @@index([entryDate])
}

// ... más modelos
```

---

## 📊 Seed Data

Scripts para datos iniciales:
- Assets comunes (AAPL, EURUSD, BTC, etc.)
- Estrategias estándar (Scalping, Swing Trading, etc.)
- Subscription tiers
- Alertas de ejemplo

---

**Documento actualizado:** 2026-03-27
