# Diseño funcional – WINE-PICK-QR

## 1. Introducción

Este documento traduce los requerimientos del sistema WINE-PICK-QR en un **diseño funcional orientado a usuarios**, utilizando:

- Perfiles de usuario.
- Historias de usuario.
- Reglas de negocio.
- Casos borde.
- Un esquema general de pantallas y navegación.

Sirve como base para el diseño técnico, la construcción y las pruebas de aceptación.

## 2. Perfiles de usuario

- **Cliente final**
  - Persona que visita una vinoteca/licorería y desea elegir una bebida informada.
  - Utiliza su propio celular para escanear QR o buscar productos.

- **Personal del local**
  - Vendedores, sommeliers o cajeros que acompañan la decisión de compra.
  - Utilizan la misma interfaz pública que el cliente, desde un dispositivo del negocio.

- **Administrador**
  - Persona responsable de mantener actualizado el catálogo, las promociones y revisar métricas.
  - Accede a un panel de administración protegido por login.

## 3. Historias de usuario

A continuación se listan las historias más relevantes del MVP. Se pueden desglosar en más historias técnicas en el backlog.

### 3.1. Cliente – Consulta por QR

**HU-C1 – Consultar producto desde QR**

> Como **cliente en góndola**,  
> quiero **escasear un código QR pegado en el estante o en la botella**,  
> para **ver la información del producto y decidir si me conviene comprarlo**.

**Criterios de aceptación (GWT)**

- _Dado_ que me encuentro frente a una góndola con un producto con código QR,  
  _cuando_ escaneo el QR con la cámara de mi celular,  
  _entonces_ el navegador debe abrir la ficha del producto correspondiente.

- _Dado_ que la ficha del producto se carga correctamente,  
  _cuando_ la visualizo,  
  _entonces_ debo ver como mínimo: nombre, tipo de bebida, bodega/destilería, origen, descripción corta, precio de referencia y promoción vigente (si existe).

### 3.2. Cliente – Búsqueda y exploración

**HU-C2 – Buscar productos por texto**

> Como **cliente**,  
> quiero **buscar productos por nombre, tipo de bebida o bodega**,  
> para **encontrar alternativas que se ajusten a lo que estoy buscando**.

**Criterios de aceptación**

- _Dado_ que estoy en la pantalla principal de la aplicación,  
  _cuando_ ingreso un texto en el buscador y confirmo la búsqueda,  
  _entonces_ el sistema debe mostrar un listado de productos cuyo nombre o datos relevantes contengan el texto ingresado.

**HU-C3 – Ver productos en promoción**

> Como **cliente**,  
> quiero **ver un listado de productos que estén en promoción**,  
> para **aprovechar descuentos o precios especiales**.

### 3.3. Personal del local – Apoyo al cliente

**HU-P1 – Mostrar ficha al cliente**

> Como **miembro del personal**,  
> quiero **usar mi dispositivo para mostrar fichas de producto al cliente**,  
> para **explicar mejor las características y promociones**.

**Criterios de aceptación**

- _Dado_ que tengo un dispositivo con acceso a la aplicación,  
  _cuando_ escaneo un QR o busco un producto,  
  _entonces_ puedo mostrar la misma ficha pública que vería cualquier cliente.

### 3.4. Administrador – Gestión de productos

**HU-A1 – Crear producto**

> Como **administrador**,  
> quiero **dar de alta un nuevo producto**,  
> para **incorporarlo al catálogo disponible para consulta**.

**Criterios de aceptación**

- El formulario de alta debe solicitar los campos obligatorios definidos en el modelo de datos.
- Si los datos son válidos, el producto queda disponible para su consulta (ya sea mediante QR o búsqueda).

**HU-A2 – Editar producto**

> Como **administrador**,  
> quiero **modificar la información de un producto existente**,  
> para **corregir datos o actualizar precios y descripciones**.

**HU-A3 – Desactivar producto**

> Como **administrador**,  
> quiero **desactivar un producto que ya no se comercializa**,  
> para **que deje de mostrarse en la interfaz pública sin perder su histórico de datos**.

### 3.5. Administrador – Gestión de promociones

**HU-A4 – Crear promoción simple**

> Como **administrador**,  
> quiero **definir una promoción simple para un producto (descuento o precio promocional)**,  
> para **destacar ofertas vigentes en góndola y en la ficha**.

**HU-A5 – Gestionar vigencia de promociones**

