# UI/UX Design - TradingSystem Web App

## 🎨 Diseño Visual

### Color Palette
```
Primary: #1F2937 (Dark Gray - Fondo)
Secondary: #3B82F6 (Blue - Acciones)
Success: #10B981 (Green - Ganancias)
Danger: #EF4444 (Red - Pérdidas)
Warning: #F59E0B (Orange - Alertas)
Light: #F3F4F6 (Light Gray - Texto)
```

### Tipografía
```
Font Family: Inter, -apple-system, sans-serif
Headings: Font-weight 700 (Bold)
Body: Font-weight 400 (Regular)
Numbers: Font-weight 500 (Medium) - para métricas
```

---

## 📱 Estructura General

### Layout Principal
```
┌─────────────────────────────────────────────┐
│  Header (Logo + Search + User Menu)         │
├─────────┬───────────────────────────────────┤
│         │                                   │
│ Sidebar │        Main Content              │
│ (Nav)   │        (Responsive)              │
│         │                                   │
│         │                                   │
└─────────┴───────────────────────────────────┘

Mobile (< 768px):
┌──────────────────────────────────┐
│ Header + Menu Hamburger          │
├──────────────────────────────────┤
│                                  │
│    Main Content (Full Width)    │
│                                  │
│    Sidebar (Drawer/Modal)       │
└──────────────────────────────────┘
```

---

## 📄 Páginas Principales

### 1. **Login / Register**

#### Login Page
```
┌────────────────────────────────────┐
│                                    │
│     TradingSystem Analytics       │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Email                        │  │
│  │ [____________________]       │  │
│  │                              │  │
│  │ Password                     │  │
│  │ [____________________]       │  │
│  │                              │  │
│  │ [ ] Remember me              │  │
│  │                              │  │
│  │ [   Sign In    ]             │  │
│  │                              │  │
│  │ Don't have account? Register │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘

Dark mode con gradiente sutil
Input fields con border bottom apenas visible
Button azul con hover effect
```

---

### 2. **Dashboard (Home)**

El corazón de la app - vista rápida de performance

```
┌──────────────────────────────────────────────────┐
│ Dashboard                        🔄 ⚙️           │
├──────────────────────────────────────────────────┤
│                                                  │
│  Period Selector:  [This Month ▼]  [Export]    │
│                                                  │
│  ┌─ KPI Cards (4 columnas) ──────────────────┐  │
│  │                                            │  │
│  │  Total P&L        Win Rate      ROI       │  │
│  │  +$2,150          62%          15.3%     │  │
│  │  ↑ vs último mes  vs hist      Month     │  │
│  │                                           │  │
│  │  Drawdown         Trades       Profit    │  │
│  │  -8.5%           23 trades    Factor    │  │
│  │  Max: -12%       15W / 8L     2.15x    │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌─ Main Charts ─────────────────────────────┐  │
│  │                                            │  │
│  │ Equity Curve                              │  │
│  │                                            │  │
│  │ $13,000 │      ╭─────╮                    │  │
│  │ $12,500 │   ╭─╯       ╰───╮                │  │
│  │ $12,000 │╭──╯              ╰─╮            │  │
│  │ $11,500 │╯                    ╰──         │  │
│  │ $11,000 ├─────────────────────────────   │  │
│  │         │ Mar 1     Mar 15    Mar 27     │  │
│  │                                            │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌─ Recent Trades ────────────────────────────┐  │
│  │ Date      Asset  Type  Entry    Exit  P&L │  │
│  │ Mar 27    AAPL   LONG  150.23  152.1 +$90│  │
│  │ Mar 26    EUR/USD LONG 1.0842 1.0891+$49│  │
│  │ Mar 25    BTC    SHORT 42100  41900 +$200 │  │
│  │ Ver todos...                             │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Features:**
- KPI Cards grandes y legibles (número + contexto)
- Equity curve animada al cargar
- Colores: Green para positivos, Red para negativos
- Period selector (Day/Week/Month/Year/All)
- Export a PDF/CSV

---

### 3. **Trades Management**

#### Trades List
```
┌─────────────────────────────────────────────────────┐
│ Trades                              [+ New Trade]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Filters:  [Asset ▼] [Status ▼] [Date Range ▼]   │
│           [Strategy ▼]  [Search ____]  [Reset]   │
│                                                     │
│ ┌────────────────────────────────────────────────┐ │
│ │ Date│Asset│Type│Entry│Exit │Qty │P&L   │%    │ │
│ ├────────────────────────────────────────────────┤ │
│ │Mar 27│AAPL │LONG│150.2│152.1│10  │+$190 │+1.3%│ │
│ │Mar 26│EUR/ │LONG│1.084│1.089│100k│+$500 │+0.5%│ │
│ │Mar 25│BTC  │SHR │42.1k│41.9k│0.5 │+$100 │+0.2%│ │
│ │Mar 24│TSLA │LONG│250  │248  │5   │-$50  │-0.8%│ │
│ │Mar 23│AAPL │LONG│149  │150.5│10  │+$150 │+1.0%│ │
│ │  ...                                            │ │
│ └────────────────────────────────────────────────┘ │
│                              Page 1 of 8 >         │
│                                                     │
│ Mostrar: [10 ▼] registros por página               │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Tabla responsive con scroll horizontal en mobile
- Colores: Green para P&L positivo, Red para negativo
- Click en fila abre detalles
- Botones: Edit, Delete, Duplicate

