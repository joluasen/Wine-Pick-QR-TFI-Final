# WBS (Work Breakdown Structure) — WINE-PICK-QR

Descomposición por entregables y tareas.

> Regla: tareas de 4–16h mejoran la precisión; dividir más si supera 24h.

---

## 1. Kickoff y Diseño

- **ID:** WBS-1
- **Descripción:** Definición del proyecto, alcance, arquitectura y diseño de base de datos.
- **Supuestos/Exclusiones:** Cliente simulado (vinoteca modelo); sin integración con sistemas externos.

### Tareas

| ID  | Tarea                        | Rol | O (h) | M (h) | P (h) | E= (O+4M+P)/6 | σ=(P-O)/6 | Dependencias | Notas        |
| --- | ---------------------------- | --- | ----: | ----: | ----: | ------------: | --------: | ------------ | ------------ |
| 1.1 | Redactar Project Brief       | Dev |     2 |     3 |     4 |           3.0 |       0.3 | -            | -            |
| 1.2 | Definir historias de usuario | Dev |     4 |     6 |     8 |           6.0 |       0.7 | 1.1          | 14 HU        |
| 1.3 | Diseñar modelo de BD         | Dev |     3 |     4 |     6 |           4.2 |       0.5 | 1.2          | 4 tablas     |
| 1.4 | Crear script SQL             | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 1.3          | database.sql |
| 1.5 | Definir arquitectura MVC     | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 1.2          | -            |
| 1.6 | Configurar entorno XAMPP     | Dev |     1 |     2 |     3 |           2.0 |       0.3 | -            | -            |
| 1.7 | Crear estructura de carpetas | Dev |     1 |     2 |     2 |           1.8 |       0.2 | 1.5          | -            |

**Subtotal módulo:** 23h estimadas
**Buffers/Contingencia:** 15%
**Riesgos relevantes:** R-02 (scope creep)

---

## 2. Módulo Público

- **ID:** WBS-2
- **Descripción:** Funcionalidades de consulta para clientes (QR, búsqueda, ficha, promociones).
- **Supuestos/Exclusiones:** Solo lectura; sin carrito ni pagos.

### Tareas

| ID   | Tarea                                | Rol | O (h) | M (h) | P (h) | E= (O+4M+P)/6 | σ=(P-O)/6 | Dependencias | Notas         |
| ---- | ------------------------------------ | --- | ----: | ----: | ----: | ------------: | --------: | ------------ | ------------- |
| 2.1  | Implementar lector QR (html5-qrcode) | Dev |     6 |     8 |    12 |           8.3 |       1.0 | 1.7          | RF1           |
| 2.2  | Crear endpoint ficha producto        | Dev |     3 |     4 |     6 |           4.2 |       0.5 | 1.4          | RF5           |
| 2.3  | Implementar búsqueda por texto       | Dev |     4 |     6 |     8 |           6.0 |       0.7 | 2.2          | RF2           |
| 2.4  | Crear vista ficha de producto        | Dev |     4 |     5 |     7 |           5.2 |       0.5 | 2.2          | RF5           |
| 2.5  | Implementar cálculo de precio final  | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 2.4          | Con promoción |
| 2.6  | Crear listado de promociones         | Dev |     3 |     4 |     6 |           4.2 |       0.5 | 2.5          | RF3           |
| 2.7  | Crear listado más consultados        | Dev |     3 |     4 |     5 |           4.0 |       0.3 | 2.2          | RF4           |
| 2.8  | Implementar QR con URL completa      | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 2.1          | Cámara nativa |
| 2.9  | Estilos responsive móvil             | Dev |     4 |     6 |     8 |           6.0 |       0.7 | 2.4          | Bootstrap 5   |
| 2.10 | Registrar eventos de consulta        | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 2.2          | RF14, RF15    |

**Subtotal módulo:** 47h estimadas
**Buffers/Contingencia:** 15%
**Riesgos relevantes:** R-01 (compatibilidad QR), R-09 (tiempos de carga)

---

## 3. Panel de Administración

- **ID:** WBS-3
- **Descripción:** CRUD de productos, promociones, autenticación y métricas.
- **Supuestos/Exclusiones:** Un solo usuario admin; sin roles.

### Tareas

| ID   | Tarea                                | Rol | O (h) | M (h) | P (h) | E= (O+4M+P)/6 | σ=(P-O)/6 | Dependencias | Notas          |
| ---- | ------------------------------------ | --- | ----: | ----: | ----: | ------------: | --------: | ------------ | -------------- |
| 3.1  | Implementar login JWT                | Dev |     4 |     6 |     8 |           6.0 |       0.7 | 1.4          | RF18           |
| 3.2  | Proteger rutas admin                 | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 3.1          | RF19           |
| 3.3  | CRUD crear producto                  | Dev |     4 |     6 |     8 |           6.0 |       0.7 | 3.2          | RF6            |
| 3.4  | CRUD editar producto                 | Dev |     3 |     4 |     6 |           4.2 |       0.5 | 3.3          | RF7            |
| 3.5  | CRUD eliminar producto (soft delete) | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 3.3          | RF8            |
| 3.6  | Generación de código QR              | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 3.3          | qrcode.js      |
| 3.7  | Upload de imágenes                   | Dev |     3 |     4 |     6 |           4.2 |       0.5 | 3.3          | -              |
| 3.8  | CRUD crear promoción                 | Dev |     4 |     6 |     8 |           6.0 |       0.7 | 3.3          | RF10           |
| 3.9  | Validar superposición de promociones | Dev |     3 |     4 |     6 |           4.2 |       0.5 | 3.8          | RF12           |
| 3.10 | CRUD editar/eliminar promoción       | Dev |     3 |     4 |     5 |           4.0 |       0.3 | 3.8          | RF13           |
| 3.11 | Dashboard de métricas                | Dev |     4 |     6 |     8 |           6.0 |       0.7 | 2.10         | RF16, Chart.js |
| 3.12 | Filtro por período (7/30/90 días)    | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 3.11         | RF17           |
| 3.13 | Escaneo QR desde admin               | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 2.1          | RF9            |
| 3.14 | Cambio de contraseña                 | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 3.1          | -              |
| 3.15 | Logout                               | Dev |     1 |     2 |     2 |           1.8 |       0.2 | 3.1          | -              |

