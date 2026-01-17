# Guía Visual — WINE-PICK-QR PWA

**Versión:** 1.0  
**Fecha:** 12 de diciembre de 2025  
**Propósito:** Consolidar y documentar la identidad visual de la PWA para mantener coherencia en todas las pantallas y componentes.

> Nota: La guía visual completa y canónica se encuentra en [15_diseno_y_ui/01_GUIA_VISUAL.md](15_diseno_y_ui/01_GUIA_VISUAL.md). Este documento funciona como resumen ejecutivo.

---

## 1. Paleta de Colores

### 1.1 Colores Principales

| Variable CSS | Color | Hex | Uso |
|-------------|-------|-----|-----|
| `--primary` | Bordeaux oscuro | `#4A0E1A` | Color principal de marca, headers, botones primarios, títulos |
| `--primary-light` | Bordeaux medio | `#6B0F2A` | Variante clara para hovers y elementos secundarios |
| `--primary-dark` | Bordeaux muy oscuro | `#2D0810` | Bordes, sombras, fondos oscuros |
| `--accent` | Vino tinto | `#721C2E` | Acentos y elementos destacados |

### 1.2 Colores de Fondo

| Variable CSS | Color | Hex | Uso |
|-------------|-------|-----|-----|
| `--bg` | Gris muy claro | `#FAFAFA` | Fondo general de la aplicación |
| `--bg-card` | Blanco | `#FFFFFF` | Fondo de tarjetas y contenedores |

### 1.3 Colores de Texto

| Variable CSS | Color | Hex | Uso |
|-------------|-------|-----|-----|
| `--text` | Negro suave | `#1A1A1A` | Texto principal |
| `--text-light` | Gris medio | `#5A5A5A` | Texto secundario, etiquetas, descripciones |

### 1.4 Colores de Borde

| Variable CSS | Color | Hex | Uso |
|-------------|-------|-----|-----|
| `--border` | Gris claro | `#DDDDDD` | Bordes de campos, separadores |
| `--border-light` | Gris muy claro | `#EEEEEE` | Bordes sutiles, líneas divisorias |

### 1.5 Colores de Estado

| Variable CSS | Color | Hex | Uso |
|-------------|-------|-----|-----|
| `--success` | Verde bosque | `#2E7D42` | Confirmaciones, mensajes de éxito |
| `--error` | Rojo intenso | `#C62828` | Errores, validaciones fallidas |
| `--info` | Azul información | `#0277BD` | Mensajes informativos, avisos |

### 1.6 Colores Especiales

| Uso | Color | Hex | Contexto |
|-----|-------|-----|----------|
| Promoción/Dorado | Dorado | `#d4af37` | Badges de descuento, promociones, precios especiales |
| Dorado claro | Dorado claro | `#f4d03f` | Gradientes de promoción |
| MercadoLibre Verde | Verde ML | `#00a650` | Badges de descuento estilo ML, ahorros |

### 1.7 Sombras

```css
--shadow: rgba(74, 14, 26, 0.08);
--shadow-hover: rgba(74, 14, 26, 0.12);
```

---

## 2. Tipografía

### 2.1 Familia de Fuentes

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Estrategia:** Sistema de fuentes nativas para máxima legibilidad y rendimiento multiplataforma.

### 2.2 Tamaños y Jerarquía

| Elemento | Tamaño | Peso | Uso |
|----------|--------|------|-----|
| **Logo/Título App** | `1.5rem` (24px) | `600` | Header principal (`.app-title`) |
| **Títulos H2** | `1.5rem` (24px) | `600` | Títulos de sección principales |
| **Títulos H3** | `1.1rem` (17.6px) | `600` | Subtítulos dentro de secciones |
| **Títulos H4** | `1rem` (16px) | `600` | Títulos de tarjetas, resultados de búsqueda |
| **Texto base** | `0.95rem` (15.2px) | `400` | Cuerpo de texto, párrafos |
| **Etiquetas (labels)** | `0.9rem` (14.4px) | `500` | Labels de formularios |
| **Texto pequeño** | `0.85rem` (13.6px) | `400` | Códigos, metadatos, footers |
| **Botones** | `0.95rem` (15.2px) | `500` | Texto de botones principales |
| **Nav botones** | `0.9rem` (14.4px) | `400` | Botones de navegación en header |

### 2.3 Precios (Estilo MercadoLibre)

| Elemento | Tamaño | Peso | Descripción |
|----------|--------|------|-------------|
| Símbolo `$` | `1.5rem` | `300` | Símbolo de moneda |
| Entero precio | `2.75rem` | `300` | Parte entera del precio |
| Decimales | `1.5rem` | `300` | Parte decimal del precio |
| Precio original tachado | `1.125rem` | `300` | Precio sin descuento |

### 2.4 Line Height

```css
body { line-height: 1.65; }
textarea, p { line-height: 1.5-1.6; }
```

