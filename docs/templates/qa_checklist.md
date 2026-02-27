# QA Checklist (rápido)

Verificación de calidad para WINE-PICK-QR — MVP 1.0.0

- [x] **Validación de formularios (requeridos, formatos):** Login valida campos obligatorios; formulario de producto valida código, nombre, tipo, bodega, precio; formulario de promoción valida fechas y superposición; cambio de contraseña valida mínimo 8 caracteres, mayúsculas, minúsculas y caracteres especiales.

- [x] **Autenticación y autorización (accesos correctos):** Login con JWT en cookie HttpOnly; token expira en 30 min; rutas admin protegidas redirigen a login; API retorna 401 sin token válido; logout elimina cookie.

- [x] **Mensajes de error claros y auditables (logs básicos):** Errores de validación indican el campo con problema; login incorrecto muestra mensaje genérico (no revela qué dato está mal); logs en desarrollo (`logs/debug.log`).

- [x] **Rendimiento vistas clave (<3s):** Ficha de producto < 1s; búsqueda con sugerencias < 1s; listados paginados; sin frameworks JS pesados; librerías desde CDN.

- [x] **SQL seguro (sin inyecciones; consultas parametrizadas):** Prepared statements en todas las consultas; sin concatenación de datos de usuario; validación de tipos en backend.

- [x] **Backups y restore probados (mínimo 1):** Script `database/database.sql` probado; `database/seed.sql` para datos de prueba; proceso de backup/restore documentado en delivery_package.md.

- [x] **Responsivo móvil/desktop en pantallas críticas:** Probado en 320px-480px (móvil), 768px-1024px (tablet), 1024px+ (desktop); Bootstrap 5 para layout responsive.

- [x] **Accesibilidad mínima (labels, foco, contraste):** Labels en formularios; botones con texto descriptivo; contraste adecuado con tema Bootstrap; botón QR flotante visible.

- [x] **Pruebas de regresión en flujos principales:** Cliente escanea QR → ve ficha; cliente busca → ve ficha; admin login → CRUD productos → CRUD promociones → métricas → logout. Todos los flujos verificados.

---

**Estado general:** MVP aprobado para entrega (74 verificaciones detalladas aprobadas).
**Responsable QA:** Rusch Esteban Alberto
**Fecha:** Febrero 2026
