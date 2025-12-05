# Pruebas Postman - API REST WINE-PICK-QR

Este documento contiene ejemplos de peticiones HTTP para probar manualmente los endpoints de la API REST usando Postman u otra herramienta similar.

---

## Configuración Base

**URL Base:** `http://localhost/proyectos/Wine-Pick-QR-TFI`

**Headers recomendados para todas las peticiones:**
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

**Headers:**
```
Content-Type: application/json
```

**Body:** (vacío)

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
    "updated_at": "2025-12-04 21:02:28"
  },
  "error": null
}
```

---

### 1.2 Obtener Producto - Código Inexistente

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos/CODIGO-INVALIDO
```

**Headers:**
```
Content-Type: application/json
```

**Body:** (vacío)

**Respuesta esperada:** 404 Not Found
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

### 1.3 Búsqueda de Productos

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=malbec
```

**Headers:**
```
Content-Type: application/json
```

**Body:** (vacío)

**Respuesta esperada:** 200 OK
```json
{
  "ok": true,
  "data": {
    "count": 1,
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
      }
    ]
  },
  "error": null
}
```

---

### 1.4 Búsqueda de Productos - Otro Término

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=bodega
```

**Headers:**
```
Content-Type: application/json
```

**Body:** (vacío)

**Respuesta esperada:** 200 OK con múltiples resultados (todos los productos con "bodega" en el nombre)

---

### 1.5 Búsqueda sin Parámetro

**Método:** `GET`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=
```

**Headers:**
```
Content-Type: application/json
```

**Body:** (vacío)

**Respuesta esperada:** 400 Bad Request
```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El parámetro \"search\" es requerido y no puede estar vacío."
  }
}
```

---

## 2. Endpoints Administrativos

### 2.1 Crear Producto - Caso Exitoso

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Headers:**
```
Content-Type: application/json
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
  "short_description": "Tempranillo con envejecimiento en roble, notas elegantes y complejas.",
  "base_price": 6500.00,
  "visible_stock": 15,
  "image_url": "https://example.com/images/tempranillo_2022.jpg",
  "is_active": 1
}
```

**Respuesta esperada:** 201 Created
```json
{
  "ok": true,
  "data": {
    "id": 11,
    "public_code": "TEMPRANILLO-RESERVA-2022",
    "name": "Tempranillo Reserva 2022",
    "drink_type": "vino",
    "winery_distillery": "Bodega Premium",
    "varietal": "Tempranillo",
    "origin": "La Rioja, España",
    "vintage_year": 2022,
    "short_description": "Tempranillo con envejecimiento en roble, notas elegantes y complejas.",
    "base_price": 6500.00,
    "visible_stock": 15,
    "image_url": "https://example.com/images/tempranillo_2022.jpg",
    "is_active": true,
    "created_at": "2025-12-05 14:30:00",
    "updated_at": "2025-12-05 14:30:00"
  },
  "error": null
}
```

---

### 2.2 Crear Producto - Mínimo (Solo Campos Requeridos)

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Headers:**
```
Content-Type: application/json
```

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

**Respuesta esperada:** 201 Created
```json
{
  "ok": true,
  "data": {
    "id": 12,
    "public_code": "SYRAH-2023-01",
    "name": "Syrah 2023",
    "drink_type": "vino",
    "winery_distillery": "Bodega Valor",
    "varietal": null,
    "origin": null,
    "vintage_year": null,
    "short_description": null,
    "base_price": 4200.50,
    "visible_stock": null,
    "image_url": null,
    "is_active": true,
    "created_at": "2025-12-05 14:35:00",
    "updated_at": "2025-12-05 14:35:00"
  },
  "error": null
}
```

---

### 2.3 Crear Producto - Sin Campo Requerido (name)

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Headers:**
```
Content-Type: application/json
```

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

### 2.4 Crear Producto - Código Duplicado

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "public_code": "MALBEC-RES-750-001",
  "name": "Malbec Reserva Duplicado",
  "drink_type": "vino",
  "winery_distillery": "Otra Bodega",
  "base_price": 5000.00
}
```

