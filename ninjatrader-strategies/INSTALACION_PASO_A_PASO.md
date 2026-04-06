# 📖 Instalación Paso a Paso en NinjaTrader 8

## 🎯 Objetivo Final
Tener la estrategia MNQ operando automáticamente en tu gráfico de NinjaTrader.

---

## ✅ PASO 1: Descargar el Archivo de Código

### 1.1 Localizar el archivo
```
Archivo: MNQ_OpeningBreak_Strategy.cs
Ubicación: /home/user/macs01/ninjatrader-strategies/strategies/
```

### 1.2 Copiar el archivo
- Copia el archivo `MNQ_OpeningBreak_Strategy.cs`
- Guárdalo en tu computadora (Desktop, Documentos, etc.)

---

## 📂 PASO 2: Encontrar la Carpeta Custom de NinjaTrader

### 2.1 Ruta en Windows
```
C:\Users\[TU_NOMBRE_DE_USUARIO]\Documents\NinjaTrader 8\bin\Custom\Strategies\
```

**Ejemplo:**
```
C:\Users\John\Documents\NinjaTrader 8\bin\Custom\Strategies\
C:\Users\Maria\Documents\NinjaTrader 8\bin\Custom\Strategies\
```

### 2.2 Encontrar tu usuario en Windows
- Click en Inicio (Windows logo)
- Busca "Documentos"
- Abre la carpeta "Documentos"
- Verás carpeta "NinjaTrader 8"

### 2.3 Navegar hasta la carpeta Strategies
```
Documentos 
    → NinjaTrader 8 
        → bin 
            → Custom 
                → Strategies ← AQUÍ VAS A PONER EL ARCHIVO
```

---

## 📥 PASO 3: Copiar el Archivo a NinjaTrader

### 3.1 Método Rápido (Copiar y Pegar)
```
1. Tienes el archivo: MNQ_OpeningBreak_Strategy.cs (en tu Desktop o Descargas)
2. Click derecho en el archivo → Copiar
3. Navega a: C:\Users\[Tu Usuario]\Documents\NinjaTrader 8\bin\Custom\Strategies\
4. Click derecho en la carpeta vacía → Pegar
5. El archivo aparecerá en esa carpeta
```

### 3.2 Verificar que el archivo está en el lugar correcto
```
✅ Deberías ver:
C:\Users\[Tu Usuario]\Documents\NinjaTrader 8\bin\Custom\Strategies\MNQ_OpeningBreak_Strategy.cs
```

**Imagen (conceptual):**
```
📁 C:\Users\John\Documents\NinjaTrader 8\bin\Custom\Strategies\
    └── 📄 MNQ_OpeningBreak_Strategy.cs ✅ (DEBE ESTAR AQUÍ)
```

---

## 🔧 PASO 4: Compilar el Código en NinjaTrader

### 4.1 Abrir NinjaTrader
```
1. Abre NinjaTrader 8
2. Espera a que cargue completamente
3. Deberías ver la ventana principal con gráficos
```

### 4.2 Compilar la Estrategia
```
1. En la barra de menú: Tools
2. Click en Tools
3. Busca "Compile" 
4. Click en "Compile Assembly"
```

**Pasos en imagen (conceptual):**
```
┌─ NinjaTrader 8 ─────────────────┐
│ File  Edit  View  Tools  Window  │ ← Click en "Tools"
│                                 │
└─────────────────────────────────┘

Después de click en Tools:
┌─ Menú desplegable ──────────────┐
│ ├─ Strategies                   │
│ ├─ Indicators                   │
│ ├─ Compile ◄────────────────────┼─ Click aquí
│ │   ├─ Compile Assembly         │
│ │   └─ Output                   │
│ └─ Options                      │
└─────────────────────────────────┘
```

### 4.3 Esperar el mensaje de compilación
```
En la parte inferior de NinjaTrader verás:

✅ "Assembly compiled successfully"   ← ¡EXCELENTE!

O

❌ "Error: Type or namespace 'MACD' not found"  ← Si sale error
```

