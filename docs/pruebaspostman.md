# Pruebas Postman - API REST WINE-PICK-QR

Este documento contiene ejemplos de peticiones HTTP para probar los endpoints de la API REST usando Postman.

---

## Configuración Base

**URL Base:** `http://localhost/proyectos/Wine-Pick-QR-TFI`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

---

## 1. Endpoints Públicos

### 1.1 Obtener Producto por Código (QR)

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos/MALBEC-RES-750-001
```

**Respuesta esperada:** 200 OK
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

---

### 1.2 Búsqueda Simple

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=malbec
```

**Respuesta esperada:** 200 OK

---

### 1.3 Búsqueda con Filtro de Precio

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=vino&min_price=500&max_price=2000
```

**Descripción:** Busca productos tipo "vino" con precio entre $500 y $2000.

---

### 1.4 Búsqueda con Año de Cosecha

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=malbec&vintage_year=2020
```

---

### 1.5 Búsqueda en Campo Específico

**Método:** `GET`

**URL (buscar en varietal):**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=malbec&field=varietal
```

**URL (buscar en origen):**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=mendoza&field=origin
```

**Campos válidos:** `name`, `drink_type`, `varietal`, `origin`, `public_code`

---

### 1.6 Búsqueda Completa con Filtros

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=vino&field=name&min_price=500&max_price=3000&vintage_year=2020&limit=10&offset=0
```

---

### 1.7 Paginación de Resultados

**Primera página:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=vino&limit=10&offset=0
```

**Segunda página:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=vino&limit=10&offset=10
```

**Tercera página:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=vino&limit=10&offset=20
```

---

### 1.8 Error de Validación

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos
```

**Respuesta esperada:** 400 Bad Request
```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El parámetro \"search\" es requerido y no puede estar vacío.",
    "details": {
      "field": "search"
    }
  }
}
```

---

### 1.9 Productos con Promociones Vigentes

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/promociones?limit=20&offset=0
```

---

### 1.10 Productos Más Buscados

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/mas-buscados?limit=10&offset=0
```

---

## 2. Autenticación

### 2.1 Login de Administrador

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/login
```

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "tu_password"
}
```

**Respuesta esperada:** 200 OK
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

---

### 2.2 Verificar Sesión

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/me
```

**Respuesta esperada:** 200 OK
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

---

### 2.3 Logout

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/logout
```

---

## 3. Endpoints Administrativos

### 3.1 Listar Todos los Productos

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos?limit=20&offset=0
```

**Requiere:** Sesión activa

**Respuesta esperada:** 200 OK
```json
{
  "ok": true,
  "data": {
    "count": 20,
    "total": 150,
    "products": [...]
  },
  "error": null
}
```

---

### 3.2 Crear Producto

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Body (JSON):**
```json
{
  "public_code": "TEMPRANILLO-RESERVA-2022",
  "name": "Tempranillo Reserva 2022",
  "drink_type": "vino",
  "winery_distillery": "Bodega Premium",
  "varietal": "Tempranillo",
  "origin": "La Rioja, España",
  "vintage_year": 2022,
  "short_description": "Tempranillo con envejecimiento en roble",
  "base_price": 6500.00,
  "visible_stock": 15,
  "image_url": null,
  "is_active": 1
}
```

**Respuesta esperada:** 201 Created

---

### 3.3 Crear Producto - Campos Mínimos

**Body (JSON):**
```json
{
  "public_code": "SYRAH-2023-01",
  "name": "Syrah 2023",
  "drink_type": "vino",
  "winery_distillery": "Bodega Valor",
  "base_price": 4200.50
}
```

---

### 3.4 Error - Campo Requerido Faltante

**Body (JSON):**
```json
{
  "public_code": "FERNET-BRANCA-01",
  "drink_type": "licor",
  "winery_distillery": "Distilería Branca",
  "base_price": 3500.00
}
```

**Respuesta esperada:** 400 Bad Request
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

---

### 3.5 Error - Código Duplicado

**Respuesta esperada:** 409 Conflict
```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "Ya existe un producto con este código (public_code)."
  }
}
```

---

### 3.6 Error - drink_type Inválido

**Respuesta esperada:** 400 Bad Request
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

---

### 3.7 Crear Promoción

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/promociones
```

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

**Tipos de promoción:** `porcentaje`, `precio_fijo`, `2x1`, `3x2`, `nxm`

**Respuesta esperada:** 201 Created

---

### 3.8 Listar Todas las Promociones

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/promociones?limit=10&offset=0
```

**Requiere:** Sesión activa

**Respuesta esperada:** 200 OK
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
        "visible_text": "25% OFF en Syrah",
        "start_at": "2025-01-01 00:00:00",
        "end_at": "2025-03-31 23:59:59",
        "is_active": true,
        "created_at": "2025-12-04 21:05:00"
      }
    ]
  },
  "error": null
}
```

---

### 3.9 Listar Promociones de un Producto

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/promociones?product_id=8
```

**Requiere:** Sesión activa

**Respuesta esperada:** 200 OK
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

---

## 4. Suite de Pruebas

### Secuencia Completa

1. **Login** → `POST /api/admin/login`
2. **Verificar Sesión** → `GET /api/admin/me`
3. **Búsqueda Simple** → `GET /api/public/productos?search=vino`
4. **Búsqueda con Filtros** → `GET /api/public/productos?search=vino&min_price=500&max_price=2000`
5. **Búsqueda por Campo** → `GET /api/public/productos?search=malbec&field=varietal`
6. **Paginación** → `GET /api/public/productos?search=vino&limit=5&offset=0`
7. **Listar Productos Admin** → `GET /api/admin/productos?limit=20&offset=0`
8. **Crear Producto** → `POST /api/admin/productos`
9. **Crear Promoción** → `POST /api/admin/promociones`
10. **Listar Promociones** → `GET /api/admin/promociones?limit=10&offset=0`
11. **Promociones por Producto** → `GET /api/admin/promociones?product_id=1`
12. **Logout** → `POST /api/admin/logout`

---

## 5. URLs Rápidas

### Públicos
```
# Producto por código
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos/MALBEC-RES-750-001

# Búsqueda simple
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=malbec

# Búsqueda con precio
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=vino&min_price=500&max_price=2000

# Búsqueda por campo
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=mendoza&field=origin

# Promociones vigentes
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/promociones?limit=20

# Más buscados
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/mas-buscados?limit=10
```

### Admin (requieren login)
```
# Login
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/login

# Listar productos
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos?limit=20&offset=0

# Crear producto
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos

# Listar promociones
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/promociones?limit=10&offset=0

# Promociones por producto
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/promociones?product_id=8

# Crear promoción
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/promociones
```

---

## 6. Notas

- **GET** se usa para consultas y búsquedas (query params)
- **POST** se usa para creación de recursos (JSON body)
- Los endpoints `/api/admin/*` requieren login previo
- La sesión se mantiene mediante cookie PHPSESSID
- Paginación: `limit` (max 100, default 20), `offset` (default 0)
- Filtros opcionales se ignoran si están vacíos

---

**Última actualización:** Diciembre 2025
