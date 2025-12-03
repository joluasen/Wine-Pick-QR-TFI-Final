# WINE-PICK-QR

WINE-PICK-QR es una solución diseñada para **vinotecas y licorerías** que necesitan comunicar con claridad el **precio final** de sus productos, incluyendo las **promociones vigentes**, sin generar confusión en góndola ni discusiones en la caja.

El proyecto propone una **aplicación web progresiva** que el cliente utiliza desde su propio teléfono para:

- Escanear un **código QR único por producto**, ubicado en la estantería o en la etiqueta, y acceder a una **ficha completa** del vino o licor.
- Buscar productos por nombre, bodega/destilería, varietal o tipo de bebida cuando no dispone de un QR a mano.

Del lado del negocio, WINE-PICK-QR ofrece un **panel administrativo** para mantener actualizado el catálogo de productos, definir promociones con reglas claras y consultar métricas básicas de uso, sin requerir conocimientos técnicos avanzados.

> Este proyecto forma parte de un **Trabajo Final Integrador** y se presenta con un enfoque orientado a la realidad operativa de una vinoteca/licorería.

---

## 1. Propósito del documento

Este documento tiene como finalidad presentar WINE-PICK-QR desde una perspectiva funcional y conceptual, de forma que cualquier lector pueda comprender:

- El problema que aborda la solución.
- Los objetivos que persigue.
- Los perfiles de usuario contemplados.
- El funcionamiento general de la aplicación.
- El alcance de la primera versión (MVP) y sus limitaciones.
- Los beneficios esperados para el negocio y para los clientes.

No se detallan aquí aspectos de implementación, código ni tecnologías específicas, que se abordan en documentos técnicos separados.

---

## 2. Contexto y problema

Las vinotecas y licorerías trabajan con un volumen considerable de información:

- Amplia variedad de vinos, espumantes, destilados, cervezas especiales y otros licores.
- Precios que se actualizan con frecuencia.
- Promociones ligadas a días, cantidades, medios de pago o combinaciones de productos.
- Cambios de catálogo por nuevas incorporaciones o productos discontinuados.

En ese contexto, es habitual que surjan las siguientes dificultades:

- **Cartelería desactualizada** en góndola cuando cambia un precio o una promoción.
- **Dudas recurrentes** por parte de los clientes sobre cuál es el precio final que se pagará en caja.
- **Dependencia constante del personal**, que debe responder siempre las mismas consultas.
- **Falta de datos estructurados** sobre qué productos generan mayor interés (tanto por consulta como por búsqueda).

El resultado es una experiencia de compra más lenta, con posibles malentendidos en el momento del pago y una carga operativa adicional para el personal del local.

---

## 3. Objetivos del proyecto

### 3.1 Objetivo general

Diseñar e implementar un sistema que permita:

- Al cliente: conocer el **precio final** y la **promoción vigente** de un producto mediante el escaneo de un código QR o la búsqueda por texto.
- Al negocio: **administrar productos y promociones** desde un panel sencillo, manteniendo la información centralizada y coherente.

### 3.2 Objetivos específicos

- Brindar una experiencia de consulta **rápida y clara** para el cliente en góndola.
- Reducir la cantidad de **consultas repetitivas** al personal sobre precios y promociones.
- Mantener la **señalización vigente** sin necesidad de reimprimir carteles cada vez que hay un cambio.
- Registrar **métricas agregadas** de uso (consultas por producto, día y canal QR/búsqueda) sin almacenar datos personales.
- Ofrecer al comercio una herramienta alineada con su operación diaria, sin complejidad innecesaria.

---

## 4. Perfiles de usuario

WINE-PICK-QR contempla tres perfiles principales:

1. **Cliente**
   - Persona que recorre la vinoteca/licorería.
   - Utiliza su propio teléfono para escanear códigos QR o buscar productos por texto.
   - No requiere autenticación ni registro.

2. **Personal del local**
   - Vendedores y colaboradores que asisten a los clientes en la sala de ventas.
   - Pueden utilizar la aplicación para consultar fichas y complementar la atención.
   - No necesariamente acceden al panel administrativo.

