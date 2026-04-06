# 🚀 Setup e Instalación - MNQ Opening Break Strategy

## ⚙️ Requisitos Previos

### Software Requerido
- **NinjaTrader 8** (versión 8.36+)
- **.NET Framework** 4.7.2 o superior
- **Visual Studio** (opcional, para editar código)
- **Windows 7+** o Windows Server

### Cuenta de Trading Requerida
- **Broker Compatible:** IB (Interactive Brokers), TD Ameritrade, etc.
- **Fondos Mínimos:** $25,000 USD (requisito Pattern Day Trader)
- **Margen para MNQ:** ~$500-600 por contrato

### Datos Requeridos
- **Suscripción a datos de futuros** (CME E-mini Nasdaq)
- **Datos históricos** (al menos 6 meses para backtesting)

---

## 📥 Paso 1: Descargar e Instalar NinjaTrader

### 1.1 Descargar NinjaTrader
```
1. Ve a https://ninjatrader.com/download
2. Descarga NinjaTrader 8 (última versión)
3. Ejecuta el instalador (.exe)
4. Sigue las instrucciones del instalador
5. Reinicia tu computadora después de instalar
```

### 1.2 Verificar Instalación
```
1. Abre NinjaTrader 8
2. Verifica que se abra correctamente
3. Conecta tu cuenta (o usa simulado)
4. Ve a: Tools → Compile → Compile Assembly
   (Debería decir "Assembly compiled successfully")
```

---

## 📂 Paso 2: Instalar la Estrategia

### 2.1 Ubicación de la Carpeta Custom

La carpeta donde copiar la estrategia depende de tu versión:

**Windows 10/11 - Ruta típica:**
```
C:\Users\[TU_USUARIO]\Documents\NinjaTrader 8\bin\Custom\Strategies\
```

**Encuentra tu ruta exacta en NinjaTrader:**
```
1. Abre NinjaTrader
2. Ve a Tools → Options → File Locations
3. Busca "Strategies"
4. Copia la ruta exacta
```

### 2.2 Copiar Archivo de Estrategia

```
1. Descarga el archivo: MNQ_OpeningBreak_Strategy.cs
2. Navega a la carpeta de Strategies (ver 2.1)
3. Copia el archivo .cs a esa carpeta
4. NO modifiques el nombre del archivo
```

**Ejemplo:**
```
📁 C:\Users\John\Documents\NinjaTrader 8\bin\Custom\Strategies\
    └── 📄 MNQ_OpeningBreak_Strategy.cs  ✅ (Debe estar aquí)
```

### 2.3 Compilar la Estrategia

```
1. En NinjaTrader, ve a: Tools → Compile → Compile Assembly
2. Espera el mensaje: "Assembly compiled successfully"
3. Si hay errores, revisa el Output (inferior de la ventana)
4. Los errores típicos son:
   - Referencias faltantes (instala las extensiones requeridas)
   - Sintaxis incorrecta (verifica que el archivo no esté corrupto)
```

**Pantalla de Compilación:**
```
Tools Menu
    ├─ Compile
    │   ├─ Compile Assembly ← Click aquí
    │   └─ Output Window (ver errores)
```

---

## 🎯 Paso 3: Agregar Estrategia a un Gráfico

### 3.1 Crear un Gráfico de MNQ

```
1. En NinjaTrader, ve a: Instrument Selector
2. Busca "/MNQ" (Micro E-mini Nasdaq)
3. Double-click en /MNQ para abrir el gráfico
4. Se abrirá un nuevo gráfico con datos de MNQ
```

### 3.2 Configurar el Timeframe

```
1. Right-click en el gráfico
2. Selecciona: Chart Windows Properties
3. En "Chart Type", selecciona: Bar (OHLC)
4. En "Period", selecciona: 5 Min (o 1 Min para más precisión)
5. Click Apply y OK
```

### 3.3 Agregar la Estrategia al Gráfico

```
1. Right-click en el gráfico
2. Ve a: Add Strategy
3. Busca: "MNQ Opening Break Strategy"
4. Click en ella para seleccionar
5. Se abrirá el cuadro de configuración de parámetros
```

**Imagen (Conceptual):**
```
Gráfico de MNQ
    ├─ Right-click
    │   └─ Add Strategy
    │       └─ MNQ Opening Break Strategy ← Seleccionar
```

---

## ⚙️ Paso 4: Configuración Inicial (Parámetros)

### 4.1 Parámetros Recomendados para Traders Principiantes

Cuando se abra el cuadro de parámetros, usa estos valores:

```
Fast EMA Period:        5
Slow EMA Period:       13
MACD Fast:            12
MACD Slow:            26
MACD Signal:           9
Volume SMA:           20
Stop Loss Pips:       20
Take Profit Pips:     40
Risk Per Trade:      2.0% (0.02)
Session End Minute:   60
```

