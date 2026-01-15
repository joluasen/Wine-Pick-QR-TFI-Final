# BASE_DE_DATOS_MER – WINE-PICK-QR

Este documento describe el **modelo de datos** de WINE-PICK-QR desde una perspectiva conceptual y lógica, tomando como base la descripción funcional del proyecto y la arquitectura técnica definida en documentos previos (`README.md` y `ARQUITECTURA_TECNICA.md`).

El objetivo es:

- Alinear el modelo de datos con los **flujos reales de uso** en una vinoteca/licorería.
- Dejar claras las **entidades principales**, sus atributos y relaciones.
- Documentar las **reglas de integridad y de negocio** que deben respetarse desde la base de datos y/o desde la API.
- Servir como referencia para el diseño físico en MySQL y para la implementación de la capa de acceso a datos.

> Nota: El modelo está pensado para una **base de datos relacional** (por ejemplo, MySQL), pero las entidades y relaciones son lo suficientemente generales como para ser adaptadas a otros motores.

---

## 1. Visión general del modelo

WINE-PICK-QR se centra en cuatro grupos principales de información:

1. **Productos**  
   Vinos, espumantes, destilados, cervezas especiales y otros licores que se ofrecen en la vinoteca/licorería.

2. **Promociones**  
   Reglas simples asociadas a productos individuales para comunicar un **precio final con promoción aplicada**.

3. **Eventos de consulta**  
  Registros de las veces que un producto es consultado (por **QR** o por **búsqueda**) en la tabla `consult_events`, para obtener métricas agregadas sin manejar datos personales.

4. **Usuarios administradores**  
   Personas autorizadas para acceder al panel de administración y gestionar catálogo, promociones y métricas.

A partir de estos grupos se proponen las siguientes entidades principales:

- `Producto`
- `PromocionProducto`
-- `ConsultEvent`
- `UsuarioAdministrador`

En el modelo lógico, estas entidades se corresponden con tablas:

- `productos`
- `promociones`
-- `consult_events`
- `usuarios_admin`

---

## 2. Entidades principales (nivel conceptual)

### 2.1 Producto

Representa a cada vino, espumante, destilado, cerveza especial u otro licor que se ofrece al público.

Rol en el sistema:

- Es la entidad **central** del modelo.
- Está asociada a un **código QR único** (identificador público), que permite llegar a la ficha desde la cámara o desde la PWA.
- Se utiliza tanto para:
  - Mostrar la **ficha pública** al cliente.
  - Permitir su **gestión** desde el panel de administración.
  - Servir como referencia para métricas de consultas.

### 2.2 Promoción de producto

Representa una **promoción individual** aplicada a un producto concreto, por ejemplo:

- Descuento porcentual.
- Precio especial.
- “2x1” u otras variantes simples, según el alcance definido.

Rol en el sistema:

- Permite calcular el **precio final** que el cliente verá en la ficha.
- Está siempre asociada a **un único producto**.
- Puede estar activa o inactiva según su vigencia.

Regla conceptual clave:

- En un momento dado, un producto puede tener **cero o una promoción vigente** (no se manejan combinaciones complejas en el MVP).

### 2.3 Evento de consulta

Registra los eventos cuando un cliente (o el personal del local) **consulta la ficha de un producto**, ya sea:

- Escaneando el **código QR**.
- Utilizando el **buscador por texto**.

Rol en el sistema:

- Sirve como base para calcular métricas agregadas del tipo:
  - “Productos más consultados.”
  - “Consultas por día.”
  - “Porcentaje de consultas por QR vs búsqueda.”

Se almacena en la tabla `consult_events` y se diseña explícitamente para **no almacenar datos personales**, alineado con el objetivo de registrar solo métricas agregadas.

### 2.4 Usuario administrador

Representa a la persona (o personas) autorizadas para:

- Iniciar sesión en el panel de administración.
- Crear, modificar, activar o desactivar productos.
- Gestionar promociones.
- Consultar métricas básicas.

Rol en el sistema:

- Dar soporte a un nivel de **acceso protegido**, diferenciando la parte pública (consulta de fichas y búsquedas) de la parte privada (gestión).

---

## 3. Modelo lógico propuesto (tablas y campos)

En esta sección se describe un posible diseño lógico para MySQL, manteniendo un equilibrio entre claridad y normalización.

> Los tipos de datos (`VARCHAR`, `DECIMAL`, etc.) son sugeridos; pueden ajustarse en la implementación física según criterios de rendimiento o preferencias del equipo.

---

### 3.1 Tabla `productos`

