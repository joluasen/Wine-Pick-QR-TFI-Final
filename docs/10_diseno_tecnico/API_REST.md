# API REST – WINE-PICK-QR

Este documento describe la **API REST** de WINE-PICK-QR, especificando:

- Endpoints disponibles.
- Métodos HTTP utilizados.
- Parámetros de entrada.
- Estructura general de las respuestas.
- Códigos de error más frecuentes.
- Relación de cada endpoint con el modelo de datos.

El objetivo principal es proporcionar una referencia clara para la implementación del frontend, la defensa técnica del proyecto y futuras tareas de mantenimiento o extensión del sistema.

> **Convención importante**
> En la API y en la base de datos se utilizan **nombres de campos en inglés** (`public_code`, `name`, `base_price`, etc.). El texto explicativo de este documento se mantiene en español.

---

## 1. Convenciones generales

### 1.1 Base de la API

URL base de la API:

```text
/api
```

Ejemplos de endpoints:
- `/api/public/productos`
- `/api/admin/productos`
- `/api/admin/promociones`

### 1.2 Formato de datos

- Las peticiones que envían datos (POST) usan **JSON** en el cuerpo.
- Todas las respuestas se devuelven en **JSON**.

### 1.3 Estructura de respuesta

#### Respuesta de éxito

```json
{
  "ok": true,
  "data": {
    "...": "..."
  },
  "error": null
}
```

- `ok`: indica si la operación fue exitosa.
- `data`: contiene el resultado principal.
- `error`: siempre es `null` en escenarios de éxito.

#### Respuesta de error

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje legible",
    "details": {}
  }
}
```

- `code`: código interno (VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, etc.).
- `message`: mensaje legible para el consumidor de la API.
- `details`: información adicional (solo en desarrollo).

### 1.4 Códigos HTTP

- `200 OK` – Petición exitosa.
- `201 Created` – Recurso creado correctamente.
- `400 Bad Request` – Error de validación o parámetros incorrectos.
- `401 Unauthorized` – Falta autenticación válida.
- `404 Not Found` – Recurso no encontrado.
- `409 Conflict` – Conflicto (ej: clave duplicada).
- `500 Internal Server Error` – Error no controlado.

---

## 2. Autenticación

Los endpoints administrativos (`/api/admin/...`) requieren autenticación mediante sesión de servidor.

**Flujo:**
1. El frontend envía credenciales al endpoint de login.
2. El backend valida y crea una sesión.
3. El navegador conserva la cookie de sesión.
4. Las peticiones a `/api/admin/...` verifican la sesión antes de procesar.

Endpoints públicos (`/api/public/...`) no requieren autenticación.

---

## 3. Endpoints públicos

### 3.1 Obtener producto por código (QR)

**Endpoint:**
```http
GET /api/public/productos/{codigo}
```

**Descripción:** Devuelve la ficha de un producto activo a partir de su código público.

**Parámetros de ruta:**
- `codigo` (string): código público del producto.

**Ejemplo:**
```http
GET /api/public/productos/MALBEC-RES-750-001
```

**Respuesta exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "id": 1,
    "public_code": "MALBEC-RES-750-001",
    "name": "Malbec Reserva 750ml",
    "drink_type": "vino",
    "winery_distillery": "Bodega Ejemplo",
    "varietal": "Malbec",
    "origin": "Mendoza, Argentina",
    "vintage_year": 2021,
    "short_description": "Malbec reserva intenso y frutado.",
    "base_price": 5500.00,
    "visible_stock": 24,
    "image_url": null,
    "is_active": true,
    "created_at": "2025-12-04 21:02:28",
    "updated_at": "2025-12-04 21:02:28",
    "qr_link": "http://localhost/proyectos/Wine-Pick-QR-TFI/#qr?code=MALBEC-RES-750-001",
    "promotion": null,
    "final_price": 5500.00,
    "original_price": 5500.00
  },
  "error": null
}
```

**Errores:**
- `404 Not Found` → producto no encontrado o inactivo.

---

### 3.2 Búsqueda de productos

**Endpoint:**
```http
GET /api/public/productos?search={texto}&field={campo}&min_price={min}&max_price={max}&vintage_year={año}&limit={n}&offset={n}
```

**Descripción:** Busca productos activos con filtros opcionales.

