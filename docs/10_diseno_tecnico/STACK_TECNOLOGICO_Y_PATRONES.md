# Stack tecnológico y patrones de diseño en WINE-PICK-QR

Este documento describe las **tecnologías seleccionadas** y los **patrones de diseño** adoptados en WINE-PICK-QR, con foco en:

- Frontend (cliente web PWA y JavaScript).
- Backend (API y patrón MVC).
- Base de datos.
- Seguridad y autenticación.
- Razones de diseño y decisiones explícitas (por ejemplo, no uso de JWT).

---

## 1. Visión general del stack

WINE-PICK-QR se construye sobre un stack **web clásico**, orientado a facilitar el desarrollo, la revisión académica y el despliegue en entornos accesibles:

- **Frontend**
  - HTML5, CSS3, Bootstrap.
  - JavaScript moderno (ES Modules), sin frameworks SPA pesados.
  - Micro-librerías específicas para QR, fechas y gráficos.

- **Backend**
  - PHP (versión 8.x o equivalente), con una estructura basada en **MVC**.
  - Exposición de una API estilo REST, que devuelve datos en formato JSON.

- **Base de datos**
  - Sistema gestor de base de datos relacional (por ejemplo, MySQL/MariaDB).
  - Modelo entidad–relación diseñado específicamente para productos, promociones, consultas y usuarios administradores.

- **Despliegue**
  - Entorno tipo LAMP/XAMPP (Linux/Windows, Apache, MySQL, PHP) o equivalente en hosting compartido.

---

## 2. Frontend: JavaScript, PWA y librerías

### 2.1 JavaScript sin framework pesado

Se ha optado por utilizar **JavaScript nativo** (ES6+), sin incorporar frameworks como React, Vue o Angular, por las siguientes razones:

- El alcance funcional del frontend es moderado y no requiere una SPA compleja.
- Se busca que el código sea fácilmente entendible por cualquier docente o desarrollador, sin necesidad de conocer un framework específico.
- La estructura del proyecto se beneficia de una mayor transparencia en cuanto a cómo se gestionan las rutas, llamadas a la API y actualizaciones de la interfaz.

La lógica del cliente se organiza mediante:

- Módulos ES (`type="module"` en los `<script>`).
- Ficheros separados según funcionalidad (búsqueda, ficha de producto, lector de QR, administración, etc.).
- Un enrutador ligero basado en el **hash de la URL** o rutas simples para diferenciar pantallas.

### 2.2 Librerías JavaScript utilizadas

Para resolver necesidades específicas sin reinventar la rueda, se incorporan las siguientes librerías:

#### 2.2.1 Lectura de códigos QR – `html5-qrcode`

- Permite acceder a la cámara del dispositivo desde el navegador.
- Proporciona una API simple para mostrar la vista de la cámara, detectar el QR y obtener el contenido.
- Se utiliza para implementar el **lector interno** de la app:
  - El usuario abre el lector desde un botón.
  - Enfoca al QR pegado en el estante o en la botella.
  - Cuando se detecta el código, la aplicación interpreta la URL y navega a la ficha correspondiente.

El flujo alternativo de escaneo mediante la **cámara nativa del dispositivo** no requiere librería: el sistema operativo abre automáticamente la URL codificada en el QR en el navegador.

#### 2.2.2 Manejo de fechas – `dayjs` (opcional, recomendado)

- Librería ligera para manipular y formatear fechas.
- Se utiliza, por ejemplo, para:
  - Mostrar de manera amigable las **fechas de vigencia** de las promociones.
  - Agrupar métricas de consultas por día.
- Reemplaza la necesidad de librerías más pesadas (como moment.js) y mantiene el bundle de JavaScript más liviano.

#### 2.2.3 Gráficos – `Chart.js` (opcional, recomendado)

- Facilita la creación de gráficos sencillos a partir de datos:
  - Barras, líneas, tortas, etc.
- Se emplea en el módulo de **métricas de administración** para:
  - Visualizar productos más consultados.
  - Representar consultas por día o por canal (QR/búsqueda).
- Ayuda a presentar la información de negocio de forma clara y comprensible.

### 2.3 Organización en módulos y responsabilidades

El JavaScript del frontend se estructura siguiendo una separación de responsabilidades:

