# Pruebas y Calidad – WINE-PICK-QR

## 1. Objetivo

Definir la estrategia de pruebas y aseguramiento de la calidad para el proyecto WINE-PICK-QR, alineada con la rúbrica del Trabajo Final Integrador y la Ruta Base de Proyecto.

## 2. Alcance de las pruebas

Las pruebas cubrirán al menos:

- **Flujos funcionales clave:**
  - Consulta de producto por QR (cliente).
  - Búsqueda y listado de productos (cliente).
  - Gestión de productos (alta, edición, desactivación) – administrador.
  - Gestión de promociones simples – administrador.
  - Visualización de métricas básicas – administrador.

- **Aspectos no funcionales básicos:**
  - Usabilidad en dispositivos móviles.
  - Validación de entradas en formularios.
  - Comportamiento ante errores comunes (producto inexistente, QR inválido, etc.).

## 3. Tipos de pruebas

### 3.1. Pruebas unitarias (backend)

- Pruebas sobre componentes clave del backend (por ejemplo, servicios de cálculo de precios con promociones, validación de datos, manejo de fechas).
- Pueden implementarse con un framework de pruebas (PHPUnit u otro equivalente) o, como mínimo, con scripts de aserciones documentados.

### 3.2. Pruebas funcionales / de integración

- Pruebas sobre endpoints de la API REST:
  - `GET /api/public/productos/{codigo_publico}`
  - `GET /api/public/productos?…`
  - `GET /api/admin/productos`
  - `POST /api/admin/productos`
  - etc.
- Pueden ejecutarse manualmente con herramientas como Postman/Insomnia y registrarse en este documento.

### 3.3. Pruebas de aceptación (UAT)

- Pruebas donde se recorren los flujos principales desde la perspectiva de los usuarios:
  - Cliente escanea QR y ve la ficha.
  - Cliente realiza búsqueda y abre una ficha.
  - Admin inicia sesión, crea un producto, crea una promoción y verifica su impacto en la ficha pública.
  - Admin consulta métricas y valida que los datos tienen sentido.

## 4. Casos de prueba representativos

A modo de ejemplo, algunos casos de prueba pueden ser:

| ID  | Descripción                                     | Tipo        | Pasos principales                                                                   | Resultado esperado                                       |
|-----|-------------------------------------------------|------------|-------------------------------------------------------------------------------------|---------------------------------------------------------|
| CP1 | Consulta por QR válido                          | UAT/Func.  | Escanear QR de un producto activo                                                   | Se muestra la ficha correcta del producto               |
| CP2 | Consulta por QR de producto desactivado         | UAT/Func.  | Escanear QR de producto desactivado                                                 | Mensaje de “producto no disponible” y opciones de volver|
| CP3 | Búsqueda por nombre                             | Funcional  | Ingresar parte del nombre de un producto existente                                  | Lista de resultados contiene el producto esperado       |
| CP4 | Alta de producto (admin)                        | Funcional  | Iniciar sesión, completar formualrio de alta y guardar                              | Producto visible en búsquedas y accesible por QR/código |
| CP5 | Creación de promoción simple                    | Funcional  | Crear promo de 20% OFF para producto, dentro de fechas vigentes                     | Ficha muestra precio promocional y descripción de promo |
| CP6 | Métricas de productos más consultados           | Funcional  | Generar varias consultas a un producto, revisar reporte de “más consultados”        | Producto aparece con recuento aproximado correcto       |
| CP7 | Validación de credenciales incorrectas (admin)  | Seguridad  | Intentar login con usuario o contraseña inválidos                                   | Mensaje de error, sin acceso al panel de administración |

Se recomienda documentar para cada caso:

- Estado (pendiente / en curso / aprobado / con observaciones).
- Evidencias (capturas de pantalla, respuestas de API, etc.).

## 5. Checklist de calidad (QA)

Antes de una entrega importante (por ejemplo, release para la defensa), se recomienda seguir una lista de verificación como:

- [ ] Todas las rutas principales de la app son alcanzables desde la navegación.
- [ ] No hay errores visibles en consola del navegador al realizar las operaciones básicas.
- [ ] Formularios validan correctamente entradas requeridas y formatos (por ejemplo, precios numéricos).
- [ ] Mensajes de error son claros y no exponen detalles internos del servidor.
- [ ] El panel de administración no es accesible sin login.
- [ ] Las operaciones de administración no se pueden ejecutar mediante API sin autenticación.
- [ ] Las consultas de métricas se actualizan cuando se generan nuevos eventos de consulta.
- [ ] La aplicación es usable en al menos un dispositivo móvil real o emulado.

## 6. Integración con CI/CD

Si se configura un pipeline de integración continua (por ejemplo, con GitHub Actions):

- Se recomienda que, al menos:
  - Verifique la sintaxis del código (PHP, JavaScript).
  - Ejecute pruebas unitarias si se implementan.
- El estado del pipeline debería visualizarse en el repositorio (badge opcional) y considerarse antes de fusionar cambios en `main`.

## 7. Registro de incidencias y correcciones

- Cada bug encontrado debe:
  - Registrarse como issue en el repositorio, con pasos para reproducirlo.
  - Asociarse a una rama de corrección (`fix/...`) si es necesario.
  - Ser referenciado en el changelog del proyecto cuando se resuelva.

## 8. Relación con otros documentos

Este plan de pruebas se conecta con:

- `02_DISENIO_FUNCIONAL.md` (historias de usuario) – base de pruebas de aceptación.
- `API_REST.md` – base para pruebas funcionales de endpoints.
- `09_DESPLIEGUE_Y_ENTORNO.md` – contexto de entornos donde se ejecutarán las pruebas.
- `10_INFORME_FINAL_TFI.md` – donde se resumirán resultados, métricas de pruebas y hallazgos principales.
