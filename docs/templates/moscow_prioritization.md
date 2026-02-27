# Requerimientos + Priorización MoSCoW

**Épica:** Sistema WINE-PICK-QR para gestión y consulta de productos y promociones mediante QR.
**Historias:** HU-C1 a HU-A9, ver matriz de trazabilidad y documentación técnica.

| ID   | Descripción breve               | M/S/C/W | Criterios de aceptación                                                                   |
| ---- | ------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| RF1  | Ficha pública por QR            | M       | Endpoint público para obtener ficha por código QR.                                        |
| RF2  | Buscador y filtros              | M       | Buscar productos activos por texto y filtros.                                             |
| RF3  | Listar promociones              | M       | Listar productos activos con promociones vigentes.                                        |
| RF4  | Más consultados                 | M       | Listar productos más consultados por cantidad de consultas.                               |
| RF5  | Ficha con datos clave           | M       | Mostrar nombre, tipo, bodega, origen, varietal, cosecha, descripción, precio y promoción. |
| RF6  | Crear productos (admin)         | M       | Permitir a admin crear productos con validaciones.                                        |
| RF7  | Editar productos (admin)        | M       | Permitir a admin editar productos existentes.                                             |
| RF8  | Eliminar/desactivar productos   | M       | Permitir a admin eliminar o desactivar productos.                                         |
| RF9  | Edición rápida desde QR (admin) | S       | Escanear QR y acceder a edición de producto.                                              |
| RF10 | Crear promociones (admin)       | M       | Crear promociones: % desc., precio fijo, 2x1, 3x2, NxM.                                   |
| RF11 | Vigencia de promociones         | M       | Definir fecha inicio y fin de cada promoción.                                             |
| RF12 | Validar superposición promo     | M       | No permitir más de una promoción vigente por producto.                                    |
| RF13 | Eliminar/desactivar promo       | S       | Permitir eliminar o desactivar promociones.                                               |
| RF14 | Registrar evento de consulta    | M       | Registrar evento cada vez que se accede a ficha de producto.                              |
| RF15 | Canal y fecha/hora en consulta  | M       | Registrar canal (QR/búsqueda) y fecha/hora en cada evento.                                |
| RF16 | Reporte más consultados         | M       | Reporte de productos más consultados (7, 30, 90 días).                                    |
| RF17 | Reporte consultas diarias       | S       | Reporte de consultas diarias, totales y por canal.                                        |
| RF18 | Autenticación admin             | M       | Panel admin requiere usuario y contraseña.                                                |
| RF19 | Bloqueo a no autenticados       | M       | No permitir acceso admin sin autenticación válida.                                        |
| RF20 | Contraseñas con hash            | M       | Contraseñas admin almacenadas con hash seguro.                                            |
| RNF1 | Interfaz usable y responsiva    | M       | Interfaz clara, usable y adaptada a móvil.                                                |
| RNF2 | Respuesta rápida (<3s)          | M       | Fichas y listados responden en menos de 3 segundos.                                       |
| RNF3 | Compatibilidad navegadores      | M       | Funciona en navegadores modernos y móviles actuales.                                      |
| RNF4 | Validación y protección         | M       | Validar entradas y prevenir SQLi/XSS en frontend y backend.                               |
| RNF5 | Código organizado               | S       | Arquitectura clara: MVC backend, módulos JS frontend.                                     |
| RNF6 | Trazabilidad con commits        | S       | Cambios significativos asociados a commits en Git.                                        |
| F-01 | Carrito y pagos                 | W       | No se implementa en MVP. Requiere integración pagos/carrito.                              |
| F-02 | Cuentas para clientes           | W       | No se implementa en MVP. Cliente no necesita cuenta.                                      |
| F-03 | Stock y pedidos                 | W       | No se implementa en MVP. Requiere integración externa.                                    |
| F-04 | Recomendaciones IA              | W       | No se implementa en MVP. Complejidad fuera de alcance.                                    |
| F-05 | Multi-idioma                    | W       | No se implementa en MVP. Mejora futura para turismo.                                      |
| F-06 | Múltiples sucursales            | W       | No se implementa en MVP. Solo una vinoteca.                                               |
| F-07 | Integración facturación         | W       | No se implementa en MVP. Requiere integración con terceros.                               |