**Subtotal módulo:** 61h estimadas
**Buffers/Contingencia:** 15%
**Riesgos relevantes:** R-05 (promociones superpuestas), R-06 (acceso no autorizado)

---

## 4. PWA y Ajustes

- **ID:** WBS-4
- **Descripción:** Configuración de PWA, service worker y ajustes finales.
- **Supuestos/Exclusiones:** Caché básico; sin notificaciones push.

### Tareas

| ID  | Tarea                      | Rol | O (h) | M (h) | P (h) | E= (O+4M+P)/6 | σ=(P-O)/6 | Dependencias | Notas                 |
| --- | -------------------------- | --- | ----: | ----: | ----: | ------------: | --------: | ------------ | --------------------- |
| 4.1 | Crear manifest.json        | Dev |     1 |     2 |     2 |           1.8 |       0.2 | -            | -                     |
| 4.2 | Implementar service worker | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 4.1          | Instalabilidad básica |
| 4.3 | Botón de instalación       | Dev |     1 |     2 |     3 |           2.0 |       0.3 | 4.2          | -                     |
| 4.4 | Ajustes de UI/UX           | Dev |     4 |     6 |     8 |           6.0 |       0.7 | 2.9          | -                     |
| 4.5 | Corrección de bugs         | Dev |     4 |     6 |    10 |           6.3 |       1.0 | -            | Variable              |

**Subtotal módulo:** 19h estimadas
**Buffers/Contingencia:** 20%
**Riesgos relevantes:** R-03 (configuración hosting)

---

## 5. QA y Documentación

- **ID:** WBS-5
- **Descripción:** Pruebas de calidad, documentación técnica y de usuario.
- **Supuestos/Exclusiones:** Sin tests automatizados (pendiente para futuras versiones).

### Tareas

| ID  | Tarea                                | Rol | O (h) | M (h) | P (h) | E= (O+4M+P)/6 | σ=(P-O)/6 | Dependencias | Notas                |
| --- | ------------------------------------ | --- | ----: | ----: | ----: | ------------: | --------: | ------------ | -------------------- |
| 5.1 | Pruebas funcionales módulo público   | QA  |     3 |     4 |     6 |           4.2 |       0.5 | WBS-2        | -                    |
| 5.2 | Pruebas funcionales módulo admin     | QA  |     4 |     5 |     7 |           5.2 |       0.5 | WBS-3        | -                    |
| 5.3 | Pruebas de seguridad básica          | QA  |     2 |     3 |     4 |           3.0 |       0.3 | 3.1          | SQLi, XSS            |
| 5.4 | Pruebas responsive                   | QA  |     2 |     3 |     4 |           3.0 |       0.3 | 2.9          | Móvil/tablet/desktop |
| 5.5 | Completar templates de documentación | Dev |     6 |     8 |    12 |           8.3 |       1.0 | -            | 12 archivos          |
| 5.6 | Manual de usuario                    | Dev |     3 |     4 |     6 |           4.2 |       0.5 | WBS-2, WBS-3 | -                    |
| 5.7 | Manual técnico                       | Dev |     3 |     4 |     5 |           4.0 |       0.3 | -            | -                    |
| 5.8 | Preparar datos de prueba (seed)      | Dev |     2 |     3 |     4 |           3.0 |       0.3 | 1.4          | seed.sql             |

**Subtotal módulo:** 35h estimadas
**Buffers/Contingencia:** 10%
**Riesgos relevantes:** R-08 (falta de backups)

---

## Resumen WBS

### Estimación inicial vs Ejecución real

| Módulo                               | Horas estimadas | Horas reales | Desviación |
| ------------------------------------ | --------------: | -----------: | ---------- |
| Kickoff y diseño                     |              11 |           21 | +91%       |
| Módulo público (QR, búsqueda, ficha) |              23 |           32 | +39%       |
| Panel admin (CRUD productos)         |              18 |           39 | +117%      |
| Promociones y validaciones           |              14 |           26 | +86%       |
| Métricas y dashboard                 |              12 |           18 | +50%       |
| PWA y ajustes finales                |               8 |           20 | +150%      |
| QA y testing                         |               7 |           10 | +43%       |
| Documentación                        |               7 |            9 | +29%       |
| **TOTAL**                            |         **100** |      **175** | **+75%**   |

**Lecciones aprendidas:**

- La validación de promociones superpuestas tomó más tiempo del estimado
- El panel de administración requirió más iteraciones UX de lo previsto
- La documentación de 13 templates fue más exhaustiva que lo planificado

---

**Autores:** Rusch Esteban Alberto, Jorge Asensio
**Fecha:** Febrero 2026