---

## ⚠️ Si Sale Error de Compilación

### Solución 1: Cierra y reabre NinjaTrader
```
1. Cierra NinjaTrader completamente
2. Espera 5 segundos
3. Reabre NinjaTrader
4. Intenta compilar de nuevo (Tools → Compile Assembly)
```

### Solución 2: Verifica que el archivo esté en la carpeta correcta
```
1. Abre: C:\Users\[Tu Usuario]\Documents\NinjaTrader 8\bin\Custom\Strategies\
2. Verifica que veas: MNQ_OpeningBreak_Strategy.cs
3. Si NO está, cópialo nuevamente
4. Luego intenta compilar de nuevo
```

### Solución 3: Si sigue fallando
```
Mensaje típico de error:
"Error: Type not found 'MACD'"

Solución:
- Los indicadores MACD, EMA, SMA vienen con NinjaTrader
- Cierra NinjaTrader completamente
- Reabre y espera a que cargue todas las librerías
- Intenta compilar de nuevo
```

---

## 📊 PASO 5: Crear un Gráfico de MNQ

### 5.1 Abrir Instrument Selector
```
En NinjaTrader, busca la ventana "Instrument Selector"
Si NO la ves:
  - Click en: New → Chart
  - O presiona: Ctrl + N
```

### 5.2 Buscar MNQ
```
En Instrument Selector:
  1. En el buscador, escribe: MNQ
  2. Verás: /MNQ (Micro E-mini Nasdaq-100)
  3. Double-click en /MNQ
```

**Resultado:**
```
Se abrirá un nuevo gráfico con datos de MNQ
Deberías ver velas (barras) de precio
```

### 5.3 Configurar el Timeframe
```
1. Right-click en el gráfico
2. Selecciona: "Chart Windows Properties"
3. En "Chart Type": Selecciona "Bar"
4. En "Period": Selecciona "5 Min" (o "1 Min" para ver más detalles)
5. Click "OK"
```

---

## 🤖 PASO 6: Agregar la Estrategia al Gráfico

### 6.1 Abrir menú de estrategias
```
1. Right-click directamente en el gráfico de MNQ
2. Verás un menú emergente
3. Busca: "Add Strategy"
4. Click en "Add Strategy"
```

### 6.2 Seleccionar la estrategia
```
Se abrirá un cuadro de diálogo con lista de estrategias

Busca: "MNQ Opening Break Strategy"
Click en ella para seleccionar
```

**Si no la ves:**
```
- Significa que no compiló correctamente
- Vuelve al PASO 4
- Verifica el mensaje de compilación
```

---

## ⚙️ PASO 7: Configurar Parámetros

### 7.1 Se abrirá una ventana con parámetros
```
Verás campos para ingresar valores:

Fast EMA Period:        [___]
Slow EMA Period:        [___]
MACD Fast:             [___]
MACD Slow:             [___]
MACD Signal:           [___]
Volume SMA:            [___]
Stop Loss Pips:        [___]
Take Profit Pips:      [___]
Session End Minute:    [___]
```

### 7.2 Ingresar valores recomendados
```
Copia y pega estos valores (son los óptimos):

Fast EMA Period:        5
Slow EMA Period:        13
MACD Fast:             12
MACD Slow:             26
MACD Signal:            9
Volume SMA:            20
Stop Loss Pips:        20
Take Profit Pips:      40
Session End Minute:    60
```

### 7.3 Guardar configuración
```
1. Después de ingresar todos los valores
2. Click en el botón "OK"
3. La estrategia se activará automáticamente
```

---

## ✅ PASO 8: Verificar que Está Funcionando

### 8.1 Señales visuales de que funciona
```
En el gráfico deberías ver:

✅ 3 líneas de indicadores:
   - Línea AZUL (MACD)
   - Línea VERDE (EMA 5 rápida)
   - Línea ROJA (EMA 13 lenta)

✅ Si es entre 9:30-10:00 AM ET:
   - Órdenes ejecutadas automáticamente
   - Líneas de Stop Loss y Take Profit en el gráfico
```

