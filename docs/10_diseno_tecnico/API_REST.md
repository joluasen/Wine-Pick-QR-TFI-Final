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

## Estado de implementación (Sprint 1)

### Endpoints completados ✅

- **GET /api/public/productos/{codigo}** – Obtener producto por código público (QR).
- **GET /api/public/productos?search=...** – Búsqueda de productos por texto.
- **POST /api/admin/productos** – Crear nuevo producto.

### Estructura técnica implementada

- **Router simple** (`app/Utils/Router.php`): enrutador que mapea URLs a controladores.
- **Clase Database** (`app/Utils/Database.php`): manejo de conexiones MySQLi con prepared statements.
- **Modelo Product** (`app/Models/Product.php`): lógica de acceso a datos.
- **Controlador ProductController** (`app/Controllers/ProductController.php`): lógica de negocio.
- **Respuestas JSON uniforme** (`app/Utils/JsonResponse.php`): formato consistente.

### Base de datos

- Tablas creadas: `admin_users`, `products`, `promotions`, `consult_events`.
- Datos de prueba insertados: 6 productos de ejemplo.

### Notas

- La autenticación de administradores aún no está implementada (los endpoints admin aceptan cualquier petición).
- El registro de eventos de consulta (`consult_events`) se implementará en próximos sprints.
- Validaciones avanzadas (JSON Schema, etc.) se añadirán en iteraciones posteriores.

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
  - `short_description`
  - `winery_distillery`
  - `varietal`
  - `origin`

En el MVP actual el límite es fijo (20 resultados). La paginación se implementará en futuros sprints.

**Ejemplo de petición**

```http
GET /api/public/productos?search=bodega
```

**Ejemplo de respuesta (éxito)**

```json
{
  "ok": true,
  "data": {
    "count": 2,
    "products": [
      {
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
        "updated_at": "2025-12-04 21:02:28"
      },
      {
        "id": 2,
        "public_code": "CABERNET-750-001",
        "name": "Cabernet Sauvignon 750ml",
        "drink_type": "vino",
        "winery_distillery": "Bodega Ejemplo",
        "varietal": "Cabernet Sauvignon",
        "origin": "Mendoza, Argentina",
        "vintage_year": 2020,
        "short_description": "Cabernet con buena estructura y notas de roble.",
        "base_price": 5200.00,
        "visible_stock": 18,
        "image_url": null,
        "is_active": true,
        "created_at": "2025-12-04 21:02:28",
        "updated_at": "2025-12-04 21:02:28"
      }
    ]
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

- `codigo` (obligatorio, `string`): código público del producto, el mismo incluido en el QR.

**Ejemplo de petición**

```http
GET /api/public/productos/MALBEC-RES-750-001
```

**Ejemplo de respuesta (éxito)**

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
    "updated_at": "2025-12-04 21:02:28"
  },
  "error": null
}
```

**Errores típicos**

- `404 Not Found` → producto no encontrado o no activo.
- `500 Internal Server Error` → error inesperado.

**Ejemplo de respuesta (error 404)**

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Producto no encontrado."
  }
}
```

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

**Cuerpo de la petición (JSON) – Mínimo**

```json
{
  "public_code": "MALBEC-RES-2021",
  "name": "Malbec Reserva 2021",
  "drink_type": "vino",
  "winery_distillery": "Bodega Ejemplo",
  "base_price": 5500.00
}
```

**Cuerpo de la petición (JSON) – Completo**

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

**Campos requeridos**

- `public_code` (string, único): código público del producto.
- `name` (string): nombre del producto.
- `drink_type` (enum): uno de: `vino`, `espumante`, `whisky`, `gin`, `licor`, `cerveza`, `otro`.
- `winery_distillery` (string): nombre de la bodega o destilería.
- `base_price` (number): precio base (debe ser > 0).

**Campos opcionales**

- `varietal` (string): tipo de varietal (ej: Malbec, Chardonnay).
- `origin` (string): origen geográfico (ej: Mendoza, Argentina).
- `vintage_year` (int): año de cosecha.
- `short_description` (string): descripción corta.
- `visible_stock` (int): stock visible en tienda.
- `image_url` (string): URL de la imagen del producto.
- `is_active` (bool): si el producto está activo (por defecto: 1).

**Ejemplo de respuesta (éxito 201 Created)**

```json
{
  "ok": true,
  "data": {
    "id": 7,
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
    "is_active": true,
    "created_at": "2025-12-05 01:10:00",
    "updated_at": "2025-12-05 01:10:00"
  },
  "error": null
}
```
    "image_url": "https://example.com/images/malbec.jpg",
    "is_active": 1
  },
  "error": null
}
```

**Errores típicos – Falta de campo requerido**

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo \"name\" es requerido.",
    "details": {
      "field": "name"
    }
  }
}
```

**Errores típicos – Campo drink_type inválido**

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El \"drink_type\" no es válido. Valores aceptados: vino, espumante, whisky, gin, licor, cerveza, otro",
    "details": {
      "field": "drink_type",
      "valid_values": ["vino", "espumante", "whisky", "gin", "licor", "cerveza", "otro"]
    }
  }
}
```

**Errores típicos – Código público duplicado**

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ya existe un producto con este código (public_code).",
    "details": {
      "field": "public_code",
      "error": "Duplicate entry 'MALBEC-RES-2021' for key 'uq_products_public_code'"
    }
  }
}
```

**Errores típicos – Precio inválido**

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El \"base_price\" debe ser mayor a 0.",
    "details": {
      "field": "base_price"
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