Almacena la información principal de cada producto disponible en la vinoteca/licorería.

**Nombre de tabla:** `productos`

**Campos sugeridos:**

- `id_producto` (PK, `INT` autoincremental)  
  Identificador interno del producto.

- `codigo_publico` (`VARCHAR(64)`, UNIQUE, NOT NULL)  
  Identificador público utilizado en la URL y embebido en el QR. Debe ser **estable en el tiempo** para evitar regenerar códigos.

- `nombre` (`VARCHAR(150)`, NOT NULL)  
  Nombre comercial del producto.

- `tipo_bebida` (`ENUM('vino','espumante','whisky','gin','licor','cerveza','otro')`, NOT NULL)  
  Clasificación general para búsquedas y filtros.

- `bodega_destileria` (`VARCHAR(150)`, NOT NULL)  
  Bodega, destilería o marca principal (según aplique).

- `varietal` (`VARCHAR(100)`, NULLABLE)  
  Varietal del vino o descripción breve del tipo de bebida.

- `origen` (`VARCHAR(100)`, NULLABLE)  
  País, región o zona de origen.

- `cosecha` (`SMALLINT`, NULLABLE)  
  Año/cosecha cuando aplica.

- `descripcion_corta` (`VARCHAR(255)`, NULLABLE)  
  Descripción breve utilizada en la ficha pública.

- `precio_base` (`DECIMAL(10,2)`, NOT NULL)  
  Precio base desde el cual se aplica la promoción (si existe).

- `stock_visible` (`INT`, NULLABLE)  
  Cantidad aproximada o indicador de stock para mostrar en la ficha (dependiendo de la estrategia).

- `url_imagen` (`VARCHAR(255)`, NULLABLE)  
  Enlace a la imagen del producto (si se utiliza).

- `activo` (`TINYINT(1)`, NOT NULL, default 1)  
  Indica si el producto está activo (1) o desactivado (0) para la vista pública.

- `fecha_alta` (`DATETIME`, NOT NULL)  
  Fecha y hora de creación del registro.

- `fecha_ultima_actualizacion` (`DATETIME`, NOT NULL)  
  Última modificación relevante (precio, promoción asociada, descripción, etc.).

- `id_admin_ultima_modificacion` (`INT`, NULLABLE, FK opcional a `usuarios_admin.id_admin`)  
  Referencia opcional al administrador que realizó la última modificación, para fines de auditoría básica.

**Claves y restricciones:**

- **PK:** `id_producto`
- **UK:** `codigo_publico` (no puede haber dos productos con el mismo identificador público).
- **FK opcional:** `id_admin_ultima_modificacion` → `usuarios_admin.id_admin`
- Índices recomendados:
  - Índice por `nombre` (para búsqueda).
  - Índice por `bodega_destileria`.
  - Índice por `varietal`.
  - Índice combinado según los filtros más utilizados.

---

### 3.2 Tabla `promociones`

Almacena las promociones asociadas a productos. En el MVP se contempla **una promoción simple por producto** (como máximo una vigente a la vez).

**Nombre de tabla:** `promociones`

**Campos sugeridos:**

- `id_promocion` (PK, `INT` autoincremental)  
  Identificador interno de la promoción.

- `id_producto` (`INT`, NOT NULL, FK)  
  Producto al que se aplica la promoción.

- `tipo_promocion` (`ENUM('porcentaje','precio_fijo','2x1','n_por_m','otro')`, NOT NULL)  
  Tipo general de promoción.

- `valor_parametro` (`DECIMAL(10,2)`, NOT NULL)  
  Parámetro principal del cálculo, por ejemplo:
  - Porcentaje de descuento (ej.: 20 = 20%).
  - Precio final promocional.
  - Valor asociado a la modalidad “n por m”.

- `descripcion_visible` (`VARCHAR(255)`, NULLABLE)  
  Texto que se muestra en la ficha (por ejemplo, “20% OFF pagando en efectivo”).

- `fecha_inicio` (`DATETIME`, NOT NULL)  
  Inicio de vigencia.

- `fecha_fin` (`DATETIME`, NULLABLE)  
  Fin de vigencia (si es `NULL`, puede interpretarse como “hasta nuevo aviso”).

- `activa` (`TINYINT(1)`, NOT NULL, default 1)  
  Indica si la promoción está activa en este momento.

- `creada_por` (`INT`, NULLABLE, FK a `usuarios_admin.id_admin`)  
  Administrador que creó la promoción.

- `fecha_creacion` (`DATETIME`, NOT NULL)  
  Fecha y hora de creación.

