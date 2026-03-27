# Métricas y Fórmulas de Cálculo - TradingSystem

## 📊 Métricas por Trade

### 1. **Profit/Loss (P&L)**
Ganancia o pérdida absoluta en $ de cada operación

**Para LONG:**
```
P&L = (Exit Price - Entry Price) × Quantity
```

**Para SHORT:**
```
P&L = (Entry Price - Exit Price) × Quantity
```

**Ejemplo:**
```
LONG: Entré a 100 con 10 acciones, salí a 105
P&L = (105 - 100) × 10 = $50

SHORT: Entré a 100 con 10 acciones, salí a 95
P&L = (100 - 95) × 10 = $50
```

---

### 2. **P&L Percentage (Retorno %)**
Retorno porcentual del trade

**Para LONG:**
```
P&L % = ((Exit Price - Entry Price) / Entry Price) × 100
```

**Para SHORT:**
```
P&L % = ((Entry Price - Exit Price) / Entry Price) × 100
```

**Ejemplo:**
```
LONG: Entré a 100, salí a 110
P&L % = ((110 - 100) / 100) × 100 = 10%

SHORT: Entré a 100, salí a 90
P&L % = ((100 - 90) / 100) × 100 = 10%
```

---

### 3. **Risk (Riesgo en $)**
Cantidad de dinero en riesgo en el trade

```
Risk = (Entry Price - Stop Loss) × Quantity  [LONG]
Risk = (Stop Loss - Entry Price) × Quantity  [SHORT]
```

**Ejemplo:**
```
LONG: Entrada 100, Stop Loss 95, Quantity 10
Risk = (100 - 95) × 10 = $50
```

---

### 4. **Reward (Potencial de Ganancia en $)**
Cantidad potencial a ganar en el trade

```
Reward = (Take Profit - Entry Price) × Quantity  [LONG]
Reward = (Entry Price - Take Profit) × Quantity  [SHORT]
```

**Ejemplo:**
```
LONG: Entrada 100, Take Profit 110, Quantity 10
Reward = (110 - 100) × 10 = $100
```

---

### 5. **Risk/Reward Ratio**
Relación entre riesgo y potencial de ganancia (cuánto ganas vs cuánto arriesgas)

```
R/R Ratio = Reward / Risk
```

**Ejemplo:**
```
Si Risk = $50 y Reward = $100
R/R = 100 / 50 = 2:1  (Excelente)

Si Risk = $100 y Reward = $50
R/R = 50 / 100 = 0.5:1  (Pobre)
```

**Interpretación:**
- R/R 2:1 = Ganas $2 por cada $1 que arriesgas ✅ (Bueno)
- R/R 1:1 = Ganas $1 por cada $1 que arriesgas (Aceptable)
- R/R < 1:1 = Ganas menos de lo que arriesgas ❌ (Malo)

---

## 📈 Métricas por Período (Día/Semana/Mes)

### 6. **Total P&L**
Suma de todas las ganancias/pérdidas

```
Total P&L = SUM(P&L de cada trade cerrado)
```

**Ejemplo (Mes):**
```
Trade 1: +$100
Trade 2: -$50
Trade 3: +$75
Total P&L = $100 - $50 + $75 = $125
```

---

### 7. **Win Rate (%)**
Porcentaje de trades ganadores

```
Win Rate = (Winning Trades / Total Closed Trades) × 100
```

**Ejemplo:**
```
Winning trades: 6
Losing trades: 4
Total: 10
Win Rate = (6 / 10) × 100 = 60%
```

**Interpretación:**
- 50% = Break-even (sin ventaja)
- 55-60% = Bueno para daytraders
- 70%+ = Excelente (pero posiblemente data de prueba)

---

### 8. **Winning Trades vs Losing Trades**
Cantidad de trades con ganancias vs pérdidas

```
Winning Trades = COUNT(P&L > 0)
Losing Trades = COUNT(P&L < 0)
Break-even Trades = COUNT(P&L = 0)
```

---