3. **Administrador**
   - Dueño, gerente o personal autorizado.
   - Dispone de credenciales de acceso al panel de administración.
   - Gestiona productos, promociones y revisa métricas.

---

## 5. Funcionamiento general

### 5.1 Código QR único por producto

Cada producto (vino, espumante, whisky, gin, licor u otro) cuenta con un **código QR único** que se asocia a su ficha dentro del sistema. Ese código puede:

- Ubicarse en la **góndola/estante** donde se exhibe el producto.
- Colocarse en una o varias **botellas** correspondientes al mismo producto (misma marca, añada, tipo de bebida, etc.).

Este QR contiene un enlace a una dirección específica de la aplicación, que identifica de forma segura al producto y permite mostrar su ficha actualizada.

### 5.2 Acceso desde la cámara del celular

El cliente puede:

1. Abrir la aplicación de cámara (o un lector de códigos QR).
2. Enfocar el código QR ubicado en el estante o en la botella.
3. El dispositivo reconoce que el código contiene una dirección web.
4. Al confirmar, se abre el navegador del teléfono y se muestra la **ficha correspondiente al producto**.

El cliente no necesita realizar pasos adicionales ni conocer detalles técnicos. El QR actúa como un vínculo directo entre el producto físico y su ficha digital.

### 5.3 Acceso desde la aplicación web

Como alternativa o complemento al escaneo desde la cámara, el cliente puede:

1. Acceder a la **aplicación web** de WINE-PICK-QR desde el navegador del teléfono.
2. Desde la pantalla principal, elegir:
   - **Escanear** un código QR mediante la cámara desde la propia aplicación.
   - **Buscar productos** utilizando un campo de búsqueda por texto.

En ambos casos (cámara o aplicación), el resultado es el mismo: la navegación hacia la ficha del producto identificado.

---

## 6. Flujos de uso por perfil

### 6.1 Cliente

Flujo típico:

1. El cliente se encuentra frente a un estante de vinos o licores.
2. Escanea el **código QR** con la cámara o accede a la aplicación y utiliza la opción de escaneo.
3. La aplicación muestra la **ficha del producto**, donde se incluyen:
   - Nombre del vino o licor.
   - Bodega o destilería.
   - Varietal o tipo de bebida.
   - Año o cosecha (cuando corresponde).
   - **Precio final vigente**, con la promoción aplicada si existe.
   - Estado de stock (por ejemplo: Disponible, Poco stock, Sin stock).
   - Descripción breve y, cuando esté disponible, imagen del producto.

Si el cliente no puede o no desea escanear el código:

4. Puede utilizar el **buscador por texto**:
   - Ingresando parte del nombre.
   - Indicando bodega/destilería.
   - Buscando por varietal o tipo de bebida.
5. La aplicación devuelve una lista de resultados desde la cual se accede a cada ficha.

Además, el cliente puede consultar secciones específicas:

- **Productos más consultados** (los más buscados o escaneados).
- **Productos en promoción**, con sus beneficios destacados.

### 6.2 Personal del local

El personal del local puede:

- Utilizar la aplicación para escanear un producto y mostrar su ficha al cliente.
- Verificar, junto con el cliente, el precio final y la promoción vigente.
- Utilizar la sección de productos en promoción para orientar recomendaciones.
- Apoyarse en la información de la ficha para ofrecer sugerencias (por ejemplo, según tipo de vino o maridaje declarado).

De este modo, la aplicación se convierte en una herramienta de apoyo a la venta y no solo en un recurso para el cliente final.

### 6.3 Administrador

El administrador, además de poder utilizar el sistema como cliente, dispone de un acceso específico al **panel de administración**, desde donde puede:

- **Iniciar sesión** con usuario y contraseña.
- **Gestionar el catálogo de productos**:
  - Dar de alta nuevos productos.
  - Actualizar información existente (precios, descripciones, estado de stock, etc.).
  - Desactivar productos que ya no se comercializan.
