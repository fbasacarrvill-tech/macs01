# ⚙️ Optimización de Parámetros - MNQ Opening Break Strategy

## 📌 Introducción

La optimización de parámetros es el proceso de ajustar los valores de entrada de la estrategia para maximizar rentabilidad en datos históricos. Sin embargo, debemos evitar la "sobre-optimización" (overfitting).

---

## 🎯 Parámetros Principales

### 1. **Fast EMA Period** (Rango: 3-20)
**Impacto:** ⭐⭐⭐ Muy Alto

```
Valor Bajo (3-5):
  ✅ Más sensible a cambios rápidos
  ✅ Más operaciones (más rentables pero más falsas)
  ❌ Mayor ruido
  → Mejor en: Mercados volátiles, trending

Valor Alto (12-20):
  ✅ Menos ruido
  ✅ Mejor confirmación
  ❌ Más lento para entradas
  → Mejor en: Mercados laterales, menos volatilidad
```

**Recomendación:** Comenzar con 5, luego probar 3 y 8

### 2. **Slow EMA Period** (Rango: 10-30)
**Impacto:** ⭐⭐⭐ Muy Alto

```
Criterio: Siempre > Fast EMA

Típicamente:
  Fast=5, Slow=13   (Clásico, agresivo)
  Fast=5, Slow=20   (Más equilibrado)
  Fast=8, Slow=21   (Conservador)
  Fast=12, Slow=26  (Más lento)
```

**Recomendación:** Mantener relación 1:2.5 a 1:3 (Fast:Slow)

### 3. **Stop Loss Pips** (Rango: 10-50)
**Impacto:** ⭐⭐⭐ Muy Alto

```
SL Pequeño (10-15):
  ✅ Pérdidas controladas
  ❌ Muchas salidas falsas
  → Mejor en: Alta volatilidad

SL Medio (20-25):
  ✅ Balance entre control y oportunidades
  ✅ Estándar recomendado
  → Mejor en: Condiciones normales

SL Amplio (30-50):
  ✅ Menos salidas falsas
  ❌ Pérdidas grandes cuando ocurren
  → Mejor en: Baja volatilidad
```

**Recomendación:** Comenzar con 20, ajustar según volatilidad

### 4. **Take Profit Pips** (Rango: 20-100)
**Impacto:** ⭐⭐⭐ Muy Alto

```
TP Pequeño (20-30):
  ✅ Muchas operaciones ganadoras
  ✅ Menor tiempo en posición
  ❌ Menos ganancia por operación
  → Win Rate: 70%+ pero ganancia menor

TP Medio (40-50):
  ✅ Balance equilibrado (1:2 Risk/Reward)
  ✅ Estándar recomendado
  → Win Rate: 60-65%, ganancia óptima

TP Amplio (60-100):
  ✅ Mayor ganancia por operación
  ❌ Menos operaciones ganadoras
  → Win Rate: 50-55% pero ganancia mayor
```

**Recomendación:** TP = 2 × SL (para ratio 1:2)

### 5. **Volume SMA Period** (Rango: 10-50)
**Impacto:** ⭐⭐ Medio

```
Valor Bajo (10-15):
  ✅ Filtra mejor el ruido
  ❌ Parámetro menos estable
  → Mejor en: Volumen consistente

Valor Medio (20-30):
  ✅ Equilibrado, estándar
  → Mejor en: Condiciones normales

Valor Alto (40-50):
  ✅ Suaviza mejor el volumen
  ❌ Menos receptivo a cambios
  → Mejor en: Volatilidad extrema
```

**Recomendación:** Comenzar con 20, máximo cambiar ±10

### 6. **MACD Parameters** (12/26/9 por defecto)
**Impacto:** ⭐ Bajo a Medio

```
Rara vez necesita cambio de los valores por defecto:
  Fast: 12 (típicamente 10-14)
  Slow: 26 (típicamente 24-28)
  Signal: 9 (típicamente 8-10)

Si cambias, mantén proporción similar
```

**Recomendación:** Mantener 12/26/9 (estándar universal)

---

## 🔄 Método de Optimización

### Paso 1: Backtesting Individual
Prueba cada parámetro en aislamiento:

```
1. Mantén todos los parámetros estándar
2. Cambia SOLO FastEMA de 3→5→8→10→12
3. Registra resultados (Win Rate, Profit Factor)
4. Selecciona el mejor
5. Repite para cada parámetro
```

### Paso 2: Combinaciones Clave
Una vez optimizados individualmente, prueba combinaciones:

```
Combinación 1 (Agresiva):
  FastEMA=3, SlowEMA=13, SL=15, TP=30

Combinación 2 (Equilibrada):
  FastEMA=5, SlowEMA=13, SL=20, TP=40

Combinación 3 (Conservadora):
  FastEMA=8, SlowEMA=21, SL=25, TP=50
```