### 9. **Average Win / Average Loss**
Promedio de ganancias y pérdidas

```
Average Win = SUM(P&L positivos) / Winning Trades
Average Loss = SUM(P&L negativos) / Losing Trades
```

**Ejemplo:**
```
Ganancias: $100 + $75 + $50 = $225 (3 trades)
Avg Win = $225 / 3 = $75

Pérdidas: -$30 - $20 = -$50 (2 trades)
Avg Loss = -$50 / 2 = -$25

Esperanza = (Win Rate × Avg Win) - ((1 - Win Rate) × Avg Loss)
          = (0.6 × $75) - (0.4 × $25)
          = $45 - $10
          = +$35 por trade
```

---

### 10. **Profit Factor**
Ratio de ganancias totales vs pérdidas totales

```
Profit Factor = SUM(Winning Trades) / ABS(SUM(Losing Trades))
```

**Ejemplo:**
```
Ganancias totales: $1,000
Pérdidas totales: -$400
Profit Factor = $1,000 / $400 = 2.5

Interpretación:
- > 2.0 = Excelente
- 1.5 - 2.0 = Muy bueno
- 1.0 - 1.5 = Bueno
- < 1.0 = Insuficiente
```

---

### 11. **Expectancy (Esperanza Matemática)**
Ganancia/pérdida promedio por trade

```
Expectancy = (Win Rate × Avg Win) - ((1 - Win Rate) × Avg Loss)
```

**Ejemplo:**
```
Win Rate = 55%
Avg Win = $100
Avg Loss = -$80

Expectancy = (0.55 × $100) - (0.45 × $80)
           = $55 - $36
           = +$19 por trade

Si hago 20 trades: $19 × 20 = +$380
```

---

## 💰 Métricas del Portfolio

### 12. **Total P&L (Portfolio)**
Suma de todas las ganancias/pérdidas acumuladas

```
Total P&L = Current Capital - Initial Capital
```

**Ejemplo:**
```
Capital inicial: $10,000
Capital actual: $11,500
Total P&L = $11,500 - $10,000 = +$1,500
```

---

### 13. **ROI (Return on Investment)**
Retorno porcentual sobre la inversión inicial

```
ROI = (Total P&L / Initial Capital) × 100
```

**Ejemplo:**
```
Total P&L = $1,500
Initial Capital = $10,000
ROI = ($1,500 / $10,000) × 100 = 15%
```

**Interpretación:**
- 10% anual = Excelente (mejor que S&P 500)
- 50%+ anual = Muy bueno (con riesgo moderado)
- 100%+ anual = Excepcional (revisar supervivencia)

---

### 14. **Monthly ROI**
Retorno mensual

```
Monthly ROI = ((Capital Month-End - Capital Month-Start) / Capital Month-Start) × 100
```

---

### 15. **Drawdown (Máxima Caída)**
Máxima pérdida desde el pico más alto

```
Drawdown % = ((Lowest Point - Peak) / Peak) × 100
```

**Visualización:**
```
Capital
  ↑
  │     Peak ●═════════════════════
  │       ║                        ╲
  │       ║                         ╲ Drawdown
  │       ║                          ╲
  │       ║                           ● Lowest Point
  │───────┴──────────────────────────────────► Tiempo
```

**Ejemplo:**
```
Peak capital: $12,000
Lowest point después: $10,500
Drawdown = ((10,500 - 12,000) / 12,000) × 100 = -12.5%
```

**Interpretación:**
- < 10% = Muy bueno
- 10-20% = Aceptable
- 20-30% = Moderado
- > 30% = Alto riesgo

---

### 16. **Max Drawdown (Máximo Drawdown Histórico)**
Mayor caída porcentual en la historia de trading

```
Max Drawdown = MIN(Drawdown %) en todo el período
```

---

### 17. **Recovery Factor**
Qué tan rápido se recupera de drawdowns

```
Recovery Factor = Total P&L / Max Drawdown (en $)
```

