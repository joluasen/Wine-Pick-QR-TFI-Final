# Arquitectura técnica de WINE-PICK-QR

Este documento describe la arquitectura técnica de **WINE-PICK-QR**, detallando:

- La visión general del sistema.
- Los componentes principales (cliente web, API y base de datos).
- La organización lógica del frontend y del backend.
- El modelo de datos a alto nivel.
- Los flujos de interacción típicos entre los distintos componentes.

El objetivo es ofrecer una visión clara para docentes, revisores técnicos o futuros desarrolladores que necesiten comprender **cómo está estructurada la solución** más allá de la descripción funcional.

---

## 1. Visión general de la arquitectura

WINE-PICK-QR se organiza bajo una arquitectura **cliente–servidor** con los siguientes elementos principales:

- **Cliente web (PWA)**  
  Aplicación web progresiva orientada a dispositivos móviles, utilizada tanto por clientes finales como por el personal del local y, en ciertos flujos, por el administrador.

- **API de aplicación (backend)**  
  Capa de lógica de negocio y acceso a datos, expuesta mediante una API de estilo REST que devuelve respuestas en formato JSON.

- **Base de datos relacional**  
  Sistema gestor de base de datos donde se almacenan productos, promociones, eventos de consulta, usuarios administradores y demás información necesaria.

A alto nivel, el flujo es:

1. El **cliente web** realiza peticiones HTTP a la **API** (por ejemplo, para consultar productos, buscar por texto o realizar operaciones administrativas).
2. La **API** valida datos, aplica reglas de negocio, consulta la **base de datos** y construye una respuesta uniforme en JSON.
3. El **cliente web** interpreta esa respuesta y actualiza la interfaz (fichas de producto, listados, métricas, etc.).

---

## 2. Cliente web (PWA)

### 2.1 Rol del cliente web

El cliente web está pensado principalmente para ser usado en **teléfonos móviles** dentro de la vinoteca/licorería. Sus responsabilidades clave son:

- Presentar una interfaz clara y legible en pantallas pequeñas.
- Permitir el acceso mediante:
  - **Escaneo de códigos QR** desde la aplicación.
  - **Búsqueda por texto**.
  - Acceso directo a fichas mediante enlaces abiertos desde la cámara del dispositivo.
- Consumir la API para:
  - Obtener datos de productos y promociones.
  - Registrar eventos de consulta.
  - Mostrar listados (productos más consultados, en promoción, etc.).
- En el caso del administrador:
  - Consumir endpoints protegidos para gestionar catálogo, promociones y métricas.

### 2.2 Tecnologías y enfoque general

A nivel de implementación, el cliente web se basa en:

- **HTML5** para la estructura de las vistas.
- **CSS3** y un sistema de componentes de interfaz mediante **Bootstrap** para lograr una presentación consistente y adaptable.
- **JavaScript** (sin frameworks pesados) para:
  - Manejo de eventos de la interfaz.
  - Enrutamiento básico (según se defina).
  - Invocación a la API vía peticiones HTTP.
  - Integración con la cámara para lectura de códigos QR desde el navegador.

El objetivo es mantener un frontend **ligero y entendible**, sin introducir dependencias complejas, facilitando así la revisión académica y el mantenimiento.

### 2.3 Organización lógica

Aunque los detalles exactos de carpetas pueden variar, a nivel lógico pueden distinguirse las siguientes zonas:

- **Vistas / pantallas**  
  Componentes responsables de representar:
  - Pantalla de inicio y búsqueda.
  - Lector de QR.
  - Fichas de producto.
  - Listados (más consultados, en promoción).
  - Formularios de inicio de sesión y pantallas de administración (cuando se accede desde el navegador).

- **Módulos de comunicación con la API**  
  Código que centraliza:
  - Llamadas a endpoints públicos (consultas de productos).
  - Llamadas a endpoints protegidos (gestión de productos, promociones, métricas).
  - Manejo uniforme de errores (códigos HTTP, mensajes de error funcionales).

