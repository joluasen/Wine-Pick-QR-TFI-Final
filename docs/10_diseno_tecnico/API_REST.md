
# API REST – WINE-PICK-QR

Este documento describe la **API REST** de WINE-PICK-QR, especificando:

- Endpoints disponibles.
- Métodos HTTP utilizados.
- Parámetros de entrada.
- Estructura general de las respuestas.
- Códigos de error más frecuentes.
- Relación de cada endpoint con el modelo de datos (`productos`, `promociones`, `eventos_consulta`, `usuarios_admin`).

El objetivo principal es proporcionar una referencia clara para:

- La implementación del frontend (PWA).
- La defensa técnica del proyecto.
- Futuras tareas de mantenimiento o extensión del sistema.

---

## 1. Convenciones generales

### 1.1 Base de la API

A efectos de documentación, se asumirá una URL base de la API:

```text
/api
```

Ejemplos:

- `/api/public/productos`
- `/api/admin/productos`
- `/api/admin/metricas/productos-mas-consultados`

En un entorno real, esta base suele ir precedida por el dominio:

```text
https://dominio.com/api/...
```

### 1.2 Formato de datos

- Las peticiones que envían datos (por ejemplo, `POST` y `PUT`) deben utilizar **JSON** en el cuerpo.
- Las respuestas de la API se devuelven en formato **JSON**.

### 1.3 Estructura general de la respuesta

Se adopta una estructura uniforme para todas las respuestas:

#### Éxito

```json
{
  "ok": true,
  "data": {
    "...": "..."
  },
  "meta": {
    "...": "..."
  }
}
```

- `ok`: indica si la operación fue exitosa.
- `data`: contiene el resultado principal (objeto, lista, etc.).
- `meta`: metadatos opcionales (paginación, totales, mensajes adicionales, etc.).

#### Error

```json
{
  "ok": false,
  "error": {
    "code": "CODIGO_INTERNO",
    "message": "Descripción breve en lenguaje claro",
    "details": {
      "...": "..."
    }
  }
}
```

- `code`: código interno de error (por ejemplo, `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`).
- `message`: mensaje legible para el consumidor de la API.
- `details`: campo opcional con información adicional (por ejemplo, errores de validación por campo).

### 1.4 Códigos de estado HTTP

Se utilizan códigos estándar:

- `200 OK` – Petición exitosa.
- `201 Created` – Recurso creado correctamente.
- `400 Bad Request` – Error de validación o parámetros incorrectos.
- `401 Unauthorized` – Falta autenticación válida para el recurso solicitado.
- `403 Forbidden` – Autenticado, pero sin permisos para la operación.
- `404 Not Found` – Recurso no encontrado.
- `500 Internal Server Error` – Error no controlado en el servidor.

---

## 2. Autenticación y sesiones

WINE-PICK-QR utiliza **sesiones de servidor** para la autenticación de administradores, no JWT.

- Las operaciones **públicas** (búsqueda y consulta de fichas) **no requieren autenticación**.
- Las operaciones de **administración** (gestión de productos, promociones y métricas) requieren:
  - Login previo.
  - Una sesión activa asociada a la cookie de sesión que envía el navegador.

En la práctica:

1. El frontend envía usuario/contraseña al endpoint de login.
2. El backend valida, inicia sesión y devuelve una respuesta de éxito.
3. El navegador guarda automáticamente la cookie de sesión.
4. En las siguientes peticiones a endpoints `/api/admin/...`, la API verifica la sesión antes de procesar.

---

## 3. Endpoints públicos

Estos endpoints pueden ser utilizados sin autenticación y están pensados para el **cliente final** y el **personal del local**.

### 3.1 Buscar productos

**Endpoint**

```http
GET /api/public/productos
```

**Descripción**

Devuelve un listado de productos **activos**, permitiendo búsquedas y filtros básicos.  
Se utiliza para:

- Búsqueda por texto (nombre, bodega/destilería, varietal, tipo de bebida).
- Navegación general desde la PWA.

**Parámetros de consulta (query)**

- `q` (opcional, `string`):  
  Cadena de búsqueda general. Se puede aplicar a `nombre`, `bodega_destileria`, `varietal`.

- `tipo_bebida` (opcional, `string`):  
  Filtro por tipo de bebida (`vino`, `espumante`, `whisky`, `gin`, `licor`, `cerveza`, `otro`).

- `pagina` (opcional, `int`, por defecto 1):  
  Página de resultados (para paginación).

- `limite` (opcional, `int`, por defecto 20):  
  Cantidad de resultados por página (límite razonable).

**Ejemplo de petición**

```http
GET /api/public/productos?q=malbec&tipo_bebida=vino&pagina=1&limite=10
```

**Ejemplo de respuesta (éxito)**

