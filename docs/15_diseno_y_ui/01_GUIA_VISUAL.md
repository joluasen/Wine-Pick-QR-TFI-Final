# Guía Visual — WINE-PICK-QR (Bootstrap 5 Theming)

**Versión:** 2.0  
**Fecha:** 12 de diciembre de 2025  
**Framework Base:** Bootstrap 5.3  
**Propósito:** Definir un sistema de diseño coherente, moderno y responsivo para la PWA, basado en la personalización de Bootstrap. Esto garantiza una base robusta y facilita futuras actualizaciones visuales.

---

## 1. Estrategia de Diseño

Utilizaremos **Bootstrap 5** como framework CSS principal para aprovechar su sistema de grilla responsiva, componentes predefinidos y utilidades. La personalización se realizará en un archivo `public/css/theme.css` que sobreescribe las variables CSS nativas de Bootstrap.

**Ventajas de este enfoque:**
- **Consistencia:** Usamos componentes estándar probados.
- **Responsividad:** El diseño es 100% adaptable a móviles, tablets y escritorio desde el inicio.
- **Mantenibilidad:** Cambiar la paleta de colores a futuro implica modificar unas pocas variables CSS, no cientos de líneas de código.
- **Modernidad:** Nos alineamos con las prácticas de desarrollo de aplicaciones web modernas.

---

## 2. Paleta de Colores

Nuestra paleta de marca se mapea directamente a las variables de color semánticas de Bootstrap.

### 2.1 Mapeo de Colores Principales

| Uso Semántico | Variable Bootstrap | Color | Hex | Descripción |
|---------------|--------------------|-------|-----|-------------|
| **Primario** | `--bs-primary` | Bordeaux | `#4A0E1A` | Marca, headers, botones principales, links. |
| **Secundario** | `--bs-secondary` | Gris Oscuro | `#5A5A5A` | Botones secundarios, texto de apoyo. |
| **Éxito** | `--bs-success` | Verde | `#198754` | Mensajes de éxito, validaciones correctas. |
| **Peligro/Error** | `--bs-danger` | Rojo | `#DC3545` | Alertas de error, acciones destructivas. |
| **Advertencia** | `--bs-warning` | Dorado | `#d4af37` | Promociones, avisos importantes. |
| **Información** | `--bs-info` | Azul Claro | `#0DCAF0` | Mensajes informativos. |

### 2.2 Mapeo de Colores de UI

| Uso Semántico | Variable Bootstrap | Color | Hex | Descripción |
|---------------|--------------------|-------|-----|-------------|
| **Fondo App** | `--bs-body-bg` | Gris Claro | `#FAFAFA` | Color de fondo general. |
| **Texto Base** | `--bs-body-color` | Negro Suave | `#1A1A1A` | Color principal para todo el texto. |
| **Bordes** | `--bs-border-color` | Gris Claro | `#DDDDDD` | Bordes para tarjetas, inputs, separadores. |
| **Fondo Tarjetas**| `--bs-card-bg` | Blanco | `#FFFFFF` | Fondo para todos los componentes `card`. |

### 2.3 Ejemplo de Implementación (`theme.css`)

```css
/* public/css/theme.css */
:root {
  /* 1. Paleta de colores principal */
  --bs-primary: #4A0E1A;
  --bs-secondary: #5A5A5A;
  --bs-success: #198754;
  --bs-danger: #DC3545;
  --bs-warning: #d4af37; /* Usamos nuestro dorado para promos */
  --bs-info: #0DCAF0;

  /* 2. Colores de UI y texto */
  --bs-body-bg: #FAFAFA;
  --bs-body-color: #1A1A1A;
  --bs-border-color: #DDDDDD;
  --bs-border-radius: 0.25rem; /* Bordes ligeramente redondeados */

  /* 3. Links */
  --bs-link-color: var(--bs-primary);
  --bs-link-hover-color: #2D0810; /* Versión más oscura del primario */
}
```

---

## 3. Tipografía

Bootstrap 5 utiliza un "system font stack" nativo, lo cual es ideal para el rendimiento y la legibilidad. Mantenemos esta configuración.

### 3.1 Familia de Fuentes

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### 3.2 Jerarquía de Títulos (Clases Bootstrap)

| Elemento | Clase Bootstrap | Tamaño (aprox.) | Uso |
|----------|-----------------|-----------------|-----|
| Título 1 | `<h1>` o `.h1` | `2.5rem` (40px) | Título principal de la PWA. |
| Título 2 | `<h2>` o `.h2` | `2rem` (32px) | Títulos de cada vista/sección. |
| Título 3 | `<h3>` o `.h3` | `1.75rem` (28px) | Subtítulos importantes. |
| Título 4 | `<h4>` o `.h4` | `1.5rem` (24px) | Títulos de tarjetas o grupos de elementos. |
| Texto base | `<p>` | `1rem` (16px) | Párrafos y texto general. |
| Texto pequeño | `<small>` o `.small` | `0.875rem` (14px) | Aclaraciones, metadatos. |

