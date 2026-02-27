# Changelog – WINE-PICK-QR

Registro de cambios del proyecto organizado por versión, siguiendo el formato [Keep a Changelog](https://keepachangelog.com/).

---

## Información del proyecto

| Campo           | Valor                                                |
| --------------- | ---------------------------------------------------- |
| **Proyecto**    | WINE-PICK-QR                                         |
| **Autores**     | Rusch Esteban Alberto (Legajo: 17873), Jorge Asensio |
| **Repositorio** | Git local / GitHub                                   |

---

## [1.0.0] - MVP Release (Febrero 2026)

### Agregado

- **Módulo público de consulta:**
  - Lector de códigos QR integrado en la web (html5-qrcode)
  - Compatibilidad con cámara nativa del celular (QR con URL completa)
  - Buscador de productos por nombre, bodega, varietal y origen
  - Ficha de producto con precio final calculado en tiempo real
  - Listado de productos en promoción vigentes
  - Listado de productos más consultados
- **Módulo de administración:**
  - Login seguro con JWT (token en cookie HttpOnly)
  - CRUD completo de productos con validaciones
  - CRUD completo de promociones con validación de superposición (RF12)
  - Tipos de promoción: porcentaje, precio fijo, 2x1, 3x2, NxM
  - Dashboard de métricas con Chart.js
  - Filtro de métricas por período (7, 30, 90 días)
  - Cambio de contraseña del administrador
  - Escaneo QR desde panel admin para edición rápida
- **PWA:**
  - Manifest.json para instalación en pantalla de inicio
  - Service Worker básico para instalabilidad (sin caché offline)
- **Arquitectura:**
  - Patrón MVC en backend PHP
  - API REST con endpoints públicos y administrativos
  - Módulos ES6 en frontend JavaScript
- **Documentación:**
  - Project Brief completo
  - Historias de usuario con criterios GWT
  - Requerimientos RF1-RF20 y RNF1-RNF6
  - Modelo de base de datos documentado
  - Manual de usuario y técnico

### Técnico

- PHP 8.x con strict types
- MySQL 8.x con charset UTF8MB4
- Bootstrap 5.3 para estilos responsive
- Autenticación JWT con expiración de 30 minutos
- Prepared statements en todas las consultas SQL
- Password hashing con bcrypt

### Migración

- Ejecutar `database/database.sql` para crear el esquema
- Ejecutar `database/seed.sql` para datos de prueba (opcional)
- Configurar variables en archivo `.env`

---

## [0.3.0] - QR con URL completa (Enero 2026)

### Agregado

- Códigos QR ahora incluyen URL completa del producto
- El escáner QR es compatible con URLs completas (público y admin)

### Cambiado

- Se quitó el badge "Activa/Inactiva" de las cards de promociones

### Técnico

- Los QR generados apuntan a: `{BASE_URL}/#qr?code={public_code}`
- Permite escanear directamente desde la app de cámara del celular

---

## [0.2.0] - Panel de administración (Diciembre 2025)

### Agregado

- Panel de administración completo
- CRUD de productos
- CRUD de promociones
- Dashboard de métricas básico
- Sistema de autenticación JWT
- Cambio de contraseña

### Cambiado

- Interfaz migrada a Bootstrap 5 responsive

### Técnico

- Implementación de patrón MVC
- API REST con endpoints /api/admin/_ y /api/public/_
- Validación de superposición de promociones en backend

---

## [0.1.0] - Estructura inicial (Noviembre 2025)

### Agregado

- Estructura inicial del proyecto
- Diseño de base de datos (4 tablas)
- Configuración de entorno XAMPP
- Documentación inicial del proyecto

### Técnico

- Definición de arquitectura cliente-servidor
- Selección de stack: PHP + MySQL + JavaScript vanilla
- Creación de esquema SQL inicial

---

## Convenciones de este changelog

- **Agregado:** Nuevas funcionalidades
- **Cambiado:** Cambios en funcionalidades existentes
- **Corregido:** Corrección de bugs
- **Eliminado:** Funcionalidades removidas
- **Técnico:** Notas técnicas relevantes
- **Migración:** Pasos necesarios para actualizar

---

## Roadmap (futuras versiones)

### [1.1.0] - Mejoras planificadas

- [ ] Recuperación de contraseña por email
- [ ] Exportación de métricas a CSV
- [ ] Múltiples usuarios admin con roles
- [ ] Notificaciones cuando una promoción está por vencer

### [2.0.0] - Expansión futura

- [ ] Gestión de múltiples sucursales
- [ ] Carrito de compras básico
- [ ] Integración con sistemas de facturación
