# Actas de Reunión / Demo — WINE-PICK-QR

---

# Acta de Reunión / Demo

**Fecha:** Noviembre 2025
**Participantes:** Rusch Esteban (desarrollador), Jorge Asensio (desarrollador)
**Objetivo de la sesión:** Kickoff — Definir el alcance y objetivos del proyecto
**Demo/Temas tratados:**

- Análisis del problema: dificultad para mantener precios actualizados en vinotecas
- Definición de la solución: PWA con lectura de QR y panel de administración
- Identificación de usuarios: cliente de vinoteca y administrador
- Revisión de requisitos del TFI de la cátedra

**Decisiones:**

- El proyecto será una PWA para evitar la necesidad de instalación desde tiendas
- Se usará PHP y MySQL por familiaridad y requisitos del TFI
- El alcance del MVP incluirá consulta de productos y CRUD básico
- Se priorizará con metodología MoSCoW

**Observaciones / Cambios solicitados:**

- Ninguna en esta etapa inicial

**Acciones (responsable/fecha):**
| Acción | Responsable | Fecha |
|--------|-------------|-------|
| Redactar Project Brief | Esteban | Jorge | Noviembre 2025 |
| Definir historias de usuario | Esteban | Jorge | Noviembre 2025 |
| Diseñar modelo de base de datos | Esteban | Jorge | Noviembre 2025 |

**Próxima fecha/hito:** Diseño técnico y de base de datos

---

# Acta de Reunión / Demo

**Fecha:** Noviembre 2025
**Participantes:** Rusch Esteban (desarrollador), Jorge Asensio (desarrollador)
**Objetivo de la sesión:** Diseño técnico — Definir arquitectura y tecnologías
**Demo/Temas tratados:**

- Evaluación de frameworks vs desarrollo vanilla
- Diseño de la base de datos (4 tablas: products, promotions, admin_users, consult_events)
- Estructura de carpetas del proyecto (patrón MVC)
- Definición del stack tecnológico

**Decisiones:**

- Usar JavaScript vanilla para el frontend (mejor control, sin dependencias pesadas)
- Implementar patrón MVC en el backend PHP
- Implementar API Rest
- Usar Bootstrap 5 para estilos responsive
- Autenticación con JWT almacenado en cookie HttpOnly
- Prepared statements en todas las consultas SQL para prevenir inyección

**Observaciones / Cambios solicitados:**

- Se descarta usar frameworks como Laravel o React por complejidad innecesaria para el alcance del MVP

**Acciones (responsable/fecha):**
| Acción | Responsable | Fecha |
|----------------------------------|-----------------|----------------|
| Crear esquema SQL (database.sql) | Esteban | Jorge | Noviembre 2025 |
| Configurar entorno XAMPP | Esteban | Jorge | Noviembre 2025 |
| Crear estructura de carpetas MVC | Esteban | Jorge | Noviembre 2025 |

**Próxima fecha/hito:** Desarrollo del módulo público

---

# Acta de Reunión / Demo

**Fecha:** Diciembre 2025
**Participantes:** Rusch Esteban (desarrollador), Jorge Asensio (desarrollador)
**Objetivo de la sesión:** Demo del módulo público — Revisar avance del módulo de consulta para clientes
**Demo/Temas tratados:**

- Lector de QR funcionando en navegador (html5-qrcode)
- Búsqueda de productos por texto (nombre, bodega, varietal, origen)
- Ficha de producto con precio y promoción calculada en tiempo real
- Listado de productos en promoción
- Listado de productos más consultados

**Decisiones:**

- Mantener la búsqueda por texto como alternativa al QR
- Continuar con el desarrollo del panel admin
- Registrar eventos de consulta para métricas (tabla consult_events)

**Observaciones / Cambios solicitados:**

- El lector QR funciona bien en Chrome y Safari modernos
- Algunos navegadores antiguos tienen problemas con el acceso a cámara
- La búsqueda responde rápido, menos de 1 segundo

**Acciones (responsable/fecha):**
| Acción | Responsable | Fecha |
|-------------------------------------|-------------|------------|
| Implementar panel de administración | Esteban | Enero 2026 |
| Agregar sistema de login JWT | Esteban | Enero 2026 |
| Implementar CRUD de productos | Esteban | Enero 2026 |

**Próxima fecha/hito:** Panel de administración