- `fecha_ultima_actualizacion` (`DATETIME`, NOT NULL)  
  Última modificación de la promoción.

**Claves y restricciones:**

- **PK:** `id_promocion`
- **FK:** `id_producto` → `productos.id_producto`
- **FK (opcional):** `creada_por` → `usuarios_admin.id_admin`

**Regla de negocio importante (a nivel modelo):**

- Para cada `id_producto`, debe existir **como máximo una promoción activa y vigente** en un momento dado.
- Esto puede implementarse mediante:
  - Lógica en la API (validando antes de insertar/activar una nueva promoción).
  - Y/o una restricción lógica, por ejemplo:
    - Índice filtrado por (`id_producto`, `activa`) donde no se permitan duplicados de `activa = 1`.

---


### 3.3 Tabla `consult_events`

Registra cada consulta de ficha de producto, ya sea por QR o por búsqueda. Es la base para las métricas agregadas.

**Nombre de tabla:** `consult_events`

**Campos reales:**

- `id` (PK, `INT` autoincremental)  
  Identificador interno del evento.

- `product_id` (`INT`, NOT NULL, FK)  
  Producto al que corresponde la consulta.

- `occurred_at` (`DATETIME`, NOT NULL)  
  Momento exacto de la consulta.

- `channel` (`ENUM('QR','BUSQUEDA')`, NOT NULL)  
  Indica si la consulta provino de:
  - Escaneo de código QR (`QR`).
  - Búsqueda por texto (`BUSQUEDA`).

- `context_info` (`VARCHAR(100)`, NULLABLE)  
  Campo genérico para extensiones futuras (por ejemplo, “sucursal_1”, “demo_tienda”, etc.).  
  No se recomienda almacenar datos personales ni identificadores directos de clientes.

**Claves y restricciones:**

- **PK:** `id`
- **FK:** `product_id` → `productos.id_producto`

**Consideraciones de privacidad:**

- No se almacenan nombres, correos, teléfonos ni ningún dato personal.
- El registro se utiliza únicamente para contar consultas agregadas (por producto, por día, por canal, etc.).

---

### 3.4 Tabla `admin_users`

Almacena los datos de los usuarios autorizados para ingresar al panel de administración.

**Nombre de tabla:** `admin_users`

**Campos reales:**

- `id` (PK, `INT` autoincremental)  
  Identificador interno del administrador.

- `username` (`VARCHAR(50)`, UNIQUE, NOT NULL)  
  Nombre de usuario para iniciar sesión.

- `password_hash` (`VARCHAR(255)`, NOT NULL)  
  Hash de la contraseña del administrador.

- `full_name` (`VARCHAR(150)`, NULL)  
  Nombre y apellido del administrador.

- `email` (`VARCHAR(150)`, NULL)  
  Correo electrónico de contacto.

- `is_active` (`TINYINT(1)`, NOT NULL, default 1)  
  Indica si el usuario está activo (1) o desactivado (0).

- `created_at` (`DATETIME`, NOT NULL)  
  Fecha y hora de creación del usuario.

- `last_login_at` (`DATETIME`, NULL)  
  Último acceso registrado.

**Claves y restricciones:**

- **PK:** `id`
- **UK:** `username` (no se permiten usuarios duplicados).

- **PK:** `id_admin`
- **UK:** `usuario` (no se permiten usuarios duplicados).

---

## 4. Relaciones y cardinalidades

A nivel conceptual, las relaciones principales son:

1. **Producto – Promoción de producto**

   - Un `Producto` puede tener **cero o muchas** promociones históricas (`PromocionProducto`).
   - En un momento dado, puede haber **a lo sumo una promoción activa** (según la regla de negocio del MVP).
   - Cardinalidad: `Producto (1) — (0..N) PromocionProducto`

2. **Producto – Evento de consulta**

  - Un `Producto` puede haber sido consultado **cero o muchas** veces.
  - Cada `ConsultEvent` pertenece a **exactamente un** producto.
  - Cardinalidad: `Producto (1) — (0..N) ConsultEvent`

3. **Usuario administrador – Producto / Promoción**

   - Un `UsuarioAdministrador` puede crear o modificar muchos `Productos` y `Promociones`.
   - Un producto o promoción puede haber sido modificada por distintos administradores a lo largo del tiempo.  
     (En el modelo propuesto se conserva solo el último administrador que modificó el registro, extendible a una tabla de auditoría en el futuro).
   - Cardinalidad conceptual: `UsuarioAdministrador (1) — (0..N) Producto` y `UsuarioAdministrador (1) — (0..N) PromocionProducto`