---

## 3. Componentes Base

### 3.1 Botones

#### Botón Primario

```css
background: var(--primary); /* #4A0E1A */
color: white;
padding: 0.75rem 1.5rem;
border-radius: 2px;
font-size: 0.95rem;
font-weight: 500;
transition: all 0.15s ease;
```

**Hover:**
```css
background: var(--primary-dark); /* #2D0810 */
```

**Active:**
```css
transform: scale(0.98);
```

**Disabled:**
```css
background: #999;
opacity: 0.6;
cursor: not-allowed;
```

#### Botón de Navegación (Header)

```css
background: transparent;
color: white;
border: 1px solid rgba(255, 255, 255, 0.25);
padding: 0.5rem 1rem;
border-radius: 4px;
font-size: 0.9rem;
font-weight: 400;
```

**Hover:**
```css
background: rgba(255, 255, 255, 0.15);
border-color: rgba(255, 255, 255, 0.4);
```

#### Botón Secundario

```css
background: var(--text-light); /* #5A5A5A */
color: white;
padding: 0.75rem 1.5rem;
border-radius: 2px;
```

**Hover:**
```css
background: var(--text); /* #1A1A1A */
```

### 3.2 Inputs de Texto

```css
width: 100%;
padding: 0.7rem 0.9rem;
border: 1px solid var(--border); /* #DDDDDD */
border-radius: 2px;
font-size: 0.95rem;
background: var(--bg-card); /* #FFFFFF */
transition: all 0.15s ease;
```

**Focus:**
```css
outline: none;
border-color: var(--primary); /* #4A0E1A */
box-shadow: 0 0 0 3px rgba(74, 14, 26, 0.05);
```

**Tipos soportados:**
- `input[type="text"]`
- `input[type="number"]`
- `input[type="email"]`
- `input[type="password"]`
- `select`
- `textarea`

### 3.3 Tarjetas y Contenedores

#### Sección de Vista (Section Card)

```css
background: var(--bg-card); /* #FFFFFF */
padding: 2.5rem;
border-radius: 2px;
border: 1px solid var(--border-light); /* #EEEEEE */
box-shadow: 0 1px 3px var(--shadow);
```

#### Tarjeta de Resultado (Search Result Card)

```css
background: var(--bg-card);
padding: 1.25rem;
border: 1px solid var(--border);
border-radius: 2px;
box-shadow: 0 1px 3px var(--shadow);
transition: all 0.15s ease;
cursor: pointer;
```

**Hover:**
```css
box-shadow: 0 4px 12px rgba(74, 14, 26, 0.15);
transform: translateY(-2px);
```

#### Tarjeta de Producto Legacy

```css
background: var(--bg-card);
padding: 1.5rem;
border-radius: 2px;
border: 1px solid var(--border);
border-left: 3px solid var(--primary); /* Acento lateral */
```

### 3.4 Mensajes de Estado

#### Estructura Base

```css
padding: 0.75rem 1rem;
border-radius: 2px;
margin: 1rem 0;
font-weight: 400;
font-size: 0.9rem;
border-left: 3px solid [color];
```

#### Info
```css
background: #F0F7FF;
color: #014678;
border-left-color: var(--info); /* #0277BD */
```

#### Success
```css
background: #F1F8F4;
color: #1B5E2F;
border-left-color: var(--success); /* #2E7D42 */
```

#### Error
```css
background: #FFF4F4;
color: #8B1C1C;
border-left-color: var(--error); /* #C62828 */
```

### 3.5 Labels de Formulario

```css
font-weight: 500;
color: var(--text);
margin-bottom: 0.4rem;
display: block;
font-size: 0.9rem;
```

---

## 4. Componentes Especiales

### 4.1 Badge de Descuento (Estilo MercadoLibre)

```css
display: inline-block;
background: #00a650; /* Verde ML */
color: white;
padding: 0.35rem 0.6rem;
border-radius: 4px;
font-size: 0.875rem;
font-weight: 600;
```

### 4.2 Caja de Promoción

```css
background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
color: #2D0810;
padding: 0.75rem 1rem;
border-radius: 4px;
box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
```

**Textos internos:**
- Badge: `font-size: 0.65rem; font-weight: 700; text-transform: uppercase;`
- Texto principal: `font-size: 0.9rem; font-weight: 600;`
- Validez: `font-size: 0.75rem; opacity: 0.85;`

### 4.3 Modal

#### Overlay
```css
position: fixed;
top: 0; left: 0;
width: 100%; height: 100%;
background: rgba(0, 0, 0, 0.85);
```

#### Contenido
```css
background: var(--bg-card);
border-radius: 8px;
max-width: 700px;
width: 90%;
max-height: 90vh;
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
```

#### Botón Cerrar
```css
background: rgba(0, 0, 0, 0.3);
color: white;
font-size: 2rem;
border-radius: 4px;
padding: 0.25rem 0.5rem;
```

