# Guía Visual — WINE-PICK-QR (Inspiración Mercado Libre, CSS personalizado)

**Versión:** 2.1  
**Fecha:** 17 de enero de 2026  
**Base visual:** CSS personalizado (tokens, utilidades y componentes).  
**Propósito:** Documentar el sistema visual actual de la PWA, que prioriza **CSS propio** para mayor personalización, tomando como referencia patrones de Mercado Libre (jerarquía de precio, badges y densidad visual) pero manteniendo **identidad de marca propia**.

---

## 1. Estrategia de Diseño

Utilizamos **CSS personalizado como base** del sistema visual, prescindiendo de dependencias Bootstrap para mayor control y ligereza. El diseño sigue patrones comprobados de **Mercado Libre** (precio protagonista, tarjetas funcionales, badges decisivos), integrando plenamente la **identidad de marca WINE-PICK** con su paleta bordeaux y carácter premium.

### Principios Fundamentales

- **CSS-first:** variables, utilidades y componentes organizados en `public/css/` sin dependencias de frameworks externos.
- **Bootstrap mínimo:** reservado como base de reset global. El diseño es completamente funcional sin él; su ausencia no compromete la experiencia.
- **Arquitectura CSS estructurada:**
  - `theme.css` → tokens de diseño (colores, espacios, sombras, tipografía).
  - `layout.css` → contenedores, sistemas de grilla y espaciados globales.
  - `components.css` → tarjetas, chips, precios, inputs, notificaciones.
  - `buttons.css`, `navbar.css`, `modals.css` → componentes especializados.
  - `winepick-search.css` → interfaz de búsqueda y resultados.

### Resultados esperados

Performance optimizado, legibilidad nativa en dispositivos móviles, personalización sin restricciones y consistencia visual garantizada.

---

## 2. Paleta de Colores

La paleta mantiene el **bordeaux** como color de marca y añade un **amarillo acento** para destacar promociones al estilo marketplace.

### 2.1 Tokens de Color (theme.css)

| Token | Color | Hex | Uso |
|-------|-------|-----|-----|
| `--color-brand` | Bordeaux | `#4A0E1A` | Marca, títulos, botones principales |
| `--color-text` | Negro suave | `#1A1A1A` | Texto principal |
| `--color-muted` | Gris medio | `#5A5A5A` | Texto secundario |
| `--color-bg` | Gris claro | `#FAFAFA` | Fondo app |
| `--color-card` | Blanco | `#FFFFFF` | Tarjetas y contenedores |
| `--color-border` | Gris claro | `#DDDDDD` | Bordes e inputs |
| `--color-accent` | Dorado | `#d4af37` | Destacar promos/chips (estilo ML) |
| `--color-success` | Verde | `#198754` | Éxito |
| `--color-danger` | Rojo | `#DC3545` | Error |

### 2.2 Variables y ejemplo (`theme.css`)

```css
:root {
  --color-brand: #4A0E1A;
  --color-text: #1A1A1A;
  --color-muted: #5A5A5A;
  --color-bg: #FAFAFA;
  --color-card: #FFFFFF;
  --color-border: #DDDDDD;
  --color-accent: #FFE600;
  --radius-sm: 6px;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
}
```

### 2.3 Links y estados

```css
a { color: var(--color-brand); }
a:hover { color: #2D0810; }
```

---

## 3. Tipografía

System font stack para rendimiento y legibilidad, con énfasis en **precio protagonista** (estilo marketplace).

### 3.1 Familia de Fuentes

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### 3.2 Jerarquía y precios

| Elemento | Clase | Tamaño (aprox.) | Uso |
|----------|-------|-----------------|-----|
| Título 1 | `.wpq-title-1` | 40px | Título principal |
| Título 2 | `.wpq-title-2` | 32px | Secciones |
| Subtítulo | `.wpq-subtitle` | 20–24px | Tarjetas |
| Texto | `.wpq-text` | 16px | Base |
| Precio | `.wpq-price` | 28–32px | Monto principal |
| Decimales | `.wpq-price-decimals` | 16px | Parte decimal |

```css
.wpq-price { font-weight: 600; letter-spacing: -0.02em; }
.wpq-price-decimals { opacity: 0.7; margin-left: 2px; }
```

---

## 4. Componentes Base

Componentes claves con clases propias (sin Bootstrap).

### 4.1 Botones

| Tipo | Clase | Estilo |
|---|---|---|
| Primario | `.wpq-btn .wpq-btn--primary` | Fondo `--color-brand`, texto blanco |
| Secundario | `.wpq-btn .wpq-btn--secondary` | Borde `--color-brand`, fondo claro |
| Peligro | `.wpq-btn .wpq-btn--danger` | Fondo `--color-danger`, texto blanco |

