# API REST – WINE-PICK-QR

Este documento describe la **API REST** de WINE-PICK-QR, especificando:

- Endpoints disponibles.
- Métodos HTTP utilizados.
- Parámetros de entrada.
- Estructura general de las respuestas.
- Códigos de error más frecuentes.
- Relación de cada endpoint con el modelo de datos (`products`, `promotions`, `consult_events`, `admin_users`).

El objetivo principal es proporcionar una referencia clara para:

- La implementación del frontend (PWA).
- La defensa técnica del proyecto.
- Futuras tareas de mantenimiento o extensión del sistema.

> **Convención importante**  
> En la API y en la base de datos se utilizan **nombres de campos en inglés**  
> (`public_code`, `name`, `base_price`, etc.).  
> El texto explicativo de este documento se mantiene en español.

---

## 1. Convenciones generales

### 1.1 Base de la API

A efectos de documentación, se asume una URL base:

```text
/api
```

Ejemplos:

- `/api/public/productos`
- `/api/admin/productos`
- `/api/admin/metricas/top-products`

En un entorno real, esta base irá precedida por el dominio, por ejemplo:

```text
https://dominio.com/api/...
```

### 1.2 Formato de datos

- Las peticiones que envían datos (por ejemplo `POST` y `PUT`) usan **JSON** en el cuerpo.
- Todas las respuestas se devuelven en **JSON**.

### 1.3 Estructura general de la respuesta

Se adopta una estructura uniforme para todos los endpoints.

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
- `data`: contiene el resultado principal (objeto, lista, etc.).
- `error`: siempre es `null` en escenarios de éxito.

#### Respuesta de error

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Short human-readable message",
    "details": {
      "...": "..."
    }
  }
}
```

- `code`: código interno (`VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, etc.).
- `message`: mensaje legible para el consumidor de la API.
- `details`: campo opcional con información extra (p.ej. errores de validación por campo).  
  Solo se expone en entorno de desarrollo.

### 1.4 Códigos HTTP

- `200 OK` – Petición exitosa.
- `201 Created` – Recurso creado correctamente.
- `400 Bad Request` – Error de validación o parámetros incorrectos.
- `401 Unauthorized` – Falta autenticación válida.
- `403 Forbidden` – Sin permisos para la operación.
- `404 Not Found` – Recurso no encontrado.
- `500 Internal Server Error` – Error no controlado.

---

## 2. Autenticación y sesiones

> **Estado:** Diseño futuro (no implementado en el MVP).  
> En el MVP del Sprint 1 no existe login real; el endpoint de alta de producto  
> (`POST /api/admin/productos`) aún no valida sesión.

WINE-PICK-QR utilizará **sesiones de servidor** para la autenticación de administradores (no JWT).

- Endpoints **públicos** (`/api/public/...`) no requieren autenticación.
- Endpoints **admin** (`/api/admin/...`) requerirán:
  - Login previo.
  - Cookie de sesión válida.

Flujo previsto:

1. El frontend envía `username` y `password` al endpoint de login.
2. El backend valida y crea una sesión.
3. El navegador conserva la cookie de sesión.
4. Las peticiones a `/api/admin/...` verifican la sesión antes de procesar.

---

## 3. Endpoints públicos

Pensados para el cliente final y el personal del local. No requieren autenticación.

### 3.1 Búsqueda de productos (MVP)

**Endpoint**

```http
GET /api/public/productos
```

**Estado**

- ✅ Implementado en el Sprint 1.

**Descripción**

Devuelve una lista de productos **activos**, permitiendo búsqueda por texto.  
Se utiliza para:

- Búsqueda general por nombre, bodega/destilería, varietal o código público.
- Navegación desde la PWA.

**Parámetros de query**

- `search` (obligatorio, `string`): término de búsqueda. Se aplica a:
  - `name`
  - `winery_distillery`
  - `varietal`
  - `public_code`

- `page` (opcional, `int`, por defecto `1`).
- `limit` (opcional, `int`, por defecto `20`, máx. `100`).

**Ejemplo de petición**

```http
GET /api/public/productos?search=malbec&page=1&limit=10
```

**Ejemplo de respuesta (éxito)**