- **Utilidades y lógica auxiliar**  
  - Gestión de parámetros en la URL (por ejemplo, identificador de producto).
  - Transformaciones de datos (formateo de precios, etiquetas de estado).
  - Comportamientos asociados a la PWA (por ejemplo, registro del Service Worker si se implementa).

### 2.4 Comportamiento como PWA

El cliente web está orientado a comportarse como una **aplicación web progresiva (PWA)**, lo que implica:

- Disponer de un **manifest** para permitir su instalación como icono en la pantalla de inicio del dispositivo (según soporte del navegador).
- Utilizar un **Service Worker** para:
  - Acelerar la carga de recursos estáticos.
  - Mejorar la experiencia percibida en conexiones inestables.
- Gestionar de forma clara los casos en los que no hay conectividad suficiente (mensajes de error y posibilidad de reintentar).

---

## 3. API de aplicación (backend)

### 3.1 Rol de la API

La API constituye el núcleo de la lógica de negocio de WINE-PICK-QR. Sus responsabilidades incluyen:

- Exponer **endpoints** para:
  - Consultar fichas de producto.
  - Realizar búsquedas por distintos criterios.
  - Registrar eventos de consulta (vistas, escaneos).
  - Gestionar productos y promociones (solo para administradores autenticados).
  - Gestionar usuarios administradores (según el alcance definido).
- Aplicar **reglas de negocio**, tales como:
  - Cómo se calcula el precio final a partir del precio base y la promoción vigente.
  - Garantizar que no haya superposición de ciertas promociones.
  - Validar que solo se muestren productos activos.
- Asegurar un formato de respuesta homogéneo en JSON tanto para casos de éxito como de error.

### 3.2 Organización en capas

Aunque la API se ejecute en un entorno sencillo, se propone una organización lógica en capas:

1. **Capa de entrada / enrutador**
   - Recibe las peticiones HTTP (por ejemplo, a través de un único punto de entrada o front controller).
   - Interpreta la URL y el método (GET, POST, etc.).
   - Delegada en el controlador correspondiente.

2. **Controladores (endpoints)**
   - Implementan la lógica específica de cada recurso:
     - Productos.
     - Promociones.
     - Autenticación de administrador.
     - Métricas.
   - Validan parámetros de entrada (por ejemplo, criterios de búsqueda, identificadores de producto).

3. **Servicios / lógica de negocio**
   - Encapsulan las reglas propias del dominio:
     - Cálculo de precios finales.
     - Aplicación de promociones.
     - Política de activación/desactivación de productos.
     - Registro de eventos de consulta (vista de producto, escaneo, etc.).

4. **Capa de acceso a datos (repositorios)**
   - Gestiona la comunicación con la base de datos.
   - Ejecuta consultas (select, insert, update, delete) según lo requerido por los servicios.
   - Mapea resultados a estructuras de datos utilizadas por la API.

5. **Capa de respuesta**
   - Construye la respuesta en formato JSON.
   - Define una estructura uniforme para:
     - Datos de éxito (por ejemplo, ficha de producto, listados).
     - Mensajes de error (códigos y descripciones coherentes).

### 3.3 Seguridad y autenticación

En la API se contemplan al menos dos niveles de acceso:

- **Acceso público (no autenticado)**
  - Consulta de productos.
  - Búsqueda.
  - Acceso a fichas individuales.
  - Consulta de productos más vistos y en promoción.

- **Acceso administrativo (autenticado)**
  - Requiere inicio de sesión con credenciales.
  - Permite:
    - Alta y modificación de productos.
    - Gestión de promociones.
    - Consultas de métricas.

La autenticación se gestiona mediante:

- Validación de credenciales (usuario y contraseña).
- Almacenamiento de contraseñas mediante técnicas de hash adecuadas.
- Uso de sesión o mecanismo equivalente para mantener el estado de la autenticación mientras el administrador trabaja en el panel.

---

## 4. Base de datos y modelo de datos (visión general)

### 4.1 Rol de la base de datos