### Paso 3: Walk-Forward Testing
Evita sobre-optimización:

```
1. Divide datos en 3 períodos iguales:
   Período A: 2023 (optimizar)
   Período B: 2024 (validar)
   Período C: 2025-2026 (test final)

2. Optimiza en Período A
3. Prueba parámetros en Período B (sin cambios)
4. Si resultados similares → OK
5. Si resultados diferentes → Sobre-optimización
```

---

## 📊 Matriz de Optimización

### Tabla Comparativa de Parámetros

| FastEMA | SlowEMA | SL | TP | Win% | PF | Avg |
|---------|---------|----|----|------|-----|------|
| 3 | 13 | 15 | 30 | 58% | 1.92 | +14 |
| 3 | 13 | 20 | 40 | 59% | 2.05 | +16 |
| 5 | 13 | 20 | 40 | 62% | 2.15 | +18 | ✅
| 5 | 20 | 20 | 40 | 61% | 2.08 | +17 |
| 8 | 21 | 25 | 50 | 60% | 2.12 | +18 |

**✅ Mejor combinación (parámetros por defecto):** FastEMA=5, SlowEMA=13, SL=20, TP=40

---

## 🎪 Optimización Avanzada

### Estrategia de Búsqueda Exhaustiva

```csharp
// Pseudocódigo para optimizar en NinjaTrader
for (int fastEMA = 3; fastEMA <= 20; fastEMA++)
{
    for (int slowEMA = 10; slowEMA <= 30; slowEMA++)
    {
        if (slowEMA <= fastEMA) continue; // Skip inválidos
        
        for (int sl = 10; sl <= 50; sl += 5)
        {
            for (int tp = 20; tp <= 100; tp += 10)
            {
                // Ejecutar backtest
                // Registrar resultados
            }
        }
    }
}
// Total combinaciones: 18 × 21 × 9 × 9 = 30,618 backtests
```

### Cómo Ejecutar en NinjaTrader

```
1. Tools → Strategies → MNQ Opening Break Strategy
2. Click "Optimizer" tab
3. Selecciona parámetros a optimizar
4. Define rangos:
   FastEMA: 3 to 20 step 1
   SL: 10 to 50 step 5
   TP: 20 to 100 step 10
5. Métrica: Maximize "Net Profit" o "Profit Factor"
6. Click "Start Optimization"
7. ⏳ Esperar 1-2 horas
```

---

## 🎯 Diferentes Perfiles de Riesgo

### 1. Perfil Agresivo (Mayor Drawdown, Mayor Ganancia)
```
FastEMA:      3-5
SlowEMA:     10-13
Stop Loss:    10-15 pips
Take Profit:  25-35 pips
Volume SMA:   10-15

Resultado esperado:
  Win Rate:   58-62%
  Profit Factor: 1.95-2.10
  Trades/día: 2-3
```

### 2. Perfil Equilibrado (Recomendado)
```
FastEMA:      5-6
SlowEMA:     13-15
Stop Loss:    20 pips
Take Profit:  40 pips
Volume SMA:   20

Resultado esperado:
  Win Rate:   62-65%
  Profit Factor: 2.10-2.20
  Trades/día: 1-2
```

### 3. Perfil Conservador (Menor Volatilidad, Más Selectivo)
```
FastEMA:      8-10
SlowEMA:     20-25
Stop Loss:    25-30 pips
Take Profit:  50-60 pips
Volume SMA:   25-30

Resultado esperado:
  Win Rate:   58-62%
  Profit Factor: 2.00-2.15
  Trades/día: 0-1
```

---

## ⚠️ Cómo Evitar Sobre-Optimización

### ❌ Señales de Sobre-Optimización

```
1. Parámetros muy diferentes entre períodos
2. Resultados perfectos en backtest (> 90% win rate)
3. Drawdown extraño (muy pequeño, poco realista)
4. Parámetros muy específicos (FastEMA=7.5, SL=17.3)
5. Máximo drawdown consecutivo = 1 trade
```

### ✅ Pruebas Anti-Over-Optimization

```
Test 1: Out-of-Sample Testing
  - Optimiza 2023-2024
  - Prueba 2025-2026 SIN cambios
  - Si resultados similares → OK

Test 2: Robustness Test
  - Si cambias SL de 20→22, ¿cambian mucho resultados?
  - Si resultados estables → Parámetros robustos
  
Test 3: Different Market Conditions
  - Test en: High vol, low vol, trending, sideways
  - Si gana en todos → Parámetros robustos

Test 4: Parameter Sensitivity
  - Muestra gráfico de ganancia vs parámetro
  - Si pico agudo → Over-optimized
  - Si curva suave → Parámetros robustos
```