**Hover:**
```css
background: var(--primary);
```

---

## 5. Layout y Estructura

### 5.1 Header

```css
background: var(--primary);
color: white;
padding: 1.25rem 2rem;
border-bottom: 1px solid var(--primary-dark);
```

### 5.2 Contenedor Principal

```css
#app-root {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
```

### 5.3 Footer

```css
background: var(--primary);
color: white;
text-align: center;
padding: 1rem;
border-top: 1px solid var(--primary-dark);
```

### 5.4 Grid de Resultados

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 1.5rem;
```

---

## 6. Transiciones y Animaciones

### 6.1 Duración Estándar

```css
transition: all 0.15s ease;
```

### 6.2 Efectos Hover

**Elevación suave:**
```css
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(74, 14, 26, 0.15);
```

**Feedback táctil (active):**
```css
transform: scale(0.98);
```

---

## 7. Responsive Design

### 7.1 Breakpoint Principal

```css
@media (max-width: 768px) { ... }
```

### 7.2 Ajustes Móvil

- **Padding reducido:** `#app-root { padding: 1rem; }`
- **Sección:** `padding: 1.5rem;`
- **Grid una columna:** `grid-template-columns: 1fr;`
- **Título app:** `font-size: 1.5rem;`
- **Modal:** contenido fluido, altura ajustada

---

## 8. Accesibilidad

### 8.1 Contraste

- Todos los colores de texto cumplen WCAG AA.
- Ratio mínimo: 4.5:1 para texto normal.

### 8.2 Focus States

- Todos los inputs muestran `box-shadow` al recibir focus.
- Botones reaccionan visualmente al hover y active.

### 8.3 ARIA

- Mensajes de estado usan `aria-live="polite"` cuando es dinámico.

---

## 9. Uso en Código

### 9.1 Variables CSS

Todas las variables están definidas en `:root` del archivo `public/css/styles.css`:

```css
:root {
  --primary: #4A0E1A;
  --primary-light: #6B0F2A;
  --primary-dark: #2D0810;
  --accent: #721C2E;
  --bg: #FAFAFA;
  --bg-card: #FFFFFF;
  --text: #1A1A1A;
  --text-light: #5A5A5A;
  --border: #DDDDDD;
  --border-light: #EEEEEE;
  --success: #2E7D42;
  --error: #C62828;
  --info: #0277BD;
  --shadow: rgba(74, 14, 26, 0.08);
  --shadow-hover: rgba(74, 14, 26, 0.12);
}
```

### 9.2 Clases Reutilizables

| Clase | Propósito |
|-------|-----------|
| `.nav-btn` | Botones de navegación en header |
| `.btn-primary` | Botón de acción principal |
| `.btn-secondary` | Botón de acción secundaria |
| `.search-result-card` | Tarjeta en grid de resultados |
| `.meli-discount-badge` | Badge de descuento estilo ML |
| `.product-promotion-box` | Caja dorada de promoción |
| `.modal`, `.modal-overlay`, `.modal-content` | Sistema de modales |

---

## 10. Ejemplos Visuales

### 10.1 Botón Primario

```html
<button type="submit">Crear Producto</button>
```

### 10.2 Input con Label

```html
<label for="name">Nombre del producto</label>
<input type="text" id="name" placeholder="Ej: Malbec Reserva">
```

### 10.3 Mensaje de Éxito

```html
<div id="status" data-type="success">
  Producto creado correctamente.
</div>
```

### 10.4 Tarjeta de Resultado

```html
<div class="search-result-card">
  <h4>Malbec Reserva 750ml</h4>
  <p><strong>Bodega:</strong> Catena Zapata</p>
  <p><strong>Precio:</strong> $8500</p>
</div>
```

### 10.5 Badge de Descuento

```html
<span class="meli-discount-badge">20% OFF</span>
```

---

## 11. Mantenimiento

### 11.1 Agregar Nuevos Colores

1. Definir variable en `:root` en `styles.css`.
2. Documentar en esta guía (sección 1).
3. Usar la variable en componentes: `background: var(--nueva-variable);`

### 11.2 Modificar Componente Existente

1. Actualizar `styles.css`.
2. Sincronizar cambios en esta guía.
3. Verificar consistencia en todas las vistas (QR, búsqueda, admin, promo).

### 11.3 Crear Nuevo Componente

1. Seguir paleta y tipografía establecidas.
2. Mantener `border-radius: 2px` y `transition: all 0.15s ease`.
3. Documentar nuevo componente en sección 3 o 4 según corresponda.

---

## 12. Referencias

- **Archivo principal de estilos:** `public/css/styles.css`
- **Vistas parciales:** `public/views/*.html`
- **Controladores con lógica UI:** `public/js/views/*.js`

---

**Fin del documento**