- **Gestionar promociones**:
  - Asociar promociones individuales a productos (por ejemplo, porcentaje de descuento o 2x1).
  - Definir vigencias mediante fechas “desde” y “hasta”.
  - Asegurar que cada producto tenga una única promoción vigente al mismo tiempo, evitando superposiciones.
- **Revisar métricas básicas de uso**:
  - Consultas por producto y por día.
  - Diferenciación entre consultas realizadas por escaneo de QR y por búsqueda textual.
  - Listado de productos más consultados, que puede orientar decisiones comerciales y de señalización.

Adicionalmente, el administrador puede aprovechar los códigos QR en la propia operación:

- Escanear, como administrador, el QR de un producto en la góndola.
- Acceder de forma directa a la vista interna de gestión de ese producto.
- Actualizar datos (por ejemplo, precio o promoción) sin necesidad de buscarlo manualmente en listados extensos.

---

## 7. Módulos funcionales principales

### 7.1 Módulo de catálogo de productos

- Registro de productos con:
  - Identificador interno.
  - Código público asociado al QR.
  - Nombre, bodega/destilería, varietal o estilo, origen, año/cosecha (si aplica).
  - Descripción breve.
  - Precio de lista (final al consumidor).
  - Estado de stock (disponible, poco stock, sin stock).
  - Imagen principal del producto (cuando se encuentre disponible).
- Posibilidad de activar o desactivar productos para controlar qué se muestra al público.

### 7.2 Módulo de promociones

- Definición de promociones individuales por producto (por ejemplo, porcentaje de descuento o promoción de tipo “2 por X”).
- Posibilidad de configurar promociones de combo simple (dos productos relacionados a un precio conjunto).
- Gestión de fechas de vigencia de cada promoción.
- Reglas básicas para evitar acumulación entre promociones:
  - Un producto no puede tener simultáneamente dos promociones individuales vigentes.
  - Las promociones de combo se gestionan como promociones independientes.

La ficha del producto siempre muestra **un único resultado final** para evitar confusión: el precio final ya calculado y la promoción aplicada en caso de corresponder.

### 7.3 Módulo de acceso por QR

- Asociación entre el código QR y el identificador público del producto.
- Resolución de la ficha correcta al abrir la dirección codificada en el QR.
- Comportamiento de contingencia (fallback) en caso de que el identificador no exista:
  - Redirección a la pantalla de búsqueda para que el usuario pueda localizar el producto manualmente.

### 7.4 Módulo de métricas

- Registro de eventos de consulta (vista o escaneo) por producto y fecha.
- Distinción entre consultas realizadas mediante:
  - Escaneo de QR.
  - Búsqueda por texto.
- Presentación de un resumen de “productos más consultados” para el administrador.
- Ausencia de datos personales: las métricas son agregadas y no identifican a personas específicas.

### 7.5 Módulo de administración

- Pantalla de inicio de sesión de administrador.
- Sección de productos con:
  - Listado general.
  - Filtros y búsqueda.
  - Acciones de alta, edición, desactivación.
- Sección de promociones:
  - Alta y edición de promociones asociadas a productos.
  - Control de vigencias.
  - Desactivación de promociones caducadas.
- Sección de métricas:
  - Productos más consultados.
  - Diferenciación entre canales (QR/búsqueda).
  - Vista resumida orientada a la toma de decisiones.

---

## 8. Alcance de la versión actual (MVP)

La versión inicial de WINE-PICK-QR se focaliza en un **Mínimo Producto Viable** que permita validar el concepto en un entorno real o simulado.

### 8.1 Funcionalidades incluidas

- Lectura de códigos QR que remiten a fichas de producto.
- Búsqueda simple por nombre, bodega/destilería o varietal/tipo.
- Ficha pública de producto optimizada para uso en dispositivos móviles, que muestra:
  - Datos básicos del vino/licor.
  - Precio final con promoción aplicada, en caso de existir.
  - Estado de stock visible.
  - Imagen y descripción breve cuando estén cargadas.
- Panel de administración con:
  - Gestión básica de productos (alta, modificación, activación/desactivación).
  - Gestión de promociones sencillas.
  - Métricas mínimas (consultas por producto y por día, diferenciando QR y búsqueda).