```json
{
  "ok": true,
  "data": [
    {
      "id_producto": 12,
      "codigo_publico": "MALBEC-RESERVA-2020",
      "nombre": "Malbec Reserva 2020",
      "tipo_bebida": "vino",
      "bodega_destileria": "Bodega Ejemplo",
      "varietal": "Malbec",
      "origen": "Mendoza, Argentina",
      "precio_base": 4500.00,
      "en_promocion": true
    }
  ],
  "meta": {
    "pagina": 1,
    "limite": 10,
    "total_resultados": 3,
    "total_paginas": 1
  }
}
```

---

### 3.2 Obtener ficha de producto por código público (uso con QR)

**Endpoint**

```http
GET /api/public/productos/{codigo_publico}
```

**Descripción**

Devuelve la **ficha completa** de un producto a partir de su `codigo_publico`.  
Está pensada para:

- Ser llamada cuando el cliente escanea el **código QR**.
- Ser utilizada también desde la PWA cuando se selecciona un producto.

Además de devolver la ficha:

- Registra automáticamente un **evento de consulta** en la tabla `eventos_consulta`, indicando:
  - Producto.
  - Fecha/hora.
  - Canal (`QR` o `BUSQUEDA`, según se indique).

**Parámetros de ruta**

- `codigo_publico` (obligatorio, `string`):  
  Identificador público del producto (mismo valor codificado en el QR).

**Parámetros de consulta (query)**

- `canal` (opcional, `string`, valores permitidos: `QR`, `BUSQUEDA`):  
  Indica el origen de la consulta para registrarlo en métricas.
  - Si no se envía, el sistema puede asumir un valor por defecto (`QR`).

**Ejemplo de petición**

```http
GET /api/public/productos/MALBEC-RESERVA-2020?canal=QR
```

**Ejemplo de respuesta (éxito)**

```json
{
  "ok": true,
  "data": {
    "id_producto": 12,
    "codigo_publico": "MALBEC-RESERVA-2020",
    "nombre": "Malbec Reserva 2020",
    "tipo_bebida": "vino",
    "bodega_destileria": "Bodega Ejemplo",
    "varietal": "Malbec",
    "origen": "Mendoza, Argentina",
    "anada": 2020,
    "descripcion_corta": "Vino tinto Malbec reserva, ideal para carnes rojas.",
    "precio_base": 4500.00,
    "precio_final": 3600.00,
    "en_promocion": true,
    "promocion": {
      "tipo_promocion": "porcentaje",
      "valor_parametro": 20.00,
      "descripcion_visible": "20% OFF pagando en efectivo",
      "fecha_inicio": "2025-01-01T00:00:00",
      "fecha_fin": "2025-01-31T23:59:59"
    },
    "stock_visible": 25,
    "url_imagen": "https://ejemplo.com/imagenes/malbec_reserva_2020.jpg"
  },
  "meta": {}
}
```

**Posibles errores**

- `404 Not Found` → Producto no encontrado o no activo.
- `400 Bad Request` → `codigo_publico` inválido (formato no permitido).

---

### 3.3 Listar productos en promoción

**Endpoint**

```http
GET /api/public/productos/en-promocion
```

**Descripción**

Devuelve un listado de productos **activos** que tienen alguna promoción **vigente y activa**.  
Útil para la sección de “productos en promoción” de la PWA.

**Parámetros de consulta (query)**

- `pagina` (opcional, `int`, por defecto 1).
- `limite` (opcional, `int`, por defecto 20).

**Ejemplo de petición**

```http
GET /api/public/productos/en-promocion?pagina=1&limite=12
```

**Ejemplo de respuesta (éxito)**

```json
{
  "ok": true,
  "data": [
    {
      "id_producto": 12,
      "codigo_publico": "MALBEC-RESERVA-2020",
      "nombre": "Malbec Reserva 2020",
      "tipo_bebida": "vino",
      "bodega_destileria": "Bodega Ejemplo",
      "precio_base": 4500.00,
      "precio_final": 3600.00,
      "promocion": {
        "tipo_promocion": "porcentaje",
        "valor_parametro": 20.00,
        "descripcion_visible": "20% OFF pagando en efectivo"
      }
    }
  ],
  "meta": {
    "pagina": 1,
    "limite": 12,
    "total_resultados": 5,
    "total_paginas": 1
  }
}
```

---

### 3.4 Listar productos más consultados

**Endpoint**

```http
GET /api/public/productos/mas-consultados
```

**Descripción**

Devuelve un listado de productos ordenados por la cantidad de consultas registradas en `eventos_consulta`, combinando:

- Consultas por QR.
- Consultas por búsqueda.

Es útil para la sección de **“más consultados”** visible tanto a clientes como a administradores.

**Parámetros de consulta (query)**

- `limite` (opcional, `int`, por defecto 10):  
  Máximo de productos a devolver.