---

# Acta de Reunión / Demo

**Fecha:** Enero 2026
**Participantes:** Rusch Esteban (desarrollador)
**Objetivo de la sesión:** Demo del panel de administración — Revisar CRUD de productos y promociones
**Demo/Temas tratados:**

- Login con validación JWT (token en cookie HttpOnly, expiración 30 min)
- Crear, editar y eliminar productos (soft delete)
- Crear, editar y eliminar promociones
- Validación de superposición de promociones
- Tipos de promoción: porcentaje, precio fijo, 2x1, 3x2, NxM

**Decisiones:**

- Agregar dashboard de métricas como funcionalidad adicional
- Implementar cambio de contraseña del administrador
- Agregar escaneo QR desde panel admin para edición rápida

**Observaciones / Cambios solicitados:**

- Los formularios validan correctamente en frontend y backend
- El soft delete funciona como se esperaba (preserva histórico)
- La validación de superposición de promociones evita errores de configuración

**Acciones (responsable/fecha):**
| Acción | Responsable | Fecha |
|-------------------------------------------------------|-------------|------------|
| Implementar dashboard de métricas con Chart.js | Esteban | Enero 2026 |
| Agregar filtro de métricas por período (7/30/90 días) | Esteban | Enero 2026 |
| Implementar cambio de contraseña | Esteban | Enero 2026 |

**Próxima fecha/hito:** MVP completo y ajustes finales

---

# Acta de Reunión / Demo

**Fecha:** 24-01-2026
**Participantes:** Rusch Esteban (desarrollador)
**Objetivo de la sesión:** Validación final del MVP — Revisión de funcionalidades completas
**Demo/Temas tratados:**

- Flujo completo de cliente: escaneo QR → ficha de producto con precio
- Flujo completo de admin: login → gestión de productos/promociones → métricas
- PWA instalable en celular (manifest.json + service worker)
- Dashboard de métricas con gráficos y ranking de productos
- Escaneo QR desde panel admin para edición rápida

**Decisiones:**

- Modificar QR para incluir URL completa (compatibilidad con cámara nativa)
- Quitar badge "Activa/Inactiva" de las cards de promociones (innecesario)
- Preparar documentación para entrega según guía de la cátedra

**Observaciones / Cambios solicitados:**

- Todas las funcionalidades del MVP están operativas
- Las métricas muestran datos útiles sobre productos consultados
- La interfaz es clara y fácil de usar en móvil y desktop
- Mejorar compatibilidad del QR con cámara nativa del celular

**Acciones (responsable/fecha):**
| Acción | Responsable | Fecha | Estado |
|----------------------------------------|-------------|------------|-------------|
| Modificar QR para incluir URL completa | Esteban | 24-01-2026 | Completado |
| Quitar badge de cards de promociones | Esteban | 24-01-2026 | Completado |
| Preparar documentación para entrega | Esteban | 26-01-2026 | En progreso |

**Próxima fecha/hito:** Entrega del TFI (02-02-2026)

---

# Acta de Reunión / Demo

**Fecha:** 26-01-2026
**Participantes:** Rusch Esteban (desarrollador)
**Objetivo de la sesión:** Preparación para entrega — Completar documentación y ajustes finales
**Demo/Temas tratados:**

- Revisión de documentación técnica
- Completar templates de gestión de proyecto según guía de la cátedra
- Correcciones finales de bugs menores
- Preparación del guion de defensa

**Decisiones:**

- Documentación organizada según RutaBaseProyecto de la cátedra
- Incluir todos los templates requeridos (12 archivos)
- Verificar coherencia entre documentación y código

**Observaciones / Cambios solicitados:**

- Fix: ficha admin ahora asocia promoción correctamente
- Fix: delegación robusta para logout admin
- Documentación alineada con el código implementado

**Acciones (responsable/fecha):**
| Acción | Responsable | Fecha | Estado |
|------------------------------------------------------------|-------------|------------|-----------|
| Completar templates faltantes (wbs.md, cost_estimation.md) | Esteban | 26-01-2026 | Pendiente |
| Revisar coherencia de documentación | Esteban | 26-01-2026 | En progreso | | |
| Preparar defensa del TFI | Esteban | 02-02-2026 | Pendiente |

**Próxima fecha/hito:** Entrega y defensa del TFI (02-02-2026)