**Parámetros de query:**

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `search` | string | Sí | Texto a buscar | - |
| `field` | string | No | Campo específico: name, drink_type, varietal, origin, public_code | - |
| `min_price` | float | No | Precio mínimo | - |
| `max_price` | float | No | Precio máximo | - |
| `vintage_year` | int | No | Año de cosecha | - |
| `limit` | int | No | Límite de resultados (max: 100) | 20 |
| `offset` | int | No | Offset para paginación | 0 |

**Ejemplos:**
```http
# Búsqueda simple
GET /api/public/productos?search=malbec

# Búsqueda con filtro de precio
GET /api/public/productos?search=vino&min_price=500&max_price=2000

# Búsqueda en campo específico
GET /api/public/productos?search=mendoza&field=origin

# Búsqueda completa con paginación
GET /api/public/productos?search=vino&min_price=500&max_price=3000&vintage_year=2020&limit=10&offset=0
```

**Respuesta exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "count": 5,
    "total": 25,
    "products": [...]
  },
  "error": null
}
```

**Errores:**
- `400 Bad Request` → search vacío o ausente.

---

### 3.3 Listar productos con promociones vigentes

**Endpoint:**
```http
GET /api/public/promociones?limit={n}&offset={n}
```

**Descripción:** Devuelve productos activos con promociones vigentes.

**Parámetros:**
- `limit` (int, opcional): límite de resultados (default: 100, max: 100).
- `offset` (int, opcional): offset para paginación (default: 0).

**Ejemplo:**
```http
GET /api/public/promociones?limit=20&offset=0
```

---

### 3.4 Listar productos más consultados

**Endpoint:**
```http
GET /api/public/mas-buscados?limit={n}&offset={n}
```

**Descripción:** Devuelve los productos más consultados ordenados por cantidad de consultas.

**Parámetros:**
- `limit` (int, opcional): límite de resultados (default: 10, max: 100).
- `offset` (int, opcional): offset para paginación (default: 0).

---

## 4. Endpoints de autenticación

### 4.1 Login

**Endpoint:**
```http
POST /api/admin/login
```

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "contraseña"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "message": "Login exitoso",
    "username": "admin"
  },
  "error": null
}
```

**Errores:**
- `401 Unauthorized` → credenciales inválidas.

---

### 4.2 Verificar sesión

**Endpoint:**
```http
GET /api/admin/me
```

**Descripción:** Verifica si existe una sesión activa de administrador.

**Respuesta exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "id": 1,
    "username": "admin"
  },
  "error": null
}
```

**Errores:**
- `401 Unauthorized` → sin sesión activa.

---

### 4.3 Logout

**Endpoint:**
```http
POST /api/admin/logout
```

**Respuesta exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "message": "Sesión cerrada"
  },
  "error": null
}
```

---

## 5. Endpoints administrativos - Productos

### 5.1 Listar productos

**Endpoint:**
```http
GET /api/admin/productos?limit={n}&offset={n}
```

**Requiere:** Autenticación de administrador.

**Descripción:** Lista todos los productos (incluyendo inactivos) con paginación.

**Parámetros:**
- `limit` (int, opcional): límite de resultados (default: 20, max: 100).
- `offset` (int, opcional): offset para paginación (default: 0).

**Ejemplo:**
```http
GET /api/admin/productos?limit=50&offset=0
```