**Respuesta esperada:** 400 Bad Request
```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ya existe un producto con este código (public_code).",
    "details": {
      "field": "public_code",
      "error": "Duplicate entry 'MALBEC-RES-750-001' for key 'uq_products_public_code'"
    }
  }
}
```

---

### 2.5 Crear Producto - drink_type Inválido

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "public_code": "BEBIDA-RARA-01",
  "name": "Bebida Rara",
  "drink_type": "bebida_inexistente",
  "winery_distillery": "Bodega X",
  "base_price": 5000.00
}
```

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

### 2.6 Crear Producto - Precio Inválido (<=0)

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "public_code": "GRATIS-01",
  "name": "Producto Gratis",
  "drink_type": "vino",
  "winery_distillery": "Bodega Caridad",
  "base_price": 0
}
```

**Respuesta esperada:** 400 Bad Request
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

### 2.7 Crear Producto - Gin

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "public_code": "GIN-BOTANICO-2025",
  "name": "Gin Botánico Premium",
  "drink_type": "gin",
  "winery_distillery": "Destilería Aromática",
  "varietal": "Junípero Francés",
  "origin": "París, Francia",
  "short_description": "Gin destilado con botánicos selectos, ideal para cockteles sofisticados.",
  "base_price": 7800.00,
  "visible_stock": 10
}
```

**Respuesta esperada:** 201 Created

---

### 2.8 Crear Producto - Cerveza

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "public_code": "CERVEZA-ARTESANAL-IPA",
  "name": "Cerveza Artesanal IPA 473ml",
  "drink_type": "cerveza",
  "winery_distillery": "Cervecería Hoppy",
  "short_description": "IPA artesanal con abundante lúpulo y amargor balanceado.",
  "base_price": 320.00,
  "visible_stock": 50
}
```

**Respuesta esperada:** 201 Created

---

### 2.9 Crear Producto - Whisky

**Método:** `POST`

**URL:**
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "public_code": "WHISKY-ESCOCES-12Y",
  "name": "Whisky Escocés 12 Años",
  "drink_type": "whisky",
  "winery_distillery": "Destilería Highland",
  "origin": "Escocia",
  "short_description": "Whisky single malt con notas ahumadas y toques de vainilla.",
  "base_price": 8500.00,
  "visible_stock": 8
}
```

**Respuesta esperada:** 201 Created

---

## 3. Casos de Prueba Recomendados

### Prueba Completa (Secuencia)

1. **Obtener producto existente** → GET MALBEC
2. **Obtener producto inexistente** → 404
3. **Buscar productos** → search=bodega (múltiples resultados)
4. **Crear producto nuevo** → POST con todos los campos
5. **Crear producto mínimo** → POST con solo campos requeridos
6. **Intentar duplicar código** → POST con código existente
7. **Intentar drink_type inválido** → 400 validation error
8. **Intentar precio negativo** → 400 validation error

---

## 4. Notas Importantes

- **Headers**: Siempre incluir `Content-Type: application/json`
- **Charset**: La API soporta caracteres especiales (acentos, ñ, etc.)
- **Códigos**: Los `public_code` deben ser únicos, usar prefijos para no generar conflictos
- **Precios**: Usar números decimales (ej: 5500.00, 4200.50)
- **Stocks**: Puede ser null si no se especifica
- **Booleanos**: Usar `1` o `true` (ambos funcionan)
- **Status HTTP**: 
  - 200 = Éxito en GET
  - 201 = Éxito en POST (created)
  - 400 = Error de validación
  - 404 = No encontrado
  - 500 = Error interno

---

## 5. URLs de Prueba Rápida (copia y pega)

### GET - Producto por código
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos/MALBEC-RES-750-001
```

### GET - Búsqueda
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos?search=bodega
```

### POST - Crear producto
```
http://localhost/proyectos/Wine-Pick-QR-TFI/api/admin/productos
```

---

**Última actualización:** 4 de diciembre de 2025
**Estado:** MVP Sprint 1 ✅