La base de datos relacional almacena de forma estructurada:

- Información de productos.
- Promociones asociadas.
- Eventos de consulta (vistas/escaneos).
- Usuarios administradores.

Su diseño sigue una estructura alineada con las necesidades de consulta y mantenimiento de WINE-PICK-QR.

### 4.2 Entidades principales (a alto nivel)

Sin entrar en toda la definición de campos, se consideran, entre otras, las siguientes entidades:

- **Producto**
  - Representa un vino, espumante o licor ofrecido al público.
  - Contiene:
    - Identificador interno.
    - Código o identificador público asociado al QR.
    - Nombre.
    - Bodega/destilería o marca.
    - Varietal o tipo de bebida.
    - Origen.
    - Año/cosecha (cuando corresponde).
    - Descripción breve.
    - Información de precio.
    - Estado de stock.
    - Indicador de si el producto está activo o no.

- **Promoción de producto**
  - Representa una promoción individual aplicada a un producto concreto (por ejemplo, descuento porcentual).
  - Incluye atributos como:
    - Tipo de promoción.
    - Parámetros necesarios para el cálculo (por ejemplo, porcentaje).
    - Fechas de vigencia.
    - Estado (activa/inactiva).

- **Eventos de consulta**
  - Registra las consultas realizadas sobre productos.
  - Permite diferenciar:
    - Consultas provenientes de escaneo de QR.
    - Consultas provenientes del buscador.
  - Almacena al menos:
    - Identificador del producto.
    - Fecha y hora de la consulta.
    - Canal (QR o búsqueda).

- **Usuario administrador**
  - Representa a las personas autorizadas para acceder al panel.
  - Contiene:
    - Identificador.
    - Nombre de usuario.
    - Contraseña cifrada.
    - Estado (activo/no activo).

### 4.3 Reglas de integridad y de negocio

Entre las reglas que se reflejan en el modelo y/o en la lógica de la API se encuentran:

- Un producto puede estar asociado a **cero o una** promoción individual vigente en un momento dado.
- Solo los productos **activos** deben presentarse en los resultados visibles para el cliente.
- Al desactivar un producto, se evita que continúe apareciendo en búsquedas y fichas públicas.
- La eliminación de datos debe manejarse con criterio:
  - Preferencia por **desactivación** lógica (marcas de estado) frente a borrado físico cuando se requiera preservar histórico (consultas, métricas).

Un documento separado (`BASE_DE_DATOS_MER.md`) profundizará en el diagrama MER, atributos concretos y claves primarias/foráneas.

---

## 5. Flujos de interacción típicos

### 5.1 Consulta de producto por QR (cliente)

1. El cliente escanea un código QR (ya sea desde la cámara o desde la app).
2. El dispositivo abre la URL asociada al producto.
3. El cliente web realiza una petición a la API para obtener la ficha de ese producto.
4. La API:
   - Identifica el producto a partir del identificador incluido en la URL.
   - Verifica que el producto está activo.
   - Recupera la información de producto y la promoción vigente (si la hay).
   - Registra un evento de consulta (canal = QR).
   - Devuelve los datos en JSON.
5. El cliente web presenta la ficha con:
   - Datos del producto.
   - Precio final.
   - Promoción vigente.

### 5.2 Búsqueda de producto por texto (cliente)

1. El cliente abre la aplicación web y accede al buscador.
2. Ingresa un texto (nombre, bodega/destilería, varietal o tipo de bebida).
3. El cliente web envía la consulta a la API.
4. La API:
   - Ejecuta una búsqueda en la base de datos según los criterios recibidos.
   - Filtra únicamente productos activos.
   - Devuelve una lista de coincidencias en JSON.
5. El cliente web muestra los resultados; al seleccionar uno, repite el flujo de consulta de ficha.

### 5.3 Operaciones administrativas

Ejemplos de interacción:

