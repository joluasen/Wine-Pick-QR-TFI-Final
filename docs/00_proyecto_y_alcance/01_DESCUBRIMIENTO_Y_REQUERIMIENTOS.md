# Descubrimiento y Requerimientos – WINE-PICK-QR

## 1. Contexto del negocio

WINE-PICK-QR se ubica en el contexto de vinotecas y licorerías que venden:

- Vinos de distintas bodegas, regiones y añadas.
- Espumantes.
- Bebidas espirituosas (whisky, gin, ron, licores, etc.).
- Otras bebidas afines.

En estos comercios, la decisión de compra suele depender de:

- La información disponible en góndola (etiquetas, carteles, flyers).
- La asistencia del personal (vendedores, sommeliers, cajeros).
- La familiaridad del cliente con marcas y estilos.

La idea es **digitalizar la experiencia de góndola** mediante códigos QR y una aplicación web liviana que:

- Permita al cliente informarse sin esperar a que el personal esté libre.
- Facilite que el personal use la misma herramienta para explicar productos y promociones.
- Le dé al administrador datos concretos sobre qué se consulta y cuándo.

## 2. Mapa de procesos

A continuación se describen los procesos clave que WINE-PICK-QR busca soportar.

### 2.1. Proceso de consulta del cliente

1. El cliente se acerca a la góndola de vinos/espirituosas.
2. Observa un código QR asociado a un producto (en el estante o en la botella).
3. Escanea el código QR con la cámara de su celular o con la app de cámara del sistema operativo.
4. El celular abre una URL de la aplicación WINE-PICK-QR correspondiente al producto.
5. La aplicación muestra la ficha pública del producto:
   - Nombre, tipo de bebida, bodega/destilería.
   - Origen, añada, varietal (si aplica).
   - Descripción corta.
   - Precio base y, si aplica, datos de promoción.
6. El cliente, si lo desea, navega hacia otros productos mediante:
   - Búsqueda por texto.
   - Listados de productos en promoción o más consultados.

### 2.2. Proceso de apoyo del personal del local

1. El personal del local utiliza la misma interfaz pública en un dispositivo del comercio (celular, tablet, PC).
2. Cuando un cliente pide ayuda, el personal puede:
   - Escanear el QR del producto frente al cliente.
   - Buscar productos similares o alternativas (por tipo, rango de precio, etc.).
3. El personal utiliza la ficha para complementar su recomendación:
   - Resalta descripciones, origen, tipo de bebida.
   - Menciona promociones vigentes.
4. El cliente decide la compra con información más clara.

### 2.3. Proceso de gestión de productos y promociones (administrador)

1. El administrador accede al panel de administración (login).
2. Desde el panel puede:
   - Ver un listado de productos con filtros.
   - Crear nuevos productos o editar existentes.
   - Desactivar productos que ya no se comercializan.
3. Para la gestión de promociones:
   - Define promociones simples por producto (descuento o precio promocional).
   - Establece fechas de inicio y fin.
   - Activa/desactiva promociones según la estrategia comercial.
4. Los cambios se reflejan en las fichas públicas de forma inmediata o con mínima latencia.

### 2.4. Proceso de registro de métricas y consulta de reportes

1. Cada vez que se muestra la ficha de un producto:
   - El sistema registra un evento de consulta con:
     - Producto consultado.
     - Canal (QR o búsqueda).
     - Fecha y hora.
2. El administrador accede a la sección de métricas:
   - Visualiza los productos más consultados en los últimos 30 días.
   - Consulta series diarias de consultas (total y por canal).
3. El administrador utiliza esta información para:
   - Evaluar la efectividad de promociones.
   - Detectar productos “estrella” o con alta curiosidad.
   - Ajustar la estrategia de surtido y comunicación.

## 3. Requerimientos funcionales

A continuación se listan los principales requerimientos funcionales (RF).

### 3.1. Consulta pública

- **RF1.** El sistema debe permitir acceder a la ficha pública de un producto mediante una URL codificada en un QR.
- **RF2.** El sistema debe ofrecer un buscador de productos por texto, filtrando por nombre, tipo de bebida, bodega/destilería y/o varietal.
- **RF3.** El sistema debe permitir listar productos en promoción vigentes.
- **RF4.** El sistema debe permitir listar productos más consultados en los últimos 30 días.