- Comportamientos de contingencia previstos:
  - Alternativa de búsqueda por texto cuando no se puede leer el QR.
  - Mensajes claros ante problemas de conexión.

### 8.2 Funcionalidades fuera de alcance en esta etapa

Quedan explícitamente excluidas de la versión inicial (aunque se consideren para etapas futuras):

- Carrito de compras o venta en línea.
- Integración automática con sistemas de caja o facturación.
- Módulos avanzados de recomendación o comparadores de productos.
- Administración de stock detallada o gestión de pedidos a proveedores.
- Reportes avanzados con filtros complejos o exportaciones.
- Funcionamiento completo sin conexión.

---

## 9. Beneficios esperados

### 9.1 Para quienes compran

- Acceso a información **clara, consistente y actualizada** en cuestión de segundos.
- Reducción de la incertidumbre respecto al precio final y las promociones aplicables.
- Posibilidad de comparar productos desde la propia góndola utilizando el teléfono.
- Exploración guiada de productos en promoción y de los más consultados.

### 9.2 Para el personal del local

- Menor cantidad de consultas repetitivas sobre precios y promociones.
- Más tiempo disponible para asesoría personalizada y cierre de ventas.
- Un único punto de referencia para verificar la información mostrada al cliente.

### 9.3 Para el negocio

- Señalización siempre alineada con los datos vigentes de precios y promociones.
- Facilidad para lanzar, ajustar o finalizar promociones sin reimprimir cartelería.
- Visibilidad sobre qué productos generan mayor interés, a partir de métricas de consulta.
- Base sólida para evaluar, en etapas posteriores, la incorporación de nuevas funcionalidades o integraciones.

---

## 10. Limitaciones y supuestos

- La calidad de la información ofrecida al cliente depende directamente de que el **administrador mantenga actualizado** el catálogo de productos y las promociones.
- La aplicación requiere **conexión a internet** para consultar fichas, registrar consultas y mostrar datos vigentes.
- La experiencia de lectura de códigos QR puede verse afectada por:
  - Condiciones de iluminación.
  - Calidad de la cámara del dispositivo.
  - Hábitos de uso del usuario.
- Aunque la aplicación busca ser lo más precisa posible, el **precio válido a efectos de cobro** es el que se confirma finalmente en la caja del comercio, de acuerdo con sus políticas internas.

---

## 11. Estado actual del proyecto

En el momento de elaboración de este documento, WINE-PICK-QR se encuentra en una fase en la que:

- El problema y los objetivos están claramente definidos.
- Los flujos de uso para clientes, personal y administrador están especificados.
- Se ha delimitado el alcance del MVP y las funcionalidades futuras.

La solución se desarrolla como parte de un **Trabajo Final Integrador**, con la intención de resultar defendible ante un tribunal académico y, al mismo tiempo, útil como base para una implementación real en una vinoteca o licorería.

---

## 12. Próximos pasos

Entre los pasos previstos para la evolución del proyecto se incluyen:

- Consolidar la implementación del MVP conforme a esta especificación funcional.
- Realizar pruebas de uso en un entorno real o simulado, observando:
  - Comprensión de la información por parte del cliente.
  - Reducción de consultas repetitivas al personal.
  - Comportamiento de los usuarios frente a los códigos QR.
- Ajustar textos, mensajes y flujos a partir de los resultados de las pruebas.
- Evaluar, con evidencia recopilada, la conveniencia de incorporar:
  - Más métricas de negocio.
  - Funcionalidades de recomendación.
  - Integración con otros sistemas del local.
  - Extensiones específicas para cadenas con múltiples sucursales.

Este README constituye la **descripción funcional de referencia** para WINE-PICK-QR y sirve como base para la documentación técnica y la implementación posterior.

## Documentación técnica

Para detalles sobre la implementación, se dispone de la siguiente documentación adicional:

- [Arquitectura técnica](docs/ARQUITECTURA_TECNICA.md)
- [Modelo de datos y MER](docs/BASE_DE_DATOS_MER.md)
- [API REST y contratos de datos](docs/API_REST.md)