---

#### Trade Detail / Edit Form
```
┌──────────────────────────────────────────────────┐
│ [<] New Trade                        [Save] [✕]  │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌─ Entry Information ──────────────────────────┐ │
│ │ Date: [Mar 27 ▼]        Time: [14:30 ▼]    │ │
│ │ Asset: [AAPL ▼]                             │ │
│ │ Strategy: [Scalping ▼]                      │ │
│ │ Direction: [LONG ●  SHORT ○]               │ │
│ │                                              │ │
│ │ Entry Price:   [______]    Quantity: [___] │ │
│ │ Stop Loss:     [______]    Take Profit: [__]│ │
│ │                                              │ │
│ │ [Calculated Risk: $50]  [Calculated Reward: $100] │
│ │ [R/R Ratio: 2:1] ✓ Excellent              │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌─ Exit Information (si cerrado) ──────────────┐ │
│ │ Date: [Mar 28 ▼]        Time: [16:45 ▼]    │ │
│ │ Exit Price: [______]     Exit Quantity: [__]│ │
│ │                                              │ │
│ │ [Calculated P&L: +$95]  [ROI: +1.3%]       │ │
│ │                                              │ │
│ │ Status: [CLOSED ▼]                          │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌─ Notes ──────────────────────────────────────┐ │
│ │ Entry based on 4H support level breakout   │ │
│ │                                              │ │
│ │ [________________________________________]  │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ [  Save as Draft  ]  [  Save & Close  ]  [Cancel] │
└──────────────────────────────────────────────────┘
```

**Features:**
- Form con validación real-time
- Calculadora de Risk/Reward visible
- Color feedback (green si R/R bueno, yellow si mediocre)
- Auto-fill de Exit si se selecciona trade CLOSED
- Guardado automático en draft

---

### 4. **Analytics & Reports**

