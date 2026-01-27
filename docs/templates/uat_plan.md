# Plan de UAT (aceptación de usuario)

**Alcance UAT:** Validar flujos principales del sistema desde la perspectiva del cliente (consulta por QR/búsqueda) y del administrador (CRUD productos/promociones, métricas).

**Ambiente/Accesos:** Local XAMPP o `https://imperialsoft.site/projects/winepickqr/` | Usuario: Admin / Admin2026! | Dispositivos: celular con cámara, navegador desktop.

## Casos de prueba (alto nivel)

| Caso   | Paso clave                      | Resultado esperado                            | Estado   | Observaciones      |
| ------ | ------------------------------- | --------------------------------------------- | -------- | ------------------ |
| UAT-01 | Abrir app en celular            | Página carga, se ve buscador y botón QR       | Aprobado | -                  |
| UAT-02 | Escanear QR válido              | Ficha del producto con precio y promoción     | Aprobado | -                  |
| UAT-03 | Escanear QR inválido            | Mensaje "Producto no encontrado"              | Aprobado | -                  |
| UAT-04 | Escanear QR desde cámara nativa | Abre navegador con ficha del producto         | Aprobado | URL completa en QR |
| UAT-05 | Buscar producto por texto       | Sugerencias aparecen, selección abre ficha    | Aprobado | -                  |
| UAT-06 | Buscar texto sin resultados     | Mensaje "No se encontraron resultados"        | Aprobado | -                  |
| UAT-07 | Ver listado de promociones      | Solo productos con promoción activa           | Aprobado | -                  |
| UAT-08 | Ver producto con promoción      | Precio original tachado, precio final visible | Aprobado | -                  |
| UAT-09 | Login admin correcto            | Accede al panel de administración             | Aprobado | -                  |
| UAT-10 | Login admin incorrecto          | Error "Credenciales inválidas"                | Aprobado | -                  |
| UAT-11 | Acceder a /admin sin sesión     | Redirige a login                              | Aprobado | -                  |
| UAT-12 | Crear producto                  | Producto visible en búsquedas públicas        | Aprobado | -                  |
| UAT-13 | Editar producto                 | Cambios reflejados en ficha pública           | Aprobado | -                  |
| UAT-14 | Eliminar producto               | No aparece en búsquedas públicas              | Aprobado | Eliminación física |
| UAT-15 | Crear promoción                 | Producto muestra precio con descuento         | Aprobado | -                  |
| UAT-16 | Crear promoción duplicada       | Error de superposición de fechas              | Aprobado | RF12               |
| UAT-17 | Eliminar promoción              | Producto vuelve a precio base                 | Aprobado | -                  |
| UAT-18 | Ver métricas                    | Gráfico y ranking de productos consultados    | Aprobado | -                  |
| UAT-19 | Filtrar métricas por período    | Datos se actualizan según filtro              | Aprobado | 7/30/90 días       |
| UAT-20 | Cerrar sesión                   | Sesión eliminada, redirige a inicio           | Aprobado | -                  |

**Criterios de aceptación globales:** Flujos principales sin errores críticos; tiempos < 3s; usable en móvil; datos persistentes; seguridad básica (login, rutas protegidas).

**Ventana UAT y responsables:** Febrero 2026 | Tester: Rusch Esteban | Desarrolladores: Rusch Esteban, Jorge Asensio.

**Acta de conformidad / pendientes:** MVP Aprobado. Pendientes para futuras versiones: recuperación de contraseña, exportación de métricas, múltiples usuarios admin.