---

## 5. Reglas de integridad y de negocio reflejadas en el modelo

Además de las claves primarias y foráneas, el modelo busca reforzar algunas reglas de negocio clave:

1. **Productos activos visibles al público**

   - Solo los productos con `activo = 1` deben mostrarse en:
     - Resultados de búsqueda.
     - Fichas públicas.
     - Listas de “más consultados” o “en promoción”.
   - Los productos desactivados se preservan para histórico (eventos de consulta, promociones pasadas, etc.), pero no aparecen para el cliente.

2. **Promoción única vigente por producto**

   - En la versión actual, se simplifica la lógica para evitar combinaciones complejas.
   - Por producto, solo puede haber una promoción “vigente y activa” que se utilice para calcular el precio final.
   - Promociones vencidas pueden quedar registradas para histórico.

3. **Preservación del histórico de consultas**

   - Los `eventos_consulta` no se eliminan al desactivar un producto.
   - Esto permite:
     - Analizar la evolución de interés en el tiempo.
     - Obtener métricas incluso de productos que ya no están en góndola.

4. **Preferencia por desactivación lógica frente a borrado físico**

   - Para `productos` y `usuarios_admin`, el enfoque recomendado es:
     - **Desactivación** (`activo = 0`) cuando se desea que dejen de usarse.
     - Borrado físico solo si existe una razón justificada y se garantiza que no se afecta el histórico necesario.

---

## 6. Consideraciones para el diseño físico en MySQL

Algunas decisiones adicionales que pueden tomarse al momento de crear las tablas:

- **Tipos de datos y tamaños:**
  - Ajustar longitudes de `VARCHAR` según el catálogo real (por ejemplo, si las bodegas rara vez superan cierta cantidad de caracteres).
  - Evaluar si `DECIMAL(10,2)` es suficiente para todos los precios según el contexto.

- **Índices:**
  - Crear índices específicos para mejorar:
    - La búsqueda por `nombre`, `bodega_destileria`, `varietal` y `tipo_bebida`.
    - El cálculo de métricas en `eventos_consulta` (índices por `id_producto` y por `fecha_hora`).
  - Evaluar índices compuestos si determinadas combinaciones de campos se consultarán con frecuencia.

- **Integridad referencial:**
  - Definir el comportamiento ante borrado de un producto:
    - Recomendado: restringir el `DELETE` si existen eventos de consulta, o bien no permitir el borrado físico y utilizar únicamente desactivación lógica.
  - Especificar claramente las acciones `ON UPDATE` y `ON DELETE` para cada FK.

- **Auditoría:**
  - Si se requiriera un nivel mayor de trazabilidad, se puede incorporar:
    - Tabla de “historial de cambios” para `productos`.
    - Registro de quién activó/desactivó una promoción y cuándo.

---

## 7. Relación con otros documentos

Este documento se relaciona directamente con:

- `README.md`  
  Donde se explica el proyecto desde el punto de vista funcional, el contexto de la vinoteca/licorería y los flujos de uso.

- `ARQUITECTURA_TECNICA.md`  
  Donde se describe:
  - La organización en capas (cliente web, API, base de datos).
  - Los flujos de interacción (consulta por QR, búsqueda por texto, operaciones administrativas).
  - La forma en que la API utiliza el modelo de datos para responder en JSON.

- `API_REST.md` (pendiente de elaboración)  
  Donde se detallarán:
  - Endpoints disponibles (productos, promociones, métricas, autenticación).
  - Parámetros de entrada.
  - Esquemas de respuesta JSON.
  - Cómo cada endpoint interactúa con las tablas definidas en este documento.

---

## 8. Conclusión

El modelo de datos propuesto para WINE-PICK-QR:

- Mantiene a `Producto` como entidad central, alineada con la experiencia de góndola en una vinoteca/licorería.
- Introduce `PromocionProducto` como mecanismo sencillo para reflejar precios finales promocionales sin complicar el modelo.
- Registra `EventoConsulta` para obtener métricas útiles sin comprometer la privacidad de los clientes.
- Define `UsuarioAdministrador` como soporte para la capa de administración protegida.

Este diseño busca un equilibrio entre:

- **Simplicidad**, adecuada al alcance de un MVP y a la realidad operativa del comercio.
- **Claridad y extensibilidad**, permitiendo futuras ampliaciones (nuevos tipos de promociones, mayor normalización, más métricas) sin necesidad de replantear completamente el modelo.