### 3.2. Ficha de producto

- **RF5.** La ficha de producto debe mostrar al menos:
  - Nombre del producto.
  - Tipo de bebida.
  - Bodega/destilería.
  - Origen.
  - Varietal (si aplica).
  - Añada (si aplica).
  - Descripción corta.
  - Precio base de referencia.
  - Información de promoción vigente (si existe).
  - Indicador simple de disponibilidad.

### 3.3. Gestión de productos (administrador)

- **RF6.** El sistema debe permitir al administrador autenticado crear nuevos productos.
- **RF7.** El sistema debe permitir editar los datos de productos existentes.
- **RF8.** El sistema debe permitir desactivar productos (baja lógica) para que no se muestren al público.
- **RF9.** El sistema debe permitir al administrador escanear un QR y acceder rápidamente a la ficha del producto para editarlo.

### 3.4. Gestión de promociones (administrador)

- **RF10.** El sistema debe permitir al administrador crear promociones por producto:
  - Descuento porcentual sobre el precio base.
  - Precio final promocional.
  - Combos básicos (2x1, 3x2, NxM donde N unidades se llevan al precio de M).
- **RF11.** El sistema debe permitir definir fechas de vigencia (inicio y fin) de cada promoción.
- **RF12.** El sistema debe evitar que un mismo producto tenga más de una promoción vigente al mismo tiempo.
- **RF13.** El sistema debe permitir desactivar o finalizar promociones.

### 3.5. Métricas y reportes

- **RF14.** El sistema debe registrar un evento de consulta cada vez que se accede a la ficha de un producto.
- **RF15.** Cada evento de consulta debe registrar el canal (QR o búsqueda) y la fecha/hora.
- **RF16.** El sistema debe ofrecer un reporte de productos más consultados en los últimos 30 días.
- **RF17.** El sistema debe ofrecer un reporte de consultas diarias, totales y por canal.

### 3.6. Autenticación y seguridad básica

- **RF18.** El panel de administración debe estar protegido por autenticación (usuario/contraseña).
- **RF19.** El sistema no debe permitir accesos no autenticados a las operaciones de administración de productos, promociones y métricas.
- **RF20.** Las contraseñas de administradores deben almacenarse de forma segura (hash).

## 4. Requerimientos no funcionales

- **RNF1 – Usabilidad.** La interfaz debe ser clara y usable en pantallas de celular, con diseño responsivo.
- **RNF2 – Rendimiento.** Las fichas de productos y listados deben responder en tiempos aceptables para navegación móvil estándar.
- **RNF3 – Compatibilidad.** La aplicación debe funcionar en navegadores modernos y en dispositivos móviles Android/iOS recientes.
- **RNF4 – Seguridad.** Todos los formularios deben validar entradas tanto en frontend como en backend; deben minimizarse riesgos comunes (SQL Injection, XSS).
- **RNF5 – Mantenibilidad.** El código debe organizarse siguiendo una arquitectura clara (por ejemplo, MVC en backend, módulos JS en frontend).
- **RNF6 – Trazabilidad.** Cada cambio significativo debe estar asociado a una issue en Git, con referencia en el changelog del proyecto.

## 5. Priorización 

Clasificación inicial de requerimientos:

- **Must have (imprescindibles para el MVP):**
  - RF1–RF9 (consulta pública, ficha, gestión básica de productos).
  - RF10–RF12 (promociones simples por producto).
  - RF14–RF16 (registro de consultas y reporte de productos más consultados).
  - RF18–RF19 (autenticación básica de admin).
  - RNF1–RNF4.

- **Should have (muy deseables, si el tiempo lo permite):**
  - RF13 (desactivación explícita de promociones).
  - RF17 (reporte de consultas diarias por canal).
  - RNF5–RNF6.

- **Could have (mejoras futuras):**
  - Extensiones de promociones a combos complejos.
  - Métricas adicionales (tiempo de permanencia, embudos de navegación).
  - Múltiples roles de administración con permisos diferenciados.

- **Won’t have (descartados en este MVP):**
  - Integración con sistemas de stock y facturación.
  - Cuentas de clientes finales.
  - Multi-sucursal en producción.

Esta priorización se utilizará como base para el **backlog** y la **planificación de sprints** detallada en el documento de Gestión Ágil.