#### Analytics Main View
```
┌──────────────────────────────────────────────────┐
│ Analytics                [Period: Month ▼]       │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌─ Performance Tabs ──────────────────────────┐ │
│ │ [Overall] [By Asset] [By Strategy]         │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ┌─ Win Rate Analysis ────────────────────────┐ │
│ │                                            │ │
│ │ Win Rate: 62%                             │ │
│ │ [████████████████░░░░] 62%                │ │
│ │ Winning: 15 trades                        │ │
│ │ Losing: 9 trades                          │ │
│ │                                            │ │
│ │ Consecutive Wins: 5 🔥                    │ │
│ │ Max Consecutive: 8 ⭐                    │ │
│ │                                            │ │
│ └────────────────────────────────────────────┘ │
│                                                  │
│ ┌─ P&L Distribution ────────────────────────┐ │
│ │                                            │ │
│ │ Avg Win:  +$125                           │ │
│ │ Avg Loss: -$85                            │ │
│ │ Profit Factor: 2.15x ✓                   │ │
│ │                                            │ │
│ │ ░░░░░░░░░░░░░░░░░░░ Distribution         │ │
│ │ Ganadores: [████████] +$1,875             │ │
│ │ Perdedores: [█████] -$765                │ │
│ │                                            │ │
│ └────────────────────────────────────────────┘ │
│                                                  │
│ ┌─ Risk Metrics ────────────────────────────┐ │
│ │ Max Drawdown: -12.5%                      │ │
│ │ Avg Risk per Trade: 2.1%                  │ │
│ │ Recovery Factor: 2.8x                     │ │
│ │ Sharpe Ratio: 1.45                        │ │
│ └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

#### Analytics by Asset
```
┌──────────────────────────────────────────────────┐
│ By Asset                        [Add Asset ▼]   │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ Asset    Trades  Win% P&L      ROI  Status  │ │
│ ├─────────────────────────────────────────────┤ │
│ │ AAPL      8      75% +$450   +4.5% 🟢 Hot  │ │
│ │ EUR/USD   7      57% +$225   +2.2% 🟡 OK  │ │
│ │ BTC       5      40% -$100   -1.0% 🔴 Cold│ │
│ │ TSLA      3      67% +$150   +1.5% 🟢 Hot  │ │
│ │ GLD       2      100%+$75    +0.8% 🟢 Hot  │ │
│ │                                              │ │
│ │ Click on asset para drill-down              │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### 5. **Drawdown Visualization**

```
┌──────────────────────────────────────────────────┐
│ Drawdown Analysis                               │
├──────────────────────────────────────────────────┤
│                                                  │
│ Equity vs Drawdown (Daily View)                 │
│                                                  │
│ Capital                                         │
│ $13,000 │     Peak ●                           │ │
│ $12,500 │   ╱      ╲                           │ │
│ $12,000 │  ╱        ╲  ╭─╮                     │ │
│ $11,500 │ ╱          ╰─╯  ╰──●← Current        │ │
│ $11,000 ├────────────────────────            │ │
│         │                                      │ │
│       0 │────────────────────────────────     │ │
│         │             Drawdown Region          │ │
│     -500│════════════════════════════════════ │ │
│         │ Máxima caída: -12.5% ($1,500)      │ │
│         │                                      │ │
│         └──────────────────────────────────   │ │
│           Mar 1  Mar 10  Mar 20  Mar 27      │ │
│                                                  │
│ Estadísticas:                                   │
│ Current DD: -8.5%    Max DD: -12.5%            │
│ Recovery Days: 8     Worst DD: Mar 15-22      │ │
└──────────────────────────────────────────────────┘
```

---

### 6. **Settings Page**

```
┌──────────────────────────────────────────────────┐
│ Settings                                        │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌─ Account ──────────────────────────────────┐  │
│ │ Name:     [John Trader ______]              │  │
│ │ Email:    [john@email.com _______]          │  │
│ │ Password: [Change Password ▶]               │  │
│ │                                              │  │
│ │ [Save Changes]                              │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ ┌─ Trading Preferences ──────────────────────┐  │
│ │ Base Currency: [USD ▼]                      │  │
│ │ Timezone: [UTC ▼]                           │  │
│ │ Risk per Trade: [2% ▼]                      │  │
│ │ Default Strategy: [None ▼]                  │  │
│ │                                              │  │
│ │ [Save]                                      │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ ┌─ Appearance ──────────────────────────────┐  │
│ │ Theme:  [Light ○ Dark ● Auto ○]            │  │
│ │ Charts: [Candlestick ▼]                     │  │
│ │                                              │  │
│ │ [Save]                                      │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ ┌─ Notifications ────────────────────────────┐ │
│ │ ☑ Email on major drawdown                  │  │
│ │ ☑ Daily summary report                     │  │
│ │ ☐ Winning streak alerts                    │  │
│ │ ☑ Bad streak warnings                      │  │
│ │                                              │  │
│ │ [Save]                                      │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ ┌─ Subscription ─────────────────────────────┐ │
│ │ Current Plan: Pro ($9.99/month)             │  │
│ │ Renews on: April 15, 2026                   │  │
│ │ [Manage Billing ▶] [Upgrade to Elite ▶]   │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ ┌─ Danger Zone ──────────────────────────────┐ │
│ │ [Delete Account]  (No se puede recuperar)   │  │
│ └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 🎨 Component Library

### Reusable Components

**MetricCard**
```jsx
<MetricCard
  title="Total P&L"
  value={2150}
  format="currency"
  change={15.3}
  compareTo="last month"
  icon="💰"
