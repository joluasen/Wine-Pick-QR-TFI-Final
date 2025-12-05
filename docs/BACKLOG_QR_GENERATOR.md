# HU: Generador de QR para Productos (A-QR)

## Contexto
El administrador necesita generar códigos QR únicos y reutilizables para cada producto, almacenarlos, y poder regenerarlos si es necesario. Los QR deben incluir el `public_code` impreso debajo para facilitar su identificación física.

## Objetivo
Implementar un generador de QR completamente funcional que:
- Genere automáticamente un código QR al crear un producto (basado en `public_code`).
- Permita visualizar el QR (con el `public_code` debajo) en la pantalla de edición sin acciones adicionales.
- Permita descargar e imprimir el QR desde la UI admin.
- Almacene la referencia del QR en la BD.
- Garantice unicidad y evite duplicados.
- Permita regenerar un QR corrupto.

## Criterios de aceptación

### Generación automática
- Al crear un producto, se genera automáticamente un código QR cuyo payload es el endpoint público de consulta (p. ej.: `http://localhost/proyectos/Wine-Pick-QR-TFI/api/public/productos/{public_code}`).
- El QR incluye el `public_code` impreso debajo en texto pequeño.
- La generación no bloquea la creación del producto; se ejecuta de forma asincrónica si es necesario.

### Visualización en edición
- Al acceder a la pantalla de edición de un producto, se muestra el QR generado.
- No hay acciones (generar, descargar, regenerar) en esta pantalla aún; solo visualización.

### Descarga e impresión
- La UI admin (panel de productos o individual) ofrece botones: "Descargar QR" e "Imprimir".
- El archivo descargado es PNG o SVG con nombre descriptivo (p. ej.: `{public_code}-qr.png`).

### Almacenamiento en BD
- Se agrega columna `qr_url` (o `qr_path`) en tabla `products` para guardar la referencia/URL del QR generado.
- Si se usa generación server-side, se almacena la ruta en el servidor; si es cliente-side, se guarda una referencia o metadatos.

### Unicidad y validaciones
- Constraint único sobre `public_code` (ya existe en el esquema); se valida antes de permitir crear producto sin código.
- No se pueden generar dos QR distintos para el mismo `public_code` en la misma sesión; si se intenta regenerar, se reemplaza de forma controlada.
- Mensaje de error claro si ya existe un QR para ese `public_code`.

### Regeneración de QR
- Acción disponible en la UI admin: "Regenerar QR" (para caso de QR corrupto o reemplazo).
- Al regenerar, se reemplaza el QR anterior y se actualiza la referencia en la BD.
- Confirmación clara antes de regenerar (para evitar sobrescrituras accidentales).

### Manejo de errores
- Si falla la generación, mostrar mensaje claro: "No se pudo generar el QR. Intenta nuevamente."
- Si falla el almacenamiento en BD, revertir cambios y no dejar estado inconsistente.
- Logs de error para diagnóstico.

## Alcance
**Incluye:**
- Generación de QR en servidor (PHP) o cliente (JS librería; p. ej., `qrcode.js`).
- Endpoint API para devolver/generar QR (si server-side).
- UI admin para visualizar, descargar, imprimir y regenerar QR.
- Actualización de esquema BD y docs API.

**No incluye:**
- Generación de códigos de barra (1D); solo QR (2D).
- Integración con servicios externos de generación de QR.
- Análisis de escaneos (HU futura).

## Tareas

### Backend
- [ ] Agregar columna `qr_url` (VARCHAR 500) a tabla `products` con default NULL.
- [ ] Crear endpoint `POST /api/admin/productos/{id}/generate-qr` para generar QR.
- [ ] Crear endpoint `POST /api/admin/productos/{id}/regenerate-qr` para regenerar.
- [ ] Crear endpoint `GET /api/admin/productos/{id}/qr` para devolver la imagen/referencia.
- [ ] Librería QR en PHP (p. ej., `endroid/qr-code`) o generar cliente-side.
- [ ] Lógica de almacenamiento: guardar archivo PNG en directorio `public/qr/` o como blob.
- [ ] Validaciones de unicidad y errores.

### Frontend
- [ ] Actualizar vista de edición (`public/views/admin.html` o nueva) para mostrar QR.
- [ ] Botones: "Descargar QR", "Imprimir", "Regenerar QR" en UI admin.
- [ ] Componente JS para renderizar/descargar/imprimir QR.
- [ ] Mensajes de estado/error para operaciones de QR.

### Base de Datos
- [ ] Migration: `ALTER TABLE products ADD COLUMN qr_url VARCHAR(500) DEFAULT NULL;`
- [ ] Asegurar índice en `public_code` (ya debe existir).

### Documentación
- [ ] Actualizar `docs/10_diseno_tecnico/API_REST.md` con nuevos endpoints de QR.
- [ ] Actualizar `docs/30_operacion_y_despliegue/Manual_Usuario.md` con flujo de QR.
- [ ] Añadir especificación de formato de QR (p. ej., tamaño, encoding).

### Pruebas
- [ ] Crear producto → verificar generación de QR → descargar → validar contenido.
- [ ] Editar producto → ver QR sin acciones.
- [ ] Regenerar QR → confirmar reemplazo en UI y BD.
- [ ] Intentar crear dos productos con mismo `public_code` → error claro.
- [ ] Fallo de generación → manejar error correctamente.
- [ ] Imprimir QR → validar impresión correcta.

## Definition of Done
- [x] Tarjeta documentada y clara en Backlog.
- [ ] Rama `feature/qr-generator` creada desde `esteban`.
- [ ] Todos los endpoints implementados y funcionales.
- [ ] UI admin permite ver, descargar, imprimir y regenerar QR.
- [ ] BD actualizada con columna `qr_url`.
- [ ] Validaciones de unicidad y manejo de errores implementados.
- [ ] Docs actualizadas (API y Manual de Usuario).
- [ ] Todos los casos de prueba ejecutados y validados.
- [ ] PR abierto y revisado desde `feature/qr-generator` hacia `esteban`.
- [ ] Merged a `esteban` y luego a `master`.

## Notas
- El QR debe apuntar al endpoint público `GET /api/public/productos/{public_code}` para que funcione con HU-C1 (consulta por QR).
- Considerar usar librería JS `qrcode.js` para generación cliente-side si se prefiere evitar dependencias PHP.
- El `public_code` debe ser legible bajo el QR (tamaño de fuente pequeño, ej. 8-10px).
- Mantener versionado en Git; no almacenar archivos binarios grandes en repositorio (usar `.gitignore` para `public/qr/`).