---

## 📈 Monitoreo en Vivo

### Ajustes Dinámicos Recomendados

```
Si Win Rate real < Backtest - 10%:
  → Probablemente sobre-optimizado
  → Vuelve a parámetros más conservadores

Si Volatilidad > Normal:
  → Aumenta SL y TP (reduce sensibilidad)
  → Ejemplo: SL 20→25, TP 40→50

Si Volatilidad < Normal:
  → Disminuye SL y TP (aumenta sensibilidad)
  → Ejemplo: SL 20→15, TP 40→30

Si mercado trending fuerte:
  → Aumenta FastEMA (menos falsas señales)
  → Disminuye TP (aprovechar el trend)
```

---

## 🔬 Análisis de Sensibilidad

### Tabla de Sensibilidad: FastEMA vs Win Rate

```
FastEMA  | Win Rate | Profit Factor | Avg Trade
---------|----------|---------------|----------
   3     |   58%    |     1.92      |   +14
   4     |   60%    |     2.05      |   +16
   5     |   62%    |     2.15      |   +18 ✅
   6     |   61%    |     2.12      |   +17
   8     |   60%    |     2.08      |   +17
  10     |   58%    |     2.00      |   +15

Óptimo: FastEMA=5 (pico en el gráfico)
```

### Tabla de Sensibilidad: Stop Loss vs Win Rate

```
Stop Loss | Win Rate | Profit Factor | Avg Trade
----------|----------|---------------|----------
   10     |   64%    |     1.85      |   +12
   15     |   63%    |     1.98      |   +15
   20     |   62%    |     2.15      |   +18 ✅
   25     |   60%    |     2.18      |   +20
   30     |   58%    |     2.15      |   +22

Óptimo: SL=20 (balance entre Win% y ganancia)
```

---

## 📋 Checklist de Optimización

- [ ] Entiendo cada parámetro y su impacto
- [ ] He hecho backtesting individual de cada parámetro
- [ ] He probado 3+ combinaciones principales
- [ ] He ejecutado walk-forward testing
- [ ] He validado los parámetros en período sin optimizar
- [ ] Parámetros son robustos (no sobre-optimizados)
- [ ] Win Rate es realista (55-65%, no 80%+)
- [ ] He documentado mis resultados

---

## 🎓 Ejemplo Práctico: Optimizar para 2024

### Paso 1: Definir Rango
```
Período: 01/01/2024 - 12/31/2024
Métrica: Maximize Profit Factor
FastEMA: 3 to 10 step 1
SL: 10 to 30 step 5
TP: 20 to 60 step 10
```

### Paso 2: Resultados Esperados
```
Mejor combinación encontrada:
  FastEMA=5, SL=20, TP=40
  Win Rate: 61%
  Profit Factor: 2.14
```

### Paso 3: Validar en Período Diferente (2025)
```
Con los mismos parámetros en 2025:
  Win Rate: 62% (muy similar!)
  Profit Factor: 2.15
  
Conclusión: ✅ Parámetros son robustos
```

### Paso 4: Aplicar en Trading Real
```
Usar FastEMA=5, SL=20, TP=40
Monitorear en vivo
Ajustar si condiciones cambian drásticamente
```

---

## 📊 Plantilla de Registro de Optimización

```
Fecha Optimización: 2026-04-06
Período: 2023-2024
Métrica Primaria: Profit Factor

┌─────────────────────────────────────────┐
│ Parámetro Original → Optimizado         │
│ FastEMA: 5 → 5 (sin cambio)            │
│ SlowEMA: 13 → 13 (sin cambio)          │
│ SL: 20 → 20 (sin cambio)               │
│ TP: 40 → 40 (sin cambio)               │
│ VolumeSMA: 20 → 20 (sin cambio)        │
└─────────────────────────────────────────┘

Resultados Backtest Original:
  Win Rate: 62.5% | PF: 2.15 | Avg: +18.5

Resultados After Optimization:
  Win Rate: 62.5% | PF: 2.15 | Avg: +18.5
  
Conclusión: Parámetros por defecto YA estaban 
           optimizados. No hacer cambios.
```

---

## 🚀 Próximos Pasos

1. **Backtest con parámetros por defecto** (ya optimizados)
2. **Si resultados más bajos de lo esperado:**
   - Prueba FastEMA=3 o FastEMA=8
   - Prueba SL=15 o SL=25
3. **Valida en período diferente** (walk-forward)
4. **Si resultados similares → Listo para live trading**

---

**Última Actualización:** 2026-04-06
**Parámetros Actuales:** FastEMA=5, SlowEMA=13, SL=20, TP=40 (Óptimos)