- `fecha_desde` (opcional, `date` en formato `YYYY-MM-DD`):  
  Límite inferior para considerar eventos.

- `fecha_hasta` (opcional, `date` en formato `YYYY-MM-DD`):  
  Límite superior para considerar eventos.

Si no se especifican fechas, se considera un rango por defecto (por ejemplo, últimos 30 días, según decisión de implementación).

**Ejemplo de petición**

```http
GET /api/public/productos/mas-consultados?limite=5
```

**Ejemplo de respuesta (éxito)**

```json
{
  "ok": true,
  "data": [
    {
      "id_producto": 12,
      "codigo_publico": "MALBEC-RESERVA-2020",
      "nombre": "Malbec Reserva 2020",
      "tipo_bebida": "vino",
      "bodega_destileria": "Bodega Ejemplo",
      "total_consultas": 45
    },
    {
      "id_producto": 7,
      "codigo_publico": "GIN-PREMIUM",
      "nombre": "Gin Premium",
      "tipo_bebida": "gin",
      "bodega_destileria": "Destilería Ejemplo",
      "total_consultas": 32
    }
  ],
  "meta": {
    "limite": 5,
    "fecha_desde": "2025-01-01",
    "fecha_hasta": "2025-01-31"
  }
}
```

---

## 4. Endpoints administrativos – Autenticación

Los endpoints bajo `/api/admin/...` requieren que el administrador tenga una sesión válida.

### 4.1 Login de administrador

**Endpoint**

```http
POST /api/admin/login
```

**Descripción**

Autentica a un usuario administrador.  
Si las credenciales son correctas:

- Inicia una sesión en el servidor.
- Devuelve información básica del usuario (sin exponer la contraseña).

**Cuerpo de la petición (JSON)**

```json
{
  "usuario": "admin01",
  "contrasena": "clave_en_texto_plano"
}
```

**Ejemplo de respuesta (éxito)**

```json
{
  "ok": true,
  "data": {
    "id_admin": 1,
    "usuario": "admin01",
    "nombre_completo": "Administrador Principal"
  },
  "meta": {}
}
```

**Posibles errores**

- `401 Unauthorized` → Credenciales inválidas.
- `400 Bad Request` → Campos faltantes o formato inválido.

---

### 4.2 Verificar sesión

**Endpoint**

```http
GET /api/admin/session
```

**Descripción**

Permite al frontend comprobar si hay una sesión de administrador activa.  
Útil al cargar el panel de administración, para decidir si se muestra el login o directamente el contenido.

**Ejemplo de respuesta (sesión activa)**

```json
{
  "ok": true,
  "data": {
    "autenticado": true,
    "admin": {
      "id_admin": 1,
      "usuario": "admin01",
      "nombre_completo": "Administrador Principal"
    }
  },
  "meta": {}
}
```

**Ejemplo de respuesta (sin sesión activa)**

```json
{
  "ok": true,
  "data": {
    "autenticado": false
  },
  "meta": {}
}
```

---

### 4.3 Logout de administrador

**Endpoint**

```http
POST /api/admin/logout
```

**Descripción**

Cierra la sesión del administrador activo.

**Ejemplo de respuesta**

```json
{
  "ok": true,
  "data": {
    "mensaje": "Sesión cerrada correctamente"
  },
  "meta": {}
}
```

---

## 5. Endpoints administrativos – Gestión de productos

### 5.1 Listar productos (administración)

**Endpoint**

```http
GET /api/admin/productos
```

**Descripción**

Devuelve un listado de productos con información completa, incluyendo productos desactivados (para gestión).

**Parámetros de consulta (query)**

- `q` (opcional): búsqueda general.
- `activo` (opcional, `0` o `1`): filtrado por estado.
- `pagina`, `limite` (opcional): paginación.

---

### 5.2 Obtener detalle de producto (administración)

**Endpoint**

```http
GET /api/admin/productos/{id_producto}
```

**Descripción**

Devuelve la información completa de un producto específico, incluyendo campos que no se muestran en la vista pública.

**Parámetros de ruta**

- `id_producto` (obligatorio, `int`): identificador interno del producto.

---

### 5.3 Crear producto

**Endpoint**

```http
POST /api/admin/productos
```

**Descripción**

Crea un nuevo producto en la base de datos.  
Genera un `codigo_publico` único (o lo acepta si viene en la petición, según la política definida).

**Cuerpo de la petición (JSON, ejemplo)**

```json
{
  "codigo_publico": "MALBEC-RESERVA-2020",
  "nombre": "Malbec Reserva 2020",
  "tipo_bebida": "vino",
  "bodega_destileria": "Bodega Ejemplo",
  "varietal": "Malbec",
  "origen": "Mendoza",
  "anada": 2020,
  "descripcion_corta": "Vino tinto Malbec reserva",
  "precio_base": 4500.00,
  "stock_visible": 25,
  "url_imagen": "https://..."
}
```