### 8.2 Ver las operaciones en tiempo real
```
Para ver P&L (Ganancias/Pérdidas):
  1. Tools → Account
  2. Verás tabla con operaciones
  3. Muestra: Entrada, Salida, Ganancia/Pérdida
```

---

## 🧪 PASO 9: Modo Simulado (Importante)

### 9.1 Cambiar a "Simulate Trades"
```
ANTES DE OPERAR CON DINERO REAL:

1. En NinjaTrader: Tools → Simulate Trades
2. O usa el botón "Simulate" en la ventana de conexión
3. Esto hace que las órdenes sean simuladas, sin dinero real
```

### 9.2 Probar 2-3 días simulados
```
1. Deja la estrategia corriendo en simulado
2. Observa qué operaciones abre
3. Verifica que los stops y objetivos funcionen
4. Toma notas de los resultados
```

---

## 💰 PASO 10: Habilitar en Modo Real (Opcional)

### ⚠️ SOLO DESPUÉS DE:
```
✅ Compilación exitosa
✅ Backtesting con resultados positivos
✅ 2-3 días de simulado sin problemas
✅ Entiendes la estrategia completamente
✅ Tienes mínimo $25,000 en tu cuenta
```

### 10.1 Conectar broker real
```
1. En NinjaTrader: Click en "Account Manager"
2. Selecciona tu broker (IB, TD Ameritrade, etc.)
3. Ingresa credenciales
4. Conecta la cuenta
```

### 10.2 Desactivar simulado
```
1. Tools → Simulate Trades (desactívalo)
2. Ahora las órdenes serán reales
```

### 10.3 COMIENZA CON 1 SOLO CONTRATO
```
⚠️ IMPORTANTE: 
   - NO copies la cantidad de contratos
   - Comienza con 1 MNQ solamente
   - Aumenta a 2-3 si 5+ días seguidos son ganadores
```

---

## 📋 Checklist de Instalación Completa

- [ ] Descargué el archivo MNQ_OpeningBreak_Strategy.cs
- [ ] Copié el archivo a: C:\Users\...\NinjaTrader 8\bin\Custom\Strategies\
- [ ] Compilé exitosamente (Tools → Compile Assembly)
- [ ] Vi mensaje "Assembly compiled successfully"
- [ ] Creé gráfico de /MNQ
- [ ] Agregué estrategia al gráfico (Right-click → Add Strategy)
- [ ] Ingresé parámetros recomendados
- [ ] Clickié "OK" para activar
- [ ] Veo los 3 indicadores en el gráfico (MACD, EMA5 verde, EMA13 roja)
- [ ] Probé en simulado durante 2-3 días
- [ ] ✅ ¡Listo para operar!

---

## 🆘 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "Assembly compiled successfully" pero no aparece en Add Strategy | Cierra NinjaTrader completamente, reabre, intenta de nuevo |
| "Error: Type not found MACD" | Cierra NT, reabre, espera a que cargue, compila de nuevo |
| No veo 3 líneas en el gráfico | Right-click gráfico → Chart Properties, asegúrate que sea "Bar" y "5 Min" |
| Las órdenes no se ejecutan | Verifica que sea entre 9:30-10:00 AM ET. Fuera de ese horario no opera |
| ¿Dónde veo el P&L? | Tools → Account (mira la tabla de posiciones abiertas) |

---

## 📞 Próximos Pasos

1. ✅ Sigue estos pasos exactamente
2. ✅ Compila sin errores
3. ✅ Prueba en simulado 2-3 días
4. ✅ Valida que funciona correctamente
5. ✅ Lanza en modo real con 1 contrato

---

**¿Necesitas ayuda con algún paso específico?**

Describe qué paso no funcionó y te ayudaré a resolverlo.