**Ejemplo:**
```
Total P&L: $5,000
Max Drawdown: $2,000
Recovery Factor = $5,000 / $2,000 = 2.5

Significa: ganas 2.5x más de lo que pierdes en drawdown
```

---

### 18. **CAGR (Compound Annual Growth Rate)**
Tasa de crecimiento anual compuesta

```
CAGR = (Ending Value / Beginning Value)^(1/Years) - 1
```

**Ejemplo:**
```
Capital inicial: $10,000
Capital después de 2 años: $14,400
CAGR = ($14,400 / $10,000)^(1/2) - 1 = 0.2 = 20% anual
```

---

### 19. **Sharpe Ratio**
Retorno ajustado por riesgo (volatilidad)

```
Sharpe Ratio = (Return - Risk-Free Rate) / Standard Deviation

Risk-Free Rate ≈ 2-3% (tasa de bonos del tesoro)
Standard Deviation = volatilidad de retornos
```

**Ejemplo:**
```
Return = 30% anual
Risk-Free Rate = 2%
Volatility = 15%

Sharpe = (0.30 - 0.02) / 0.15 = 1.87

Interpretación:
- > 1.0 = Bueno
- > 2.0 = Muy bueno
- > 3.0 = Excelente
```

---

### 20. **Sortino Ratio**
Similar a Sharpe, pero solo penaliza volatilidad hacia abajo

```
Sortino = (Return - Risk-Free Rate) / Downside Deviation

Downside Deviation = volatilidad solo de retornos negativos
```

**Es mejor que Sharpe porque no penaliza subidas inesperadas.**

---

## 📊 Métricas por Activo

### 21. **Win Rate por Activo**
```
Win Rate (AAPL) = (Trades ganadores en AAPL / Total trades AAPL) × 100
```

**Utilidad:** Identificar en cuáles activos eres mejor trader

---

### 22. **Average Win/Loss por Activo**
```
Avg Win (EUR/USD) = SUM(Winning trades EUR/USD) / Count(Winning trades EUR/USD)
```

---

### 23. **Profit Factor por Activo**
```
PF (BTC) = SUM(Winning trades BTC) / ABS(SUM(Losing trades BTC))
```

---

## 📈 Métricas por Estrategia

### 24. **Performance por Estrategia**
- Win Rate por estrategia
- ROI por estrategia
- Avg P&L por estrategia
- Profit Factor por estrategia

**Utilidad:** Identificar qué estrategias son más rentables

---

## 🔄 Métricas de Consistencia

### 25. **Consecutive Wins/Losses**
Rachas de victorias o derrotas consecutivas

```
Current Streak = 5 wins
Max Winning Streak = 8 wins
Max Losing Streak = 3 losses
```

**Utilidad:** Detectar sesgo emocional y estabilidad

---

### 26. **Win Streak Win Rate**
Porcentaje de ganancias cuando estás en racha positiva

```
Si en racha de 5 wins, 4 fueron trades ganadores
Win Streak WR = 80%
```

---

## ⚠️ Métricas de Riesgo

### 27. **Risk per Trade**
Porcentaje de capital en riesgo por trade

```
Risk per Trade = (Risk $ / Current Capital) × 100
```

**Recomendación:** 1-2% máximo por trade

**Ejemplo:**
```
Capital: $10,000
Risk por trade: $200
Risk % = ($200 / $10,000) × 100 = 2%
```

---

### 28. **Max Risk per Trade**
Mayor riesgo asumido en un solo trade

```
Max Risk = MAX(Risk % en todos los trades)
```

**Alerta:** Si > 5%, hay sobraapalancamiento

---

## 🎯 Índices Compuestos

### 29. **Trading Score**
Puntuación global del trader (0-100)

```
Score = (
  (Win Rate / 100) × 20 +
  (MIN(Sharpe Ratio, 3) / 3) × 20 +
  (MIN(Profit Factor, 3) / 3) × 20 +
  (1 / (1 + Max Drawdown %)) × 20 +
  (MIN(Expectancy / Avg Risk, 2) / 2) × 20
)
```