```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": 12,
        "public_code": "MALBEC-RESERVA-2020",
        "name": "Malbec Reserva 2020",
        "drink_type": "vino",
        "winery": "Bodega Example",
        "varietal": "Malbec",
        "origin": "Mendoza, Argentina",
        "vintage_year": 2020,
        "short_description": "Reserva red wine, ideal for red meat.",
        "base_price": 4500.0,
        "visible_stock": 25,
        "image_url": "https://example.com/images/malbec_reserva_2020.jpg",
        "is_active": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "count": 1
    }
  },
  "error": null
}
```

**Errores típicos**

- `400 Bad Request` → `search` vacío o ausente.
- `500 Internal Server Error` → error inesperado.

---

### 3.2 Consulta de producto por código (QR) – MVP

**Endpoint**

```http
GET /api/public/productos/{public_code}
```

**Estado**

- ✅ Implementado en el Sprint 1.  
  El registro en `consult_events` es parte de un sprint posterior.

**Descripción**

Devuelve la ficha de un producto activo a partir de su `public_code`.  
Se usa cuando:

- El cliente escanea el QR.
- Se ingresa directamente la URL con el código.

**Parámetros de ruta**

- `public_code` (obligatorio, `string`): código público del producto, el mismo incluido en el QR.

**Parámetros de query**

- `channel` (opcional, `string`, valores previstos: `QR`, `SEARCH`):  
  Origen de la consulta. En el MVP todavía no se usa, pero el diseño lo contempla.

**Ejemplo de petición**

```http
GET /api/public/productos/MALBEC-RESERVA-2020?channel=QR
```

**Ejemplo de respuesta (éxito)**

```json
{
  "ok": true,
  "data": {
    "id": 12,
    "public_code": "MALBEC-RESERVA-2020",
    "name": "Malbec Reserva 2020",
    "drink_type": "vino",
    "winery": "Bodega Example",
    "varietal": "Malbec",
    "origin": "Mendoza, Argentina",
    "vintage_year": 2020,
    "short_description": "Reserva red wine, ideal for red meat.",
    "base_price": 4500.0,
    "visible_stock": 25,
    "image_url": "https://example.com/images/malbec_reserva_2020.jpg",
    "is_active": 1
  },
  "error": null
}
```

**Errores típicos**

- `404 Not Found` → producto no encontrado o no activo.
- `400 Bad Request` → `public_code` vacío.
- `500 Internal Server Error` → error inesperado.

---

### 3.3 Productos en promoción

**Endpoint**

```http
GET /api/public/productos/en-promocion
```

**Estado**

- ⏳ No implementado aún (diseño futuro).

**Descripción**

Mostrará productos activos con al menos una promoción vigente (`promotions`).

---

### 3.4 Productos más consultados

**Endpoint**

```http
GET /api/public/productos/mas-consultados
```

**Estado**

- ⏳ No implementado aún (diseño futuro).

**Descripción**

Mostrará productos ordenados por cantidad de consultas registradas en `consult_events`.

---

## 4. Endpoints administrativos – Autenticación

> **Estado:** No implementados (diseño para próximos sprints).

### 4.1 Login de administrador

```http
POST /api/admin/login
```

Cuerpo (JSON):

```json
{
  "username": "admin01",
  "password": "plain_text_password"
}
```

