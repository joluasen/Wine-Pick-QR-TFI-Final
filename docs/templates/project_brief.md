# Project Brief

**Proyecto:** WINE-PICK-QR (02-12-2025 a 02-02-2026)

**Sponsor / Demandante:** Vinoteca modelo (caso de estudio académico para TFI – UTN)

**Stakeholders:**

- Rusch Esteban Alberto (Legajo: 17873) — Desarrollador y líder de producto
- Jorge Asensio — Desarrollador
- Tutor de cátedra — Evaluador académico
- Cliente final (simulado) — Persona que consulta productos en la vinoteca
- Administrador (simulado) — Dueño o encargado de la vinoteca
- Personal del local (simulado) — Vendedores y cajeros que asesoran al cliente

**Problema / Oportunidad (1–2 frases):**
En vinotecas, mantener precios actualizados en cartelería es costoso y genera fricción cuando no coinciden con caja. La oportunidad es digitalizar la consulta mediante QR y búsqueda, eliminando carteles físicos y capturando métricas de interés.

**Objetivo SMART:**
Desarrollar una PWA que permita a los clientes de una vinoteca consultar precios y promociones de productos mediante código QR o búsqueda por texto, sin necesidad de instalar una aplicación. El sistema incluye un panel de administración para gestionar el catálogo y visualizar métricas de consultas.

**Alcance (incluye / excluye):**

_Incluye:_

- Lectura de códigos QR (compatible con cámara nativa del celular)
- Búsqueda por nombre, bodega, varietal u origen
- Ficha de producto con precio final calculado en tiempo real
- Panel de administración con CRUD de productos y promociones
- Validación de superposición de promociones (un producto no puede tener dos promociones activas)
- Tipos de promoción: porcentaje, precio fijo, 2x1, 3x2, NxM
- Métricas de productos más consultados (últimos 7/30/90 días)
- Diferenciación de consultas por canal (QR vs búsqueda)
- PWA instalable desde el navegador

_Excluye:_

- Carrito de compras y pagos
- Registro de cuentas para clientes
- Gestión de stock y pedidos
- Soporte Multilenguaje
- Integración con facturación
- Motor de recomendaciones con IA

**Métricas de éxito (KPI):**

- 100% de historias de usuario del MVP implementadas
- Tiempo de consulta de producto menor a 3 segundos
- Todas las promociones vigentes se calculan correctamente
- El sistema registra consultas y muestra métricas por período
- Funciona en navegadores modernos de Android, iOS y escritorio

**Hitos y fechas:**

- Noviembre 2025 — Inicio del proyecto, documentación inicial
- Diciembre 2025 — Módulo público (QR, búsqueda, ficha de producto)
- Enero 2026 — Panel de administración (CRUD, promociones, métricas)
- 26-01-2026 — MVP funcional completo, preparación para entrega
- 02-02-2026 — Entrega y defensa del TFI

**Riesgos top-3 + mitigación:**

1. **Compatibilidad de cámara en navegadores móviles** — Usar librería probada (html5-qrcode) y ofrecer QR con URL completa para cámara nativa como alternativa.
2. **Exceso de alcance que impida llegar al MVP** — Mantener foco en funcionalidades Must have, dejar el resto para futuras versiones.
3. **Problemas de configuración en hosting** — Realizar pruebas tempranas de despliegue y documentar los pasos.

**Canales y frecuencia de comunicación:**
Seguimiento asincrónico con el tutor de cátedra según calendario académico, con revisiones en los hitos principales.

**Ambiente técnico (alto nivel):**

- Frontend: HTML5, CSS3, Bootstrap 5, JavaScript vanilla (ES Modules), PWA
- Backend: PHP 8.x con patrón MVC, API REST (JSON)
- Base de datos: MySQL 8.x (productos, promociones, admin_users, consult_events)
- Seguridad: JWT en cookie HttpOnly, password_hash, prepared statements
- Librerías: html5-qrcode, qrcode.js, Chart.js

**Aprobación:**
Rusch Esteban Alberto — Desarrollador y líder de producto — Febrero 2026