---

## 4. Componentes Base

A continuación se definen los estilos de los componentes clave utilizando las clases de Bootstrap.

### 4.1 Botones

| Tipo | Clase | Estilo |
|---|---|---|
| **Primario** | `.btn .btn-primary` | Fondo Bordeaux (`--bs-primary`), texto blanco. |
| **Secundario** | `.btn .btn-secondary` | Fondo Gris (`--bs-secondary`), texto blanco. |
| **Peligro** | `.btn .btn-danger` | Fondo Rojo (`--bs-danger`), texto blanco. |
| **Contorno** | `.btn .btn-outline-primary` | Borde y texto Bordeaux, fondo transparente. |

**Ejemplo de Código:**
```html
<button type="button" class="btn btn-primary">Acción Principal</button>
<button type="button" class="btn btn-secondary">Acción Secundaria</button>
<button type="button" class="btn btn-outline-primary">Ver Detalles</button>
```

### 4.2 Inputs de Texto

Se utiliza la clase `.form-control` para todos los inputs, selects y textareas. Heredarán los colores y bordes definidos en las variables globales.

| Estado | Clase | Estilo |
|---|---|---|
| **Normal** | `.form-control` | Borde gris (`--bs-border-color`), fondo blanco. |
| **Focus** | `:focus` | Borde Bordeaux y una sombra sutil (`box-shadow`). |

**Ejemplo de Código:**
```html
<div class="mb-3">
  <label for="productName" class="form-label">Nombre del Producto</label>
  <input type="text" class="form-control" id="productName" placeholder="Ej: Malbec Reserva">
</div>
```

### 4.3 Tarjetas (Cards)

El componente `.card` es la base para mostrar contenido encapsulado, como productos en un listado.

| Elemento | Clase | Estilo |
|---|---|---|
| **Contenedor** | `.card` | Fondo blanco, borde gris, sombra sutil. |
| **Header** | `.card-header` | Sección superior con fondo ligeramente gris. |
| **Cuerpo** | `.card-body` | Contenido principal de la tarjeta. |
| **Título** | `.card-title` | Título principal dentro de la tarjeta (equivale a un `<h4>`). |
| **Texto** | `.card-text` | Párrafos de texto dentro de la tarjeta. |

**Ejemplo de Código (Producto):**
```html
<div class="card h-100 shadow-sm">
  <!-- <img src="..." class="card-img-top" alt="..."> -->
  <div class="card-body">
    <h5 class="card-title">Malbec Reserva 750ml</h5>
    <p class="card-text">Bodega Catena Zapata</p>
    <p class="card-text"><small class="text-muted">Código: MALBEC-RES-750-001</small></p>
  </div>
  <div class="card-footer">
    <a href="#" class="btn btn-primary">Ver Producto</a>
  </div>
</div>
```

### 4.4 Alertas (Mensajes de Estado)

Para mostrar mensajes de éxito, error o información, se usan las alertas de Bootstrap.

| Tipo | Clase | Estilo |
|---|---|---|
| **Éxito** | `.alert .alert-success` | Fondo verde claro, texto verde oscuro. |
| **Error** | `.alert .alert-danger` | Fondo rojo claro, texto rojo oscuro. |
| **Promoción** | `.alert .alert-warning` | Fondo dorado claro, texto oscuro. |

**Ejemplo de Código:**
```html
<div class="alert alert-success" role="alert">
  ¡Producto guardado correctamente!
</div>

<div class="alert alert-danger" role="alert">
  Error: El código del producto ya existe.
</div>

<div class="alert alert-warning" role="alert">
  🔥 ¡Oferta especial! Este producto tiene un 20% de descuento.
</div>
```

---

## 5. Sistema de Grilla y Layout

Bootstrap utiliza un sistema de 12 columnas para crear layouts responsivos.

- **Contenedor:** `.container` (ancho fijo) o `.container-fluid` (ancho completo).
- **Fila:** `.row` para agrupar columnas.
- **Columnas:** `.col`, `.col-md-6`, `.col-lg-4`, etc., para definir el ancho en diferentes tamaños de pantalla.

**Ejemplo de un listado de productos:**
```html
<div class="container">
  <div class="row g-4">
    <!-- Producto 1 -->
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100">...</div>
    </div>
    <!-- Producto 2 -->
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100">...</div>
    </div>
    <!-- Producto 3 -->
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100">...</div>
    </div>
  </div>
</div>
```

---

## 6. Próximos Pasos (Implementación)

1.  **Añadir Bootstrap al `spa.html`:** Incluir el CSS y JS de Bootstrap desde un CDN.
2.  **Crear y enlazar `theme.css`:** Crear el archivo con las variables de color personalizadas y enlazarlo en `spa.html` **después** del CSS de Bootstrap.
3.  **Refactorizar Vistas:** Actualizar progresivamente los archivos `.html` y `.js` de las vistas para utilizar las clases de Bootstrap en lugar de los estilos personalizados anteriores.

**Fin del documento**