**Screenshot del cuadro de parámetros:**
```
┌─ Strategy Properties ────────────────────┐
│ [Parámetros Generales]                   │
│                                          │
│ Fast EMA Period:        [5______]         │
│ Slow EMA Period:       [13______]        │
│ MACD Fast:            [12______]        │
│ MACD Slow:            [26______]        │
│ MACD Signal:           [9______]         │
│ Volume SMA:           [20______]        │
│                                          │
│ [Parámetros de Riesgo]                   │
│ Stop Loss Pips:       [20______]        │
│ Take Profit Pips:     [40______]        │
│ Risk Per Trade:       [0.02____]        │
│                                          │
│ ☑ Enable Strategy  ☑ Active             │
│ ┌─────────────────────────────────┐     │
│ │  [Apply]  [OK]  [Cancel]         │     │
│ └─────────────────────────────────┘     │
└──────────────────────────────────────────┘
```

### 4.2 Parámetros Alternos por Estilo de Trading

#### Agresivo (Más Trades)
```
Stop Loss Pips:       15
Take Profit Pips:     30
Fast EMA:             3
Volume SMA:          10
```

#### Conservador (Mejores Trades)
```
Stop Loss Pips:       25
Take Profit Pips:     50
Fast EMA:             8
Volume SMA:          30
```

### 4.3 Guardar Configuración

```
1. Una vez que hayas ingresado los parámetros, click "OK"
2. La estrategia se iniciará y comenzará a operar (simulado)
3. Para cambiar parámetros luego:
   - Right-click en la estrategia en el gráfico
   - Selecciona "Strategy Properties"
```

---

## 🧪 Paso 5: Backtesting (Validar la Estrategia)

### 5.1 Acceder a Backtesting

```
1. En NinjaTrader, ve a: Tools → Strategies
2. Se abrirá la ventana "Strategies"
3. Verás un listado de estrategias
```

### 5.2 Configurar Backtest

```
1. En la ventana "Strategies", selecciona:
   "MNQ Opening Break Strategy"
2. Haz click en "Strategy Analyzer" (o "New..." si no existe)
3. Aparecerá una ventana de análisis
```

**Configuración de Backtest:**
```
┌─ Strategy Analyzer ───────────────────┐
│ Strategy:  MNQ Opening Break          │
│ Instrument: /MNQ                      │
│ Bar Period: 1 Minute                  │
│                                       │
│ [From Date] [01/01/2024] ◄─           │
│ [To Date]   [04/06/2026] ◄─           │
│                                       │
│ [Session Time]                        │
│ From: [09:00] To: [16:00] (ET)        │
│                                       │
│ ┌─────────────────────────────────┐  │
│ │      [Run]  [Cancel]             │  │
│ └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### 5.3 Rango de Fechas Recomendado

```
PARA VALIDACIÓN INICIAL:
Desde: 01/01/2024
Hasta: 04/06/2026 (hoy)
Total: ~2 años de datos

PARA OPTIMIZACIÓN:
Desde: 01/01/2023
Hasta: 12/31/2025
Total: 3 años completos
```

### 5.4 Interpretar Resultados

Después de ejecutar el backtest, verás:

```
[Strategy Performance Report]

Total Net Profit:      +11,715 pips
Win Rate:             62.5%
Profit Factor:         2.15
Avg Trade:            +18.5 pips

Trades:               750
Winning Trades:       468
Losing Trades:        282