---

### 5.4 Actualizar producto

**Endpoint**

```http
PUT /api/admin/productos/{id_producto}
```

**Descripción**

Actualiza la información de un producto existente.

**Cuerpo de la petición (JSON, ejemplo)**

```json
{
  "nombre": "Malbec Reserva 2020",
  "descripcion_corta": "Actualización de descripción",
  "precio_base": 4800.00,
  "stock_visible": 20,
  "activo": 1
}
```

---

### 5.5 Desactivar producto

**Endpoint**

```http
PATCH /api/admin/productos/{id_producto}/estado
```

**Cuerpo (ejemplo)**

```json
{
  "activo": 0
}
```

---

## 6. Endpoints administrativos – Gestión de promociones

### 6.1 Listar promociones

**Endpoint**

```http
GET /api/admin/promociones
```

**Descripción**

Devuelve las promociones existentes.  
Se puede filtrar por producto.

**Parámetros de consulta**

- `id_producto` (opcional, `int`): filtra por producto.
- `activa` (opcional, `0` o `1`).

---

### 6.2 Crear promoción

**Endpoint**

```http
POST /api/admin/promociones
```

**Descripción**

Crea una promoción asociada a un producto.

**Cuerpo de la petición (JSON, ejemplo)**

```json
{
  "id_producto": 12,
  "tipo_promocion": "porcentaje",
  "valor_parametro": 20.00,
  "descripcion_visible": "20% OFF pagando en efectivo",
  "fecha_inicio": "2025-01-01T00:00:00",
  "fecha_fin": "2025-01-31T23:59:59",
  "activa": 1
}
```

---

### 6.3 Actualizar promoción

**Endpoint**

```http
PUT /api/admin/promociones/{id_promocion}
```

**Descripción**

Actualiza los campos de una promoción (valores, fechas, estado).

---

### 6.4 Desactivar promoción

**Endpoint**

```http
PATCH /api/admin/promociones/{id_promocion}/estado
```

**Cuerpo (ejemplo)**

```json
{
  "activa": 0
}
```

---

## 7. Endpoints administrativos – Métricas

### 7.1 Productos más consultados (vista administrativa)

**Endpoint**

```http
GET /api/admin/metricas/productos-mas-consultados
```

**Parámetros de consulta**

- `fecha_desde` (opcional, `YYYY-MM-DD`).
- `fecha_hasta` (opcional, `YYYY-MM-DD`).
- `limite` (opcional, `int`, por defecto 10).

---

### 7.2 Consultas diarias

**Endpoint**

```http
GET /api/admin/metricas/consultas-diarias
```

**Descripción**

Devuelve una serie de datos agregados por día (cantidad de consultas totales y por canal).

---

## 8. Consideraciones de seguridad y uso correcto

- Todos los endpoints bajo `/api/admin/...` deben verificar que exista una **sesión válida** de administrador.
- No se exponen contraseñas en ninguna respuesta.
- Las entradas (parámetros y cuerpos JSON) deben:
  - Validarse a nivel de formato.
  - Escaparse adecuadamente antes de participar en consultas a la base de datos.
- Los endpoints públicos no deben permitir operaciones de escritura ni exponer información sensible.

---

## 9. Ejemplo de flujo completo

### 9.1 Cliente escanea QR en góndola

1. El cliente escanea un código QR con la cámara.
2. El sistema operativo abre la URL del producto.
3. La PWA, al cargar esa ruta, llama a:

   ```http
   GET /api/public/productos/{codigo_publico}?canal=QR
   ```

4. La API:
   - Busca el producto.
   - Recupera la promoción vigente.
   - Registra `evento_consulta` con `canal = 'QR'`.
   - Devuelve la ficha.
5. La PWA muestra la ficha.

### 9.2 Administrador actualiza un precio

1. El administrador inicia sesión con `POST /api/admin/login`.
2. El navegador mantiene la cookie de sesión.
3. El administrador edita un producto.
4. El frontend envía `PUT /api/admin/productos/{id_producto}`.
5. La API valida la sesión, actualiza la base y responde con éxito.
6. Las nuevas consultas reflejan el precio actualizado.

---

## 10. Conclusión

Esta API REST soporta:

- La experiencia de consulta de productos por parte de los clientes.
- La gestión del catálogo, promociones y métricas por parte del administrador.
- La futura ampliación de funcionalidades sin modificar de forma radical la estructura actual de endpoints.

Su diseño se alinea con:

- El modelo de datos definido en `BASE_DE_DATOS_MER.md`.
- La arquitectura descrita en `ARQUITECTURA_TECNICA.md`.
- El alcance funcional del `README.md` principal.
