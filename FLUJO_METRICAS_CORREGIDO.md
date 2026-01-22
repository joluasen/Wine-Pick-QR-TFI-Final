# ✅ FLUJO DE MÉTRICAS CORREGIDO

## Cambios Realizados

Se ha corregido la lógica de registro de métricas para que:
- **Solo registre una métrica cuando el usuario REALMENTE consulta un producto**
- **No registre múltiples veces al abrir la misma ficha**
- **Si hay 1 resultado, muestre la ficha directamente (sin pasar por vista search)**
- **Si hay múltiples resultados, muestre la vista search**

---

## 🔄 Nuevo Flujo

### 1️⃣ **Búsqueda por Sugerencia en Header**

```
Usuario escribe: "MALBEC-ALAMOS-750"
    ↓
Se obtienen sugerencias (max 5)
    ↓
Usuario HACE CLIC EN UNA SUGERENCIA
    ↓
Se registra INMEDIATAMENTE: { product_id: X, channel: "BUSQUEDA" }
    ↓
Se abre la ficha del producto (SIN re-registrar)
```

**Archivo**: `public/js/search-bar.js` - Línea ~91

---

### 2️⃣ **Búsqueda Manual (Submit)** 

```
Usuario escribe: "malbec" y presiona Enter/Submit
    ↓
Se buscan productos en API
    ↓
¿Resultado = 1? SÍ → 
    • Registra: { product_id: X, channel: "BUSQUEDA" }
    • Abre ficha directamente
    ↓
¿Resultado > 1? SÍ →
    • Redirige a #search?query=malbec
    • ESPERA a que el usuario haga clic
    ↓
¿Resultado = 0? →
    • Muestra lista vacía
```

**Archivo**: `public/js/search-bar.js` - Línea ~106

---

### 3️⃣ **Click en Resultado de Vista Search**

```
Usuario ve lista de resultados en #search
    ↓
Usuario HACE CLIC EN UN PRODUCTO
    ↓
Se registra INMEDIATAMENTE: { product_id: X, channel: "QR" o "BUSQUEDA" }
    ↓
Se abre la ficha (SIN re-registrar)
```

**Archivo**: `public/js/views/searchView.js` - Línea ~91

---

### 4️⃣ **Escaneo QR**

```
Usuario escanea código QR
    ↓
Se obtiene el código (ej: MALBEC-ALAMOS-750)
    ↓
Se busca por API /api/public/productos/{codigo}
    ↓
¿Encontrado? SÍ →
    • Registra: { product_id: X, channel: "QR" }
    • Abre ficha directamente
    ↓
¿No encontrado? →
    • Marca en sessionStorage: lastSearchChannel = "QR"
    • Redirige a #search?query={codigo}
    • Si usuario hace clic, registra como "QR"
```

**Archivo**: `public/js/core/modalManager.js` - Línea ~624

---

### 5️⃣ **Vista Home (Más Buscados)**

```
Usuario abre Home (#home)
    ↓
Ve lista de productos más buscados
    ↓
Usuario HACE CLIC EN UN PRODUCTO
    ↓
Se registra: { product_id: X, channel: "BUSQUEDA" }
    ↓
Se abre la ficha (SIN re-registrar)
```

**Archivo**: `public/js/views/homeView.js` - Línea ~119

---

### 6️⃣ **Vista de Promociones**

```
Usuario abre Promociones (#promotions)
    ↓
Ve lista de productos con promociones
    ↓
Usuario HACE CLIC EN UN PRODUCTO
    ↓
Se registra: { product_id: X, channel: "BUSQUEDA" }
    ↓
Se abre la ficha (SIN re-registrar)
```

**Archivo**: `public/js/views/promotionsView.js` - Línea ~120

---

### ❌ **Vista Admin (NO registra)**

```
Admin abre panel de productos (#admin-products)
    ↓
Admin hace clic para ver detalles
    ↓
Se abre la ficha (SIN REGISTRAR MÉTRICA)
    ↓
Razón: Es un uso interno, no es una consulta real del usuario
```

**Archivo**: `public/js/core/modalManager.js` - Línea ~310

---

## 📋 Resumen de Cambios de Código

### Backend
- ✅ `Metric.php`: Eliminado parámetro `context_info` del insert
- ✅ `MetricController.php`: Eliminado procesamiento de `context_info`