Respuesta de éxito (diseño):

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "username": "admin01",
    "full_name": "Main Administrator"
  },
  "error": null
}
```

### 4.2 Verificar sesión

```http
GET /api/admin/session
```

Respuesta con sesión activa (diseño):

```json
{
  "ok": true,
  "data": {
    "authenticated": true,
    "admin": {
      "id": 1,
      "username": "admin01",
      "full_name": "Main Administrator"
    }
  },
  "error": null
}
```

### 4.3 Logout

```http
POST /api/admin/logout
```

Respuesta (diseño):

```json
{
  "ok": true,
  "data": {
    "message": "Session closed successfully."
  },
  "error": null
}
```

---

## 5. Endpoints administrativos – Gestión de productos

### 5.1 Listar productos (admin)

```http
GET /api/admin/productos
```

**Estado:** diseño futuro.

Permite listar productos (incluyendo inactivos) con filtros y paginación.

---

### 5.2 Detalle de producto (admin)

```http
GET /api/admin/productos/{id}
```

**Estado:** diseño futuro.

---

### 5.3 Crear producto (MVP)

```http
POST /api/admin/productos
```

**Estado:** ✅ Implementado en Sprint 1 (sin validación de sesión todavía).

**Descripción**

Crea un producto nuevo en la tabla `products`.

**Cuerpo de la petición (JSON)**

```json
{
  "public_code": "MALBEC-RESERVA-2020",
  "name": "Malbec Reserva 2020",
  "drink_type": "vino",
  "winery": "Bodega Example",
  "varietal": "Malbec",
  "origin": "Mendoza, Argentina",
  "vintage_year": 2020,
  "short_description": "Reserva red wine",
  "base_price": 4500.0,
  "visible_stock": 25,
  "image_url": "https://example.com/images/malbec.jpg",
  "is_active": true
}
```

**Campos mínimos requeridos**

- `public_code`
- `name`
- `drink_type` (uno de: `vino`, `espumante`, `whisky`, `gin`, `licor`, `cerveza`, `otro`)
- `winery`
- `base_price` (> 0)

**Ejemplo de respuesta (éxito)**

```json
{
  "ok": true,
  "data": {
    "id": 15,
    "public_code": "MALBEC-RESERVA-2020",
    "name": "Malbec Reserva 2020",
    "drink_type": "vino",
    "winery": "Bodega Example",
    "varietal": "Malbec",
    "origin": "Mendoza, Argentina",
    "vintage_year": 2020,
    "short_description": "Reserva red wine",
    "base_price": 4500.0,
    "visible_stock": 25,
    "image_url": "https://example.com/images/malbec.jpg",
    "is_active": 1
  },
  "error": null
}
```

**Errores típicos**

- Falta de campos:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": {
      "name": "Field is required.",
      "base_price": "Must be a positive number."
    }
  }
}
```

- Código público duplicado:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": {
      "public_code": "This public code is already in use."
    }
  }
}
```

---

### 5.4 Actualizar producto

```http
PUT /api/admin/productos/{id}
```

**Estado:** diseño futuro.

---

### 5.5 Cambiar estado de producto

```http
PATCH /api/admin/productos/{id}/estado
```

**Estado:** diseño futuro.

---

## 6. Endpoints administrativos – Promociones

> Todo lo siguiente está definido a nivel de diseño para futuros sprints.

### 6.1 Listar promociones

```http
GET /api/admin/promociones
```

### 6.2 Crear promoción

```http
POST /api/admin/promociones
```

Ejemplo de cuerpo:

```json
{
  "product_id": 12,
  "promotion_type": "percentage",
  "parameter_value": 20.0,
  "visible_text": "20% OFF paying cash",
  "start_at": "2025-01-01T00:00:00",
  "end_at": "2025-01-31T23:59:59",
  "is_active": true
}
```

### 6.3 Actualizar promoción

```http
PUT /api/admin/promociones/{id}
```

### 6.4 Cambiar estado de promoción

```http
PATCH /api/admin/promociones/{id}/estado
```

---

## 7. Endpoints administrativos – Métricas

### 7.1 Productos más consultados (admin)

```http
GET /api/admin/metricas/productos-mas-consultados
```

### 7.2 Consultas diarias

```http
GET /api/admin/metricas/consultas-diarias
```

---

## 8. Seguridad y buenas prácticas

- Los endpoints `/api/admin/...` deben validar sesión de administrador cuando se implemente el login.
- Nunca se exponen contraseñas.
- Todas las consultas usan **prepared statements** para evitar SQL injection.
- Las respuestas de error no deben revelar información sensible (detalles de la BD, stack traces, etc.).

---

## 9. Flujo de ejemplo

### 9.1 Cliente que escanea un QR

1. El cliente escanea un QR que contiene la URL del producto.
2. La PWA llama a:

   ```http
   GET /api/public/productos/{public_code}?channel=QR
   ```

3. La API devuelve la ficha del producto (y en el futuro registrará el evento en `consult_events`).

### 9.2 Administrador creando un producto

1. El admin completa un formulario en el panel.
2. El frontend envía:

   ```http
   POST /api/admin/productos
   ```

   con el JSON de alta.
3. La API valida e inserta el registro en `products`.
4. Devuelve `201 Created` con el producto creado.

---

## 10. Resumen

La API REST de WINE-PICK-QR:

- En el **MVP (Sprint 1)** implementa:
  - Búsqueda de productos.
  - Consulta por código/QR.
  - Alta básica de productos.

- Está diseñada para crecer con:
  - Gestión completa de productos y promociones.
  - Métricas de uso.
  - Autenticación de administradores basada en sesión.

Este documento debe mantenerse actualizado a medida que se completen los sprints y se añadan nuevos endpoints o cambios en los existentes.