/>
```

**TradeChart (Equity Curve)**
```jsx
<TradeChart
  data={dailySnapshots}
  type="equity"
  period="monthly"
  showDrawdown={true}
/>
```

**FilterBar**
```jsx
<FilterBar
  filters={[
    { key: 'asset', label: 'Asset', type: 'select', options: assets },
    { key: 'status', label: 'Status', type: 'select', options: ['OPEN', 'CLOSED'] },
    { key: 'dateRange', label: 'Date', type: 'dateRange' }
  ]}
  onFilter={handleFilter}
/>
```

---

## 📱 Mobile Responsiveness

### Breakpoints
```
Mobile:     < 640px
Tablet:     640px - 1024px
Desktop:    > 1024px
```

### Mobile-specific Changes
- Sidebar → Bottom navigation
- Columns en tablas → Card-based layout
- Charts → Swipeable/scrollable
- KPI cards → Stacked verticalmente
- Modals con teclado en mente

---

## 🎯 User Flows

### Flow 1: Crear Trade
```
Login → Dashboard → [+ New Trade] → TradeForm
  ↓
User rellena Entry info (Asset, Price, Qty, etc)
  ↓
Sistema calcula Risk/Reward en tiempo real
  ↓
User confirma y guarda
  ↓
Mostrar confirmación + redirect a trade detail
  ↓
Después, User cierra trade desde DetalView
```

### Flow 2: Analizar Performance
```
Login → Dashboard → [Analytics]
  ↓
Ver métricas generales (Win Rate, P&L, etc)
  ↓
Click en [By Asset] → Ver desglose por activo
  ↓
Click en AAPL → Ver trades solo de AAPL
  ↓
Identificar que AAPL es mi mejor asset
  ↓
Decidir focalizarse más en AAPL trades
```

### Flow 3: Reportes Automáticos
```
Login → Settings → Notifications
  ↓
Enable "Daily Summary Report"
  ↓
Cada día a las 18:00 recibe email con:
  - P&L del día
  - Win Rate
  - Trades más importantes
  - Alertas (si hay drawdown alto, rachas malas)
```

---

## ✨ Interaction Details

### Animations
- **Page transitions:** Fade in/out (200ms)
- **Chart updates:** Smooth line animation (500ms)
- **Number changes:** Tween animation (400ms)
- **Notifications:** Slide in from top (300ms)

### Hover States
```
- Buttons: Brightness +10%
- Rows en tabla: Background highlight
- Cards: Subtle shadow increase
- Links: Underline appear
```

### Loading States
```
- Skeleton screens para componentes principales
- Spinning loader para operaciones que tardan
- Progress bar para reportes largos
```

### Empty States
```
"No trades yet 🚀"
"Create your first trade to see analytics"
[+ Create Trade]
```

---

## 📊 Data Visualization Guidelines

- **Colors:** Green = Win, Red = Loss, Blue = Neutral
- **Numbers:** Siempre con 2 decimales, excepto porcentajes
- **Time series:** Always with date labels
- **Charts responsive:** Ajustan a pantalla sin scrollear
- **Tooltip on hover:** Muestra datos exactos

---

**Documento actualizado:** 2026-03-27