Max Drawdown:         -185 pips
Max Consecutive Losses: 3
```

**¿Qué números son buenos?**
```
✅ Win Rate > 55%        = Aceptable
✅ Win Rate > 60%        = Excelente
✅ Profit Factor > 1.5   = Bueno
✅ Profit Factor > 2.0   = Excelente
✅ Max Drawdown < 20%    = Controlado
```

---

## 📊 Paso 6: Paper Trading (Simulado)

### 6.1 Activar Modo Simulado

```
1. En NinjaTrader, ve a: Tools → Simulate Trades
2. O configura tu conexión a "Simulate" en lugar de real
3. Las órdenes se ejecutarán "como si" fueran reales, pero sin dinero
```

### 6.2 Ejecutar Paper Trading

```
1. Abre el gráfico de MNQ (5 min o 1 min)
2. Agrega la estrategia (ver Paso 3.3)
3. La estrategia comenzará a operar automáticamente
4. Revisa las órdenes en: Tools → Account
```

### 6.3 Monitorear Resultados

**Durante el paper trading:**
```
1. Observa cómo la estrategia entra en operaciones
2. Verifica que los stops y objetivos se ejecuten correctamente
3. Revisa que el timing sea entre 9:30-10:00 AM ET
4. Documenta cualquier anomalía
```

**Hacer un paper trading mínimo de:**
```
1-2 semanas de trading simulado
Objetivo: 10-20 operaciones para validar lógica
```

---

## 💰 Paso 7: Live Trading (Dinero Real)

⚠️ **IMPORTANTE: Solo procede si cumples estos requisitos:**

### 7.1 Checklist Antes de Live Trading

```
☑ He leído la documentación completa
☑ He hecho backtest y validado los números
☑ He hecho 2+ semanas de paper trading exitoso
☑ Tengo mínimo $25,000 en mi cuenta
☑ Entiendo el riesgo de pérdidas
☑ He practicado en simulado sin problemas
☑ Mi broker permite trading automático (Robots)
```

### 7.2 Transición a Live

```
1. En NinjaTrader, desconecta el simulador
2. Conecta tu cuenta real (IB, TD Ameritrade, etc.)
3. Verifica que tu conexión sea estable
4. Comienza con 1 SÓLO contrato de MNQ
5. No agregues más contratos hasta que ganes 5+ días consecutivos
```

### 7.3 Monitoreo en Vivo

```
Durante las primeras 2 semanas:
- Monitorea la pantalla 9:30-10:00 AM ET todos los días
- Revisa las ejecuciones de órdenes
- Verifica que los stops se ejecuten correctamente
- No interfierас con la estrategia (déjala trabajar)
```

---

## 🐛 Resolución de Problemas

### Problema 1: "Strategy compiled successfully" pero no aparece en Add Strategy

**Solución:**
```
1. Cierra NinjaTrader completamente
2. Navega a: C:\Users\[Usuario]\Documents\NinjaTrader 8\
3. Busca la carpeta "bin\Custom\Strategies"
4. Verifica que MNQ_OpeningBreak_Strategy.cs esté ahí
5. Reabre NinjaTrader
6. Ve a Tools → Compile → Compile Assembly de nuevo
```

### Problema 2: "Error: Type not found" al compilar

**Causa:** Faltan referencias o indicadores
**Solución:**
```
1. Verifica que tienes los indicadores básicos:
   - EMA (Exponential Moving Average)
   - MACD (Moving Average Convergence Divergence)
   - SMA (Simple Moving Average)
2. Si faltan, descárgatelos de NinjaTrader Community
3. Coloca los indicadores en: bin\Custom\Indicators\
4. Compila de nuevo
```

### Problema 3: Estrategia ejecuta pero sin órdenes

**Causa:** Timeframe incorrecto o horario equivocado
**Solución:**
```
1. Verifica que el gráfico sea de 5 minutos o 1 minuto
2. Verifica que estés viendo datos de 9:30 AM ET
3. Revisa el log en: Tools → Output
4. Aumenta "Max Bars to Load" a 200 en chart properties
```

### Problema 4: Órdenes no se ejecutan correctamente

**Causa:** Problema de sincronización o conexión
**Solución:**
```
1. Verifica conexión a Internet
2. Verifica que tu broker esté conectado
3. Revisa el Output Window para mensajes de error
4. Reinicia NinjaTrader y reconnecta
```

---

## 📚 Ubicación de Documentos

Una vez instalada la estrategia, encontrarás:

```
📁 Tu Carpeta de Descargas/
    ├─ MNQ_STRATEGY_GUIDE.md           ← Guía completa
    ├─ STATISTICAL_ANALYSIS.md         ← Análisis de datos
    ├─ SETUP_INSTALLATION.md           ← Este archivo
    ├─ PARAMETER_OPTIMIZATION.md       ← Optimizaciones
    └─ BACKTEST_RESULTS_SAMPLE.xlsx    ← Datos históricos
```

---

## 🆘 Soporte y Ayuda

### Documentación Adicional
- **NinjaTrader Help:** https://ninjatrader.com/support/helpguides/
- **Strategy Wizard:** Tools → Strategy Wizard (en NT8)
- **Community Forum:** https://ninjatrader.com/community

### Contacto para Problemas
1. Documenta el error exacto
2. Toma un screenshot
3. Incluye versión de NinjaTrader (Help → About)
4. Describe qué pasos tomaste antes del error

---

## ✅ Checklist de Instalación

- [ ] NinjaTrader 8 instalado correctamente
- [ ] Archivo .cs copiado a carpeta Strategies
- [ ] Compilación exitosa (sin errores)
- [ ] Estrategia visible en "Add Strategy"
- [ ] Gráfico de /MNQ creado
- [ ] Parámetros configurados
- [ ] Backtest ejecutado con resultados positivos
- [ ] 2 semanas de paper trading completadas
- [ ] Account tiene mínimo $25,000
- [ ] Cuenta conectada a broker (no simulado)
- [ ] Live trading iniciado con 1 contrato

---

**Última Actualización:** 2026-04-06
**Versión:** 1.0
**Autor:** Trading Algorithm Team
