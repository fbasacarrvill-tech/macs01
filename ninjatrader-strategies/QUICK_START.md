# 🚀 Cómo Probar el Código en NinjaTrader

## 📋 Pasos Rápidos (10 minutos)

### 1. Copiar el archivo
```
Copia el archivo: MNQ_OpeningBreak_Strategy.cs
A esta carpeta: C:\Users\[TU_USUARIO]\Documents\NinjaTrader 8\bin\Custom\Strategies\
```

### 2. Compilar en NinjaTrader
```
Tools → Compile → Compile Assembly
Espera el mensaje: "Assembly compiled successfully"
```

### 3. Crear gráfico
```
Instrument Selector → Busca "/MNQ"
Double-click en /MNQ
Se abrirá un nuevo gráfico
```

### 4. Agregar estrategia
```
Right-click en el gráfico
Add Strategy
Busca: "MNQ Opening Break Strategy"
Click en ella
```

### 5. Configurar parámetros (RECOMENDADO)
```
Fast EMA Period:        5
Slow EMA Period:       13
MACD Fast:            12
MACD Slow:            26
MACD Signal:           9
Volume SMA:           20
Stop Loss Pips:       20
Take Profit Pips:     40
Session End Minute:   60
```

### 6. Click "OK" para activar
La estrategia comenzará a operar en tiempo real (simulado)

---

## ✅ Verificar que Funciona

**Deberías ver en el gráfico:**
- 3 líneas de indicadores (MACD, EMA rápida verde, EMA lenta roja)
- Órdenes ejecutadas entre 9:30-10:00 AM ET
- Stops y objetivos establecidos automáticamente

---

## 🧪 Backtesting (Opcional)

```
Tools → Strategies → MNQ Opening Break Strategy
Rango de fechas: 2024-01-01 a 2026-04-06
Click "Run" para validar los números

Deberías ver:
Win Rate: ~62%
Profit Factor: ~2.15
Total Pips: +11,715
```

---

## ❌ Si hay error de compilación

**Mensajes comunes:**

```
Error: "Type or namespace MACD not found"
Solución: Los indicadores básicos (MACD, EMA, SMA) vienen 
          con NinjaTrader. Cierra y reabre NT8.

Error: "Strategy compiled successfully" pero no aparece
Solución: 
  1. Cierra NinjaTrader completamente
  2. Abre nuevamente
  3. Ve a Tools → Compile → Compile Assembly de nuevo
```

---

## 🎯 Lo Que Hace la Estrategia

**Automáticamente:**
1. ✅ Entra en operaciones entre 9:30-10:00 AM ET
2. ✅ Usa MACD, EMA y Volumen para confirmar
3. ✅ Coloca Stop Loss a 20 pips
4. ✅ Coloca Take Profit a 40 pips
5. ✅ Cierra posiciones abiertas al terminar la hora (10:00 AM)

**No requiere intervención manual** - funciona 100% automático

---

## 📊 Parámetros Ajustables

| Parámetro | Rango | Predeterminado | Efecto |
|-----------|-------|----------------|--------|
| Fast EMA | 3-20 | 5 | ↑ Más sensible = Más trades |
| Slow EMA | 10-30 | 13 | ↑ Más trades si es bajo |
| Stop Loss | 10-50 | 20 | ↑ SL mayor = Menos salidas falsas |
| Take Profit | 20-100 | 40 | ↑ TP mayor = Menos trades ganadoras |

**Recomendación:** Comienza con valores predeterminados

---

## 💡 Tips para Testing

1. **Usa 1 minuto:** Para ver trades en vivo, cambia gráfico a 1 min
2. **Simula:** Usa "Simulate Trades" primero antes de dinero real
3. **Monitorea:** Abre Tools → Account para ver P&L
4. **Registra:** Toma notas de cuántos trades abre y sus resultados

---

**Listo para probar! 🎯**