**Respuesta exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "count": 50,
    "total": 150,
    "products": [...]
  },
  "error": null
}
```

**Errores:**
- `401 Unauthorized` → sin autenticación.

---

### 5.2 Crear producto

**Endpoint:**
```http
POST /api/admin/productos
```

**Requiere:** Autenticación de administrador.

**Body (JSON):**
```json
{
  "public_code": "MALBEC-RES-2021",
  "name": "Malbec Reserva 2021",
  "drink_type": "vino",
  "winery_distillery": "Bodega Ejemplo",
  "varietal": "Malbec",
  "origin": "Mendoza, Argentina",
  "vintage_year": 2021,
  "short_description": "Malbec reserva intenso y frutado.",
  "base_price": 5500.00,
  "visible_stock": 24,
  "image_url": null,
  "is_active": 1
}
```

**Campos requeridos:**
- `public_code` (string, único)
- `name` (string)
- `drink_type` (enum: vino, espumante, whisky, gin, licor, cerveza, otro)
- `winery_distillery` (string)
- `base_price` (number > 0)

**Respuesta exitosa (201 Created):**
```json
{
  "ok": true,
  "data": {
    "id": 7,
    "public_code": "MALBEC-RES-2021",
    ...
  },
  "error": null
}
```

**Errores:**
- `400 Bad Request` → validación fallida.
- `409 Conflict` → public_code duplicado.

---

### 5.3 Subir imagen de producto

**Endpoint:**
```http
POST /api/admin/upload/product-image
```

**Requiere:** Autenticación de administrador.

**Descripción:** Sube una imagen asociada a un producto y devuelve la **URL pública**.

**Body (multipart/form-data):**
- `image` (file, requerido) – formatos permitidos: JPEG, PNG, WebP

**Respuesta exitosa (201 Created):**
```json
{
  "ok": true,
  "data": {
    "filename": "product_1737123456_abcd1234efgh5678.jpg",
    "url": "http://localhost/proyectos/Wine-Pick-QR-TFI/uploads/products/product_...jpg",
    "size": 245678,
    "type": "image/jpeg"
  },
  "error": null
}
```

**Errores:**
- `400 Bad Request` → no se envió archivo, tamaño excedido o tipo no permitido.
- `401 Unauthorized` → sin autenticación.
- `500 Internal Server Error` → fallo al guardar imagen.

---

## 6. Endpoints administrativos - Promociones

### 6.1 Listar promociones

**Endpoint:**
```http
GET /api/admin/promociones?product_id={id}
GET /api/admin/promociones?limit={n}&offset={n}
```

**Requiere:** Autenticación de administrador.

**Descripción:** Dos modos de operación:
1. Con `product_id`: lista todas las promociones de ese producto.
2. Sin `product_id`: lista todas las promociones (paginado).

**Ejemplos:**
```http
# Promociones de un producto
GET /api/admin/promociones?product_id=8

# Todas las promociones (paginado)
GET /api/admin/promociones?limit=10&offset=0
```

**Respuesta con product_id (200 OK):**
```json
{
  "ok": true,
  "data": {
    "count": 1,
    "promotions": [
      {
        "id": 6,
        "promotion_type": "precio_fijo",
        "parameter_value": 6000.00,
        "visible_text": "Precio especial $6000",
        "start_at": "2025-01-01 00:00:00",
        "end_at": "2025-12-31 23:59:59",
        "is_active": true,
        "created_at": "2025-12-04 21:05:00"
      }
    ]
  },
  "error": null
}
```

**Respuesta sin product_id (200 OK):**
```json
{
  "ok": true,
  "data": {
    "count": 10,
    "total": 45,
    "promotions": [
      {
        "id": 1,
        "product_id": 5,
        "product_name": "Syrah Reserva",
        "promotion_type": "porcentaje",
        "parameter_value": 25.00,
        ...
      }
    ]
  },
  "error": null
}
```

---

### 6.2 Crear promoción

**Endpoint:**
```http
POST /api/admin/promociones
```

**Requiere:** Autenticación de administrador.

**Body (JSON):**
```json
{
  "product_id": 1,
  "promotion_type": "porcentaje",
  "parameter_value": 25,
  "visible_text": "25% OFF por tiempo limitado",
  "start_at": "2025-01-01 00:00:00",
  "end_at": "2025-12-31 23:59:59"
}
```

**Tipos de promoción:**
- `porcentaje`: descuento porcentual (ej: 25)
- `precio_fijo`: precio especial (ej: 999.99)
- `2x1`: lleva 2, paga 1
- `3x2`: lleva 3, paga 2
- `nxm`: combo personalizado

**Respuesta exitosa (201 Created):**
```json
{
  "ok": true,
  "data": {
    "id": 7,
    "product_id": 1,
    ...
  },
  "error": null
}
```

**Errores:**
- `400 Bad Request` → validación fallida.
- `404 Not Found` → producto no existe.

---

## 7. Seguridad

- Endpoints `/api/admin/...` validan sesión de administrador.
- Contraseñas hasheadas con bcrypt.
- Todas las consultas usan prepared statements (prevención SQL injection).
- Respuestas de error no revelan información sensible en producción.

---

## 8. Resumen

La API REST de WINE-PICK-QR proporciona:

- **Endpoints públicos:** consulta de productos, búsquedas con filtros, promociones vigentes.
- **Endpoints administrativos:** gestión completa de productos y promociones con autenticación.
- **Formato uniforme:** todas las respuestas siguen la estructura {ok, data, error}.
- **Seguridad:** autenticación por sesión, prepared statements, validaciones.
- **Paginación:** soporte de limit/offset en listados.

Este documento debe mantenerse actualizado conforme evolucione la API.