- **Módulos de infraestructura**
  - `router`: decide qué vista cargar en función de la URL actual.
  - `apiClient`: centraliza las llamadas `fetch` a la API.
  - `authClient`: gestiona el estado del administrador autenticado en el lado del cliente (por ejemplo, si la sesión está activa o se debe volver a iniciar sesión).

- **Módulos de funcionalidad (features)**
  - `searchPage`: lógica y render de la pantalla de búsqueda.
  - `productDetailPage`: obtención y presentación de la ficha de producto.
  - `qrScannerPage`: integración con `html5-qrcode`.
  - `promosPage`: listado de productos en promoción.
  - `topProductsPage`: listado de productos más consultados.
  - `adminLoginPage`, `adminProductsPage`, `adminPromosPage`, `adminMetricsPage`: vistas y controladores para cada sección del panel de administración.

- **Módulos de utilidades**
  - `formatUtils`: formateo de precios, etiquetas de estado, textos auxiliares.
  - `dateUtils`: funciones basadas en `dayjs` para manipular fechas.

Esta estructura, si bien no implementa un MVC completo en frontend, permite distinguir claramente:

- **Qué se muestra** (vistas).
- **Qué reacciona a eventos y decide flujos** (controladores/navegación).
- **Qué datos y servicios se utilizan** (módulos de API y estado).

### 2.4 PWA: manifest y service worker

Para reforzar la experiencia móvil:

- Se define un **Web App Manifest**, que incluye:
  - Nombre de la aplicación.
  - Íconos para distintos tamaños de pantalla.
  - Orientación preferida (por ejemplo, vertical).
  - Colores de tema y de fondo.

- Se implementa un **Service Worker** básico que:
  - Cachea recursos estáticos (HTML, CSS, JS, íconos) para acelerar la carga.
  - Puede mostrar una pantalla coherente si no hay conexión (por ejemplo, informando al usuario y permitiendo reintentar).

El objetivo es que WINE-PICK-QR se comporte, en lo posible, como una aplicación instalable en el teléfono, sin dejar de ser una web.

---

## 3. Backend: PHP, API REST y MVC

### 3.1 PHP como lenguaje de backend

Se elige **PHP** como lenguaje de backend por:

- Compatibilidad con entornos académicos y de hosting compartido.
- Facilidad para montar un entorno local con XAMPP/WAMP.
- Ajuste natural a la arquitectura propuesta (MVC + API REST).

La API se organiza en torno a un **front controller** y controladores específicos para cada recurso.

### 3.2 API estilo REST

Características principales de la API:

- Uso de rutas que representan recursos (`/api/productos`, `/api/productos/{id}`, `/api/promociones`, `/api/metricas`, etc.).
- Uso de métodos HTTP estándares:
  - `GET` para consultas.
  - `POST` para creaciones.
  - `PUT/PATCH` para modificaciones.
  - `DELETE` (si aplica) para eliminaciones lógicas.
- Uso de códigos de estado HTTP coherentes (200, 201, 400, 401, 404, 500, etc.).
- Intercambio de datos en formato **JSON**.

La especificación detallada de endpoints, parámetros y ejemplos se recoge en `API_REST.md`.

### 3.3 MVC en el backend

El backend se organiza según el patrón **Modelo–Vista–Controlador**, reforzado con servicios y repositorios:

- **Modelos**
  - Clases que representan entidades del dominio (Producto, Promoción, UsuarioAdministrador, EventoConsulta).

- **Controladores**
  - Reciben peticiones, validan parámetros y coordinan la lógica.
  - Llaman a servicios y repositorios, según corresponda.

- **Vistas**
  - En la API, se concretan fundamentalmente como **estructuras JSON** generadas a partir de los modelos y datos suministrados por los servicios.
  - Opcionalmente, pueden existir vistas HTML para partes del panel de administración que se sirvan desde el servidor.

- **Servicios**
  - Encapsulan reglas de negocio:
    - Cálculo del precio final (precio base + promoción vigente).
    - Validación de vigencia de promociones.
    - Criterios de filtrado para productos visibles.

- **Repositorios**
  - Encargados de interactuar con la base de datos.
  - Implementan operaciones CRUD para cada entidad.

Esta organización facilita explicar el proyecto en términos de capas y responsabilidades bien delimitadas.