- **Actualización de precio o promoción**  
  1. El administrador inicia sesión en el panel.  
  2. Desde el listado de productos o escaneando un QR, llega a la vista de edición de un producto.  
  3. Modifica precio y/o promoción.  
  4. El cliente web envía la actualización a la API mediante una petición protegida.  
  5. La API valida permisos, verifica datos, actualiza la base de datos y responde con el resultado de la operación.

- **Consulta de métricas**  
  1. El administrador accede a la sección de métricas.  
  2. El cliente web solicita a la API datos agregados (por ejemplo, productos más consultados).  
  3. La API lee los eventos de consulta, calcula los totales y devuelve un resumen.  
  4. El cliente web presenta la información en forma de listado, tabla o gráficos simples.

---

## 6. Gestión de códigos QR

### 6.1 Asociación entre código y producto

Cada producto dispone de:

- Un **identificador interno** utilizado por la base de datos.
- Un **identificador público** que se codifica en el QR, generalmente mediante una URL del tipo:

> `https://…/producto/{identificador_público}`

Este identificador público permite:

- Utilizar QRs estables en el tiempo.
- Modificar precio y promoción sin necesidad de volver a generar o pegar códigos nuevos.

### 6.2 Uso operativo

- Los códigos pueden pegarse:
  - En las **estanterías/góndolas** correspondientes.
  - En las **botellas** o envases del mismo producto.
- El **cliente** que escanea verá la ficha en modo lectura.
- El **administrador**, si accede estando autenticado y el sistema lo contempla, puede utilizar ese mismo enlace como atajo hacia la ficha de administración del producto.

---

## 7. Consideraciones no funcionales

### 7.1 Rendimiento

- El diseño de la API debe permitir:
  - Consultas rápidas de fichas individuales (uso intensivo en el local).
  - Paginación en listados de productos para evitar respuestas excesivamente grandes.
- El cliente web puede beneficiarse de:
  - Cacheo de recursos estáticos mediante el Service Worker.
  - Estrategias razonables en el uso de imágenes (tamaños y formatos adecuados).

### 7.2 Seguridad

- Las contraseñas de administradores deben almacenarse de forma cifrada.
- Las operaciones de administración solo deben ser accesibles para usuarios autenticados.
- Las entradas provenientes de formularios y parámetros deben ser validadas tanto en:
  - Cliente (a nivel de experiencia de usuario).
  - Servidor (a nivel de seguridad e integridad de datos).

### 7.3 Mantenibilidad

- La separación en capas (presentación, lógica de negocio y acceso a datos) facilita:
  - La lectura y comprensión del código.
  - El reemplazo o mejora de componentes específicos sin afectar al resto.
- La documentación adicional (modelo MER, especificación de API) proporciona soporte para futuras extensiones.

### 7.4 Escalabilidad

- Aunque el proyecto está pensado como solución para una vinoteca/licorería de tamaño pequeño o mediano, la arquitectura permite:
  - Ampliar el esquema de base de datos.
  - Incorporar nuevos servicios sin romper la interfaz existente de la API.

---

## 8. Relación con otros documentos

Este documento se complementa con:

- `BASE_DE_DATOS_MER.md`  
  Detalle del modelo entidad–relación, atributos de tablas, claves, índices y restricciones.

- `API_REST.md`  
  Especificación de endpoints, parámetros, cuerpos de petición y respuestas de la API, con ejemplos de JSON.

- Documentación funcional (README principal)  
  Descripción orientada a usuarios finales, contexto de negocio, objetivos y alcance funcional.

---

## 9. Conclusión

La arquitectura de WINE-PICK-QR se apoya en una división clara entre:

- **Cliente web (PWA)**: responsable de la experiencia de usuario en dispositivos móviles y navegadores.
- **API de aplicación**: núcleo de la lógica de negocio y puente con la base de datos.
- **Base de datos relacional**: soporte persistente para productos, promociones, usuarios y métricas.

Esta organización busca lograr un equilibrio entre:

- Simplicidad suficiente para su revisión en el contexto de un Trabajo Final Integrador.
- Claridad y robustez para permitir una evolución posterior hacia escenarios más complejos o más exigentes a nivel operativo.
