# ⏰ Configuración de Horarios - Estrategia MNQ

Ahora puedes elegir **cualquier hora de entrada y duración** para la estrategia.

---

## 📝 Nuevos Parámetros

Cuando agregues la estrategia al gráfico, verás estos nuevos parámetros bajo "Session Time":

```
Session Start Hour:           [_] (0-23)
Session Start Minute:         [_] (0-59)
Session Duration Minutes:     [_] (1-480)
```

---

## 🎯 Ejemplos de Configuración

### Ejemplo 1: 9:30 AM - 10:30 AM ET (1 hora)
```
Session Start Hour:       9
Session Start Minute:     30
Session Duration Minutes: 60
```

### Ejemplo 2: 10:00 AM - 11:00 AM ET (1 hora)
```
Session Start Hour:       10
Session Start Minute:     0
Session Duration Minutes: 60
```

### Ejemplo 3: 2:30 PM - 3:30 PM ET (1 hora)
```
Session Start Hour:       14
Session Start Minute:     30
Session Duration Minutes: 60
```

### Ejemplo 4: 9:30 AM - 12:00 PM ET (2.5 horas)
```
Session Start Hour:       9
Session Start Minute:     30
Session Duration Minutes: 150
```

### Ejemplo 5: 1:00 PM - 2:00 PM ET (1 hora)
```
Session Start Hour:       13
Session Start Minute:     0
Session Duration Minutes: 60
```

---

## 🕐 Conversión de Zonas Horarias

Si usas otra zona horaria, convierte a ET (Eastern Time):

```
Zona Horaria         | Conversión a ET
--------------------|------------------
ET (Eastern)         | Igual (9:30 = 9)
CT (Central)         | Resta 1 hora
MT (Mountain)        | Resta 2 horas
PT (Pacific)         | Resta 3 horas
GMT/UTC              | Suma 5 horas
```

**Ejemplo:** Si quieres operar a las 8:30 AM PT:
- 8:30 AM PT = 11:30 AM ET
- Configurar: Hour=11, Minute=30

---

## 📊 Horarios Recomendados por Activo

### Para MNQ (Nasdaq):
```
✅ 9:30 AM - 10:00 AM (Opening break)
✅ 10:00 AM - 11:00 AM (Continuación)
✅ 2:00 PM - 3:00 PM (Afternoon move)
```

### Para ES (S&P 500):
```
✅ 9:30 AM - 10:30 AM (Opening)
✅ 3:00 PM - 4:00 PM (Cierre)
```

---

## 🔧 Cómo Cambiar los Parámetros

### Cuando Creas el Gráfico:

1. **Agrega la estrategia al gráfico**
   ```
   Right-click → Add Strategy → MNQ Opening Break Strategy
   ```

2. **Se abrirá una ventana con parámetros**
   ```
   Fast EMA:              5
   Slow EMA:             13
   Stop Loss Pips:       20
   Take Profit Pips:     40
   
   Session Start Hour:    9      ← CAMBIA AQUÍ
   Session Start Minute: 30      ← CAMBIA AQUÍ
   Session Duration Min: 60      ← CAMBIA AQUÍ
   ```

3. **Ingresa los valores que quieras**
   ```
   Ej: Hour=10, Minute=0, Duration=120
   (Opera de 10:00 AM a 12:00 PM)
   ```

4. **Click OK**

---

## 📈 Durante el Backtest

Puedes cambiar los parámetros en tiempo real durante el backtest:

1. Ve a **Strategy Properties** (si la estrategia está activa)
2. Modifica los valores de hora
3. Los cambios se aplican inmediatamente

---

## 🎯 Casos de Uso

### Trading Matutino (Early Bird)
```
Session Start Hour:       9
Session Start Minute:     30
Session Duration Minutes: 30
(Solo los primeros 30 minutos de apertura)
```

### Trading Tarde (Afternoon)
```
Session Start Hour:       14
Session Start Minute:     0
Session Duration Minutes: 120
(2-4 PM, antes del cierre)
```

### Trading Europeo (Afternoon en ET)
```
Session Start Hour:       13
Session Start Minute:     30
Session Duration Minutes: 90
(1:30 PM - 3:00 PM ET)
```

### Trading Todo el Día
```
Session Start Hour:       9
Session Start Minute:     30
Session Duration Minutes: 360
(9:30 AM - 3:30 PM, todo el día)
```

---

## ⚠️ Notas Importantes

1. **Horario está en ET (Eastern Time)**
   - Que es la zona horaria del mercado US
   - Ajusta si uses otra zona horaria

2. **Duración máxima: 480 minutos (8 horas)**
   - Si necesitas más, configura dos instancias

3. **Hour usa formato 24 horas:**
   ```
   9 AM = 9
   12 PM = 12
   1 PM = 13
   2 PM = 14
   3 PM = 15
   4 PM = 16
   ```

4. **La estrategia solo opera en estos horarios**
   - Fuera del horario configurado, cierra automáticamente todas las posiciones

---

## 🧪 Probando Diferentes Horarios

Recomendación: Haz backtest con varios horarios para encontrar el mejor:

```
Horario 1: 9:30 - 10:00 (Opening break) → Ver resultados
Horario 2: 10:00 - 11:00 (Follow-through) → Ver resultados
Horario 3: 2:00 - 3:00 (Afternoon) → Ver resultados
```

Compara los resultados y elige el horario con mejor:
- Win Rate
- Profit Factor
- Consistencia

---

## 📝 Ejemplo Completo de Configuración

**Objetivo:** Operar de 10:00 AM a 11:00 AM ET (1 hora)

**Parámetros a ingresar:**
```
Session Start Hour:       10
Session Start Minute:     0
Session Duration Minutes: 60
```

**Qué pasará:**
```
✅ 10:00 AM: Comienza a operar
✅ 10:01 - 10:59 AM: Genera trades
✅ 11:00 AM: Cierra todas las posiciones abiertas
❌ 11:01 AM en adelante: No opera
```

---

**¡Ahora puedes usar cualquier horario que desees! 🚀**