---

## 4. Base de datos y modelo entidad–relación

### 4.1 Tecnología

La base de datos se implementa sobre un SGBD relacional, típicamente:

- **MySQL** o **MariaDB**, según el entorno disponible.

Se busca un modelo normalizado y adecuado al volumen de datos esperable en una vinoteca/licorería.

### 4.2 Elementos clave

El modelo MER (detallado en `BASE_DE_DATOS_MER.md`) incluye:

- Tablas para:
  - Productos.
  - Promociones.
  - Eventos de consulta.
  - Usuarios administradores.

- Relaciones:
  - Cada promoción se vincula a un producto.
  - Cada evento de consulta se vincula a un producto.
  - Las operaciones de administración se vinculan, a nivel lógico, a usuarios administradores (según la granularidad de auditoría que se implemente).

### 4.3 Razones de diseño

- Se privilegia la **desactivación lógica** (por ejemplo, campo `activo`) frente al borrado físico, para preservar histórico de consultas.
- Se evita la duplicación de información de promociones; cada promoción se asocia explícitamente a un producto y tiene metadata de vigencia.
- El esquema permite extenderse, por ejemplo:
  - Añadiendo tipos de promociones adicionales.
  - Incorporando sucursales o localizaciones.
  - Guardando más detalles de auditoría si se requieren.

---

## 5. Seguridad y autenticación

### 5.1 Decisión: no usar JWT en esta versión

Aunque **JWT (JSON Web Tokens)** es una técnica común para autenticar en APIs, en el contexto de WINE-PICK-QR se decide **no utilizar JWT** en la versión actual, por los siguientes motivos:

- El sistema contempla principalmente **un único tipo de cliente** para administración (el navegador web).
- No existe, por ahora, la necesidad de habilitar múltiples aplicaciones cliente (web + móviles nativas + terceros).
- PHP dispone de un mecanismo de **sesiones** maduro y suficiente para este caso.

### 5.2 Autenticación basada en sesiones

En su lugar, se adopta un esquema clásico de autenticación con **sesiones de servidor**:

1. El administrador envía sus credenciales al endpoint de login.
2. El backend:
   - Verifica usuario y contraseña.
   - Si son correctos, inicia una sesión y registra el identificador del administrador.
3. El servidor responde confirmando el inicio de sesión.
4. En las peticiones siguientes:
   - El navegador envía automáticamente la cookie de sesión.
   - La API comprueba la existencia y validez de la sesión antes de permitir operaciones protegidas.

Medidas adicionales:

- Contraseñas almacenadas mediante funciones de hash seguras.
- Cookie de sesión marcada como `HttpOnly` y `Secure` en entornos con HTTPS.
- Validaciones robustas de datos de entrada.

### 5.3 Autorización

- Las operaciones de consulta de productos y fichas son **públicas**.
- Las operaciones de gestión de catálogo, promociones y métricas solo se permiten a administradores con sesión activa.
- Esta autorización se implementa en:
  - Controladores de la API (interrumpiendo la petición con un error 401/403 si el usuario no está autenticado).
  - Posiblemente en el frontend, adaptando la interfaz (ocultando secciones administrativas a usuarios no autenticados).

---

## 6. Resumen de decisiones clave

- **Frontend**
  - JavaScript moderno sin frameworks grandes.
  - Uso de:
    - `html5-qrcode` para QR.
    - `dayjs` para fechas.
    - `Chart.js` para métricas.
  - Interfaz basada en Bootstrap.
  - PWA con manifest y service worker básico.

- **Backend**
  - PHP estructurado según MVC.
  - API RESTful que devuelve JSON.
  - Capas de controladores, servicios, modelos y repositorios.

- **Base de datos**
  - MySQL/MariaDB con modelo entidad–relación explícito.
  - Foco en productos, promociones, eventos de consulta y administradores.

- **Seguridad**
  - Autenticación y autorización basadas en sesiones de servidor.
  - No se utiliza JWT en esta versión.
  - Buenas prácticas en almacenamiento de contraseñas y manejo de cookies.

Este stack y estos patrones están pensados para ser:

- Suficientemente robustos y profesionales.
- Claros y defendibles en un contexto académico.
- Abiertos a futuras extensiones sin necesidad de reescribir el proyecto desde cero.