### Frontend
- ✅ `search-bar.js`: 
  - Ahora verifica cantidad de resultados
  - Si 1 resultado: abre directamente y registra
  - Si >1 resultado: muestra search view
  
- ✅ `modalManager.js`:
  - Removido registro automático de `showProduct()`
  - Actualizado `handleQrResult()` para buscar y abrir directamente
  - `showProductAdmin()` sigue sin registrar

- ✅ `searchView.js`: Registra ANTES de abrir
- ✅ `homeView.js`: Registra ANTES de abrir
- ✅ `promotionsView.js`: Registra ANTES de abrir

---

## 🧪 Casos de Prueba

### ✅ Test 1: Sugerencia en Header
```
1. Escribir "MALBEC" en el header
2. Hacer clic en primera sugerencia
3. Verificar: Ficha abierta + 1 métrica registrada
4. Abrir y cerrar ficha 5 veces
5. Verificar: Sigue siendo solo 1 métrica (no se duplica)
```

### ✅ Test 2: Búsqueda con 1 Resultado
```
1. Escribir en header: "MALBEC-ALAMOS-750" (si existe)
2. Presionar Enter
3. Verificar: Ficha abierta DIRECTAMENTE (no vista search)
4. Verificar: 1 métrica registrada
```

### ✅ Test 3: Búsqueda con Múltiples Resultados
```
1. Escribir en header: "vino"
2. Presionar Enter
3. Verificar: Abre vista search (no ficha)
4. Hacer clic en un producto
5. Verificar: Se abre ficha + 1 métrica
6. Volver a search, hacer clic en otro
7. Verificar: Nueva métrica registrada
```

### ✅ Test 4: QR Scanner
```
1. Ir a #scan
2. Escanear código (o ingresar manualmente)
3. Verificar: Ficha abierta DIRECTAMENTE
4. Verificar: Métrica registrada con channel="QR"
```

### ✅ Test 5: QR Scanner sin Encontrar
```
1. Ir a #scan
2. Escanear código NO EXISTENTE
3. Verificar: Abre #search?query=...
4. Hacer clic en un resultado
5. Verificar: Métrica registrada con channel="QR"
```

### ✅ Test 6: Home View
```
1. Ir a #home
2. Hacer clic en un producto
3. Verificar: Métrica registrada con channel="BUSQUEDA"
```

### ✅ Test 7: Admin (No registra)
```
1. Ingresar como admin
2. Ir a #admin-products
3. Hacer clic en varios productos
4. Abrir DevTools (F12) → Network
5. Verificar: NO hay llamadas a /api/public/metricas
```

---

## 📊 Verificación en Base de Datos

```sql
-- Ver métricas del último día
SELECT 
    ce.id,
    DATE(ce.occurred_at) as fecha,
    TIME(ce.occurred_at) as hora,
    ce.channel,
    p.name as producto
FROM consult_events ce
INNER JOIN products p ON p.id = ce.product_id
WHERE DATE(ce.occurred_at) = CURDATE()
ORDER BY ce.occurred_at DESC;

-- Contar por canal hoy
SELECT 
    channel,
    COUNT(*) as total
FROM consult_events
WHERE DATE(occurred_at) = CURDATE()
GROUP BY channel;
```

---

## 🔍 Debug en Console

```javascript
// En cualquier vista, abrir F12 y ejecutar:

// Ver últimas llamadas a métricas
window.lastMetrics = [];
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('metricas')) {
    console.log('📊 MÉTRICA:', args[1].body);
    window.lastMetrics.push(JSON.parse(args[1].body));
  }
  return originalFetch.apply(this, args);
};

// Ver todas las métricas registradas
console.table(window.lastMetrics);
```

---

## ✨ Beneficios de la Nueva Lógica

1. **Precisión**: Cada métrica representa UNA consulta real del usuario
2. **Sin duplicados**: Abrir/cerrar la ficha no duplica registros
3. **Mejor UX**: Búsqueda con 1 resultado abre directamente
4. **Flexible**: Si QR no se encuentra, permite buscar manualmente
5. **Limpio**: Admin no poluciona las métricas
6. **Debuggeable**: Fácil ver dónde se registran las métricas

---

Fecha de actualización: 22 de enero de 2026