> Como **administrador**,  
> quiero **definir fechas de inicio y fin para las promociones**,  
> para **controlar su vigencia sin tener que hacer cambios manuales el día del vencimiento**.

### 3.6. Administrador – Métricas

**HU-A6 – Ver productos más consultados**

> Como **administrador**,  
> quiero **ver qué productos fueron más consultados en los últimos 30 días**,  
> para **evaluar interés y ajustar el surtido o las promociones**.

**HU-A7 – Ver consultas diarias por canal**

> Como **administrador**,  
> quiero **ver cuántas consultas se hicieron por día y por canal (QR / búsqueda)**,  
> para **entender cómo se usa la herramienta en góndola**.

### 3.7. Administrador – Autenticación

**HU-A8 – Iniciar sesión en el panel de administración**

> Como **administrador**,  
> quiero **iniciar sesión con usuario y contraseña**,  
> para **acceder al panel sin exponer sus funciones a cualquier usuario**.

## 4. Reglas de negocio

1. **Visibilidad de productos**
   - Sólo los productos marcados como activos deben ser visibles en las búsquedas y fichas públicas.
   - Los productos desactivados conservan su información y los eventos de consulta históricos.

2. **Promociones**
   - Cada producto puede tener, como máximo, una promoción simple vigente a la vez.
   - El precio mostrado en la ficha es el precio promocional si existe una promoción activa y vigente; de lo contrario, se muestra el precio base.
   - Las promociones vencidas se consideran inactivas para la lógica de precios y listados, pero pueden conservarse como histórico.

3. **Eventos de consulta**
   - Cada acceso exitoso a la ficha de un producto debe generar un evento de consulta asociado.
   - El canal de consulta se registra como QR o búsqueda, según cómo se haya llegado a la ficha.
   - Los eventos de consulta no se borran en el MVP; a futuro pueden agregarse procesos de archivado.

4. **Autenticación**
   - Todas las operaciones de administración requieren sesión de administrador activa.
   - Las contraseñas de administradores no se almacenan en texto plano.

5. **Integridad de datos**
   - No se permiten referencias a productos o promociones inexistentes.
   - La eliminación física de productos o promociones se evita en el MVP; se prefiere la baja lógica.

## 5. Casos borde y situaciones especiales

- **Producto desactivado con QR aún visible en góndola**
  - Si un cliente escanea el QR de un producto desactivado, la aplicación debe mostrar un mensaje claro indicando que el producto no está disponible, ofreciendo volver a la pantalla principal o a la búsqueda.

- **Promoción vencida**
  - Si se alcanza la fecha de fin de una promoción, el producto debe dejar de considerarse en promoción aun cuando el QR y la ficha sigan siendo accesibles.

- **QR inválido o código no existente**
  - Si el código público recibido no corresponde a ningún producto, se debe mostrar un mensaje de error amigable y opciones para ir a la búsqueda o al inicio.

- **Sin conexión o error del servidor**
  - Si no se puede cargar la ficha por problemas de conexión o servidor, se debe mostrar un mensaje claro y la recomendación de reintentar más tarde.

## 6. Pantallas y navegación (visión general)

A nivel funcional, se contemplan al menos las siguientes pantallas:

1. **Pantalla de inicio pública**
   - Breve explicación de la herramienta.
   - Buscador de productos.
   - Accesos a “En promoción” y “Más consultados”.

2. **Pantalla de resultados de búsqueda**
   - Listado de productos coincidentes con el término buscado.
   - Posibilidad de refinar filtros (tipo de bebida, bodega/destilería, etc.).

3. **Pantalla de ficha de producto**
   - Información detallada del producto.
   - Información de promoción (si aplica).
   - Acceso a otros productos relacionados (opcional).

4. **Pantalla de login de administrador**
   - Formulario usuario/contraseña.
   - Mensajes de error en caso de credenciales inválidas.

5. **Panel de administración**
   - Secciones:
     - Gestión de productos (listado, alta, edición, desactivación).
     - Gestión de promociones.
     - Métricas (productos más consultados, consultas diarias).
   - Opcionalmente, accesos directos desde la ficha pública cuando el administrador está autenticado.

## 7. Relación con otros documentos

Este diseño funcional se apoya en:

- `01_DESCUBRIMIENTO_Y_REQUERIMIENTOS.md` (contexto y requerimientos).
- `ARQUITECTURA_TECNICA.md` (vista técnica de componentes y flujos).
- `BASE_DE_DATOS_MER.md` (modelo entidad–relación).
- `API_REST.md` (endpoints públicos y administrativos).