```css
.wpq-btn { border-radius: var(--radius-sm); padding: 10px 14px; }
.wpq-btn--primary { background: var(--color-brand); color: #fff; }
.wpq-btn--secondary { background: #fff; border: 1px solid var(--color-brand); color: var(--color-brand); }
.wpq-btn--danger { background: var(--color-danger); color: #fff; }
```

### 4.2 Inputs de Texto

| Estado | Clase | Estilo |
|---|---|---|
| Normal | `.wpq-input` | Borde `--color-border`, fondo `--color-card` |
| Focus | `.wpq-input:focus` | Borde `--color-brand`, sombra `--shadow-sm` |

```css
.wpq-input { border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 10px 12px; }
.wpq-input:focus { outline: none; border-color: var(--color-brand); box-shadow: var(--shadow-sm); }
```

### 4.3 Tarjetas (Cards)

| Elemento | Clase | Estilo |
|---|---|---|
| Contenedor | `.wpq-card` | Fondo `--color-card`, borde `--color-border`, sombra `--shadow-sm` |
| Header | `.wpq-card__header` | Layout compacto |
| Cuerpo | `.wpq-card__body` | Contenido principal |
| Footer | `.wpq-card__footer` | Acciones |

```html
<div class="wpq-card">
  <div class="wpq-card__body">
    <div class="wpq-card__title wpq-title-4">Malbec Reserva 750ml</div>
    <div class="wpq-card__meta wpq-text">Bodega Ejemplo</div>
    <div class="wpq-price">
      $ 5.500<span class="wpq-price-decimals">00</span>
    </div>
    <span class="wpq-chip">20% OFF</span>
  </div>
  <div class="wpq-card__footer">
    <button class="wpq-btn wpq-btn--primary">Ver Producto</button>
  </div>
  </div>
```

```css
.wpq-card { border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-card); box-shadow: var(--shadow-sm); }
.wpq-chip { display:inline-block; background: var(--color-accent); color:#1A1A1A; border-radius: 12px; padding: 4px 8px; font-weight: 600; }
```

### 4.4 Alertas y toasts

```html
<div class="wpq-alert wpq-alert--success">¡Producto guardado correctamente!</div>
<div class="wpq-alert wpq-alert--danger">Error: El código del producto ya existe.</div>
```

```css
.wpq-alert { border-radius: var(--radius-sm); padding: 10px 12px; }
.wpq-alert--success { background:#D1E7DD; color:#0F5132; }
.wpq-alert--danger { background:#F8D7DA; color:#842029; }
```

---

## 5. Sistema de Grilla y Layout

Grilla propia con utilidades simples; Bootstrap se usa solo si hace falta en vistas específicas.

```css
.wpq-container { max-width: 1080px; margin: 0 auto; padding: 0 16px; }
.wpq-grid { display:grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
.wpq-col-12 { grid-column: span 12; }
.wpq-col-6-md { grid-column: span 12; }
@media (min-width: 768px) { .wpq-col-6-md { grid-column: span 6; } }
```

```html
<div class="wpq-container">
  <div class="wpq-grid">
    <div class="wpq-col-12 wpq-col-6-md">
      <div class="wpq-card">...</div>
    </div>
    <div class="wpq-col-12 wpq-col-6-md">
      <div class="wpq-card">...</div>
    </div>
  </div>
</div>
```

---

## 6. Próximos Pasos (Implementación)

1. **Revisar tokens en `theme.css`** para asegurar consistencia con paleta actual.
2. **Unificar componentes en `components.css`** (botones, chips, tarjetas, precios).
3. **Reducir dependencias Bootstrap** donde sigan presentes; usar utilidades propias.

**Fin del documento**
 
---

## 7. Implementación actual (clases existentes)

Para mantener coherencia con el código hoy, estas son las clases ya presentes en `public/css/`:

- Tarjetas: `.product-grid`, `.product-card`, `.card-title`, `.card-body`, `.card-footer`.
- Precios: `.price-container`, `.price-final`, `.price-original`, `.price-main`, `.price-savings`.
- Badges: `.badge-discount`, `.badge-offer`, `.badge-combo` (alias: `.discount-badge`).
- Alertas y estados: `.status-success`, `.status-error`, `.status-info`, `.empty-state`, `.loading-state`.
- Paginación: `.pagination-controls`, `.btn-pagination`, `.page-info`.
- Grilla/layout: `.view-container`, `section[data-view]` y estilos en `layout.css`.

Notas:
- Los estilos consumen tokens unificados definidos en `public/css/theme.css` (`--color-brand`, `--color-card`, `--color-border`, etc.).
- La transición hacia clases prefijadas `wpq-*` puede realizarse gradualmente; por ahora se prioriza la limpieza y unificación de variables.