- 80-100 = Trader excepcional
- 60-79 = Trader bueno
- 40-59 = Trader promedio
- 0-39 = Trader con mejora necesaria

---

## 💻 Implementación en Backend

### TypeScript Types
```typescript
// Per-trade metrics
interface TradeMetrics {
  profitLoss: number;          // $
  profitLossPercentage: number; // %
  roi: number;                 // %
  risk: number;                // $
  reward: number;              // $
  riskRewardRatio: number;     // R:R
}

// Period metrics
interface PeriodMetrics {
  totalProfitLoss: number;
  winRate: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  expectancy: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

// Portfolio metrics
interface PortfolioMetrics extends PeriodMetrics {
  roi: number;
  drawdown: number;
  maxDrawdown: number;
  cagr: number;
  sharpeRatio: number;
  sortinoRatio: number;
  recoveryFactor: number;
}
```

### Calculation Functions
```typescript
// utils/metrics.ts

export const calculateTradeMetrics = (trade: Trade): TradeMetrics => {
  const { entryPrice, exitPrice, quantity, direction, stopLoss, takeProfit } = trade;

  const profitLoss = direction === 'LONG'
    ? (exitPrice - entryPrice) * quantity
    : (entryPrice - exitPrice) * quantity;

  const profitLossPercentage = (profitLoss / (entryPrice * quantity)) * 100;
  const roi = profitLossPercentage;

  const risk = direction === 'LONG'
    ? (entryPrice - stopLoss) * quantity
    : (stopLoss - entryPrice) * quantity;

  const reward = direction === 'LONG'
    ? (takeProfit - entryPrice) * quantity
    : (entryPrice - takeProfit) * quantity;

  const riskRewardRatio = risk > 0 ? reward / risk : 0;

  return { profitLoss, profitLossPercentage, roi, risk, reward, riskRewardRatio };
};

export const calculatePeriodMetrics = (trades: Trade[]): PeriodMetrics => {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  if (closedTrades.length === 0) return defaultMetrics();

  const metrics = closedTrades.map(t => calculateTradeMetrics(t));

  const totalProfitLoss = metrics.reduce((sum, m) => sum + m.profitLoss, 0);
  const winningTrades = metrics.filter(m => m.profitLoss > 0).length;
  const losingTrades = metrics.filter(m => m.profitLoss < 0).length;
  const winRate = (winningTrades / closedTrades.length) * 100;

  const averageWin = winningTrades > 0
    ? metrics
      .filter(m => m.profitLoss > 0)
      .reduce((sum, m) => sum + m.profitLoss, 0) / winningTrades
    : 0;

  const averageLoss = losingTrades > 0
    ? metrics
      .filter(m => m.profitLoss < 0)
      .reduce((sum, m) => sum + m.profitLoss, 0) / losingTrades
    : 0;

  const profitFactor = averageLoss !== 0
    ? (averageWin * winningTrades) / (Math.abs(averageLoss) * losingTrades)
    : 0;

  const expectancy = (winRate / 100) * averageWin - ((1 - winRate / 100) * Math.abs(averageLoss));

  // Consecutive calculations
  let consecutiveWins = 0;
  let maxConsecutiveWins = 0;
  let consecutiveLosses = 0;
  let maxConsecutiveLosses = 0;

  closedTrades.forEach(trade => {
    const { profitLoss } = calculateTradeMetrics(trade);
    if (profitLoss > 0) {
      consecutiveWins++;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins);
      consecutiveLosses = 0;
    } else if (profitLoss < 0) {
      consecutiveLosses++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
      consecutiveWins = 0;
    }
  });

  return {
    totalProfitLoss,
    winRate,
    winningTrades,
    losingTrades,
    averageWin,
    averageLoss,
    profitFactor,
    expectancy,
    consecutiveWins: maxConsecutiveWins,
    consecutiveLosses: maxConsecutiveLosses,
  };
};

// Más funciones para drawdown, CAGR, Sharpe, etc.
```

---

**Documento actualizado:** 2026-03-27
