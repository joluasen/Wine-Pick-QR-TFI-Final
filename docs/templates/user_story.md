# Historias de Usuario – Formato Simplificado

## HU-C1: Consultar producto desde QR

**ID:** HU-C1  
**Título:** Consultar producto desde QR  
**Historia (Como/Quiero/Para):**  
Como cliente en góndola, quiero escanear un código QR pegado en el estante o la botella, para ver la información del producto y decidir si me conviene comprarlo.  
**Criterios de aceptación (GWT):**

- Dado que me encuentro frente a una góndola con un producto con código QR, cuando escaneo el QR con la cámara de mi celular (nativa o desde la app), entonces el navegador debe abrir la ficha del producto correspondiente.
- Dado que la ficha del producto se carga correctamente, cuando la visualizo, entonces debo ver como mínimo: nombre, tipo de bebida, bodega/destilería, origen, descripción corta, precio de referencia y promoción vigente (si existe).
- Dado que escaneo un QR con un código que no existe en el sistema, cuando se procesa la lectura, entonces veo un mensaje claro indicando que el producto no está disponible, con opción de ir a búsqueda o inicio.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF1, RF5
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-C2: Buscar productos por texto

**ID:** HU-C2  
**Título:** Buscar productos por texto  
**Historia (Como/Quiero/Para):**  
Como cliente, quiero buscar productos por nombre, tipo de bebida o bodega, para encontrar alternativas que se ajusten a lo que estoy buscando.  
**Criterios de aceptación (GWT):**

- Dado que estoy en la pantalla principal de la aplicación, cuando ingreso un texto en el buscador (mínimo 2 caracteres), entonces el sistema debe mostrar sugerencias de productos en tiempo real.
- Dado que selecciono un producto de las sugerencias, cuando hago clic en él, entonces se abre la ficha completa del producto.
- Dado que busco un texto que no coincide con ningún producto, cuando se completa la búsqueda, entonces veo un mensaje indicando que no hay resultados.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF2
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-C3: Ver productos en promoción

**ID:** HU-C3  
**Título:** Ver productos en promoción  
**Historia (Como/Quiero/Para):**  
Como cliente, quiero ver un listado de productos que estén en promoción, para aprovechar descuentos o precios especiales.  
**Criterios de aceptación (GWT):**

- Dado que accedo a la sección de promociones, cuando se carga la página, entonces veo un listado de productos con promociones vigentes.
- Dado que hay productos en promoción, cuando veo el listado, entonces cada producto muestra el precio original tachado y el precio final con descuento.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF3
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-C4: Ver productos más consultados

**ID:** HU-C4  
**Título:** Ver productos más consultados  
**Historia (Como/Quiero/Para):**  
Como cliente, quiero ver qué productos son los más populares, para descubrir opciones que otros clientes consultan frecuentemente.  
**Criterios de aceptación (GWT):**

- Dado que accedo a la sección de más buscados, cuando se carga la página, entonces veo un ranking de productos ordenados por cantidad de consultas.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF4
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-P1: Mostrar ficha al cliente

**ID:** HU-P1  
**Título:** Mostrar ficha al cliente  
**Historia (Como/Quiero/Para):**  
Como miembro del personal, quiero usar mi dispositivo para mostrar fichas de producto al cliente, para explicar mejor las características y promociones.  
**Criterios de aceptación (GWT):**

- Dado que tengo un dispositivo con acceso a la aplicación, cuando escaneo un QR o busco un producto, entonces puedo mostrar la misma ficha pública que vería cualquier cliente.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF1, RF2, RF5
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-A1: Crear producto

**ID:** HU-A1  
**Título:** Crear producto  
**Historia (Como/Quiero/Para):**  
Como administrador, quiero dar de alta un nuevo producto, para incorporarlo al catálogo disponible para consulta.  
**Criterios de aceptación (GWT):**

- Dado que estoy autenticado y completo el formulario con datos válidos, cuando guardo el producto, entonces el producto queda disponible para su consulta (QR o búsqueda).
- Dado que intento guardar sin completar campos obligatorios, cuando envío el formulario, entonces veo mensajes de error indicando qué campos faltan.
- Dado que intento crear un producto con un código público que ya existe, cuando guardo, entonces veo un error indicando que el código está duplicado.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF6
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-A2: Editar producto

**ID:** HU-A2  
**Título:** Editar producto  
**Historia (Como/Quiero/Para):**  
Como administrador, quiero modificar la información de un producto existente, para corregir datos o actualizar precios y descripciones.  
**Criterios de aceptación (GWT):**

- Dado que estoy autenticado y abro un producto para editar, cuando modifico el precio y guardo, entonces el nuevo precio se refleja en las consultas de clientes inmediatamente.
- Dado que modifico cualquier campo, cuando guardo, entonces veo un mensaje de confirmación.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF7
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-A3: Desactivar producto

**ID:** HU-A3  
**Título:** Eliminar producto  
**Historia (Como/Quiero/Para):**  
Como administrador, quiero eliminar un producto que ya no se comercializa, para que deje de mostrarse en la interfaz pública sin perder su histórico de datos.  
**Criterios de aceptación (GWT):**

- Dado que selecciono eliminar un producto, cuando confirmo la acción, entonces el producto deja de aparecer en búsquedas y fichas públicas.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF8
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-A4: Crear promoción

**ID:** HU-A4  
**Título:** Crear promoción  
**Historia (Como/Quiero/Para):**  
Como administrador, quiero definir una promoción para un producto (descuento porcentual, precio fijo o combo básico), para destacar ofertas vigentes en góndola y en la ficha.  
**Criterios de aceptación (GWT):**

- Dado que creo una promoción con fechas válidas, cuando guardo, entonces el producto muestra el precio con descuento durante ese período.
- Dado que intento crear una promoción para un producto que ya tiene una activa en el mismo período, cuando guardo, entonces veo un error indicando que hay superposición de fechas.
- Dado que elimino una promoción, cuando confirmo, entonces el producto vuelve a mostrar su precio base.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF10, RF11, RF12
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-A5: Gestionar vigencia de promociones

**ID:** HU-A5  
**Título:** Gestionar vigencia de promociones  
**Historia (Como/Quiero/Para):**  
Como administrador, quiero definir fechas de inicio y fin para las promociones, para controlar su vigencia sin tener que hacer cambios manuales el día del vencimiento.  
**Criterios de aceptación (GWT):**

- Dado que defino una fecha de fin para una promoción, cuando llega esa fecha, entonces el sistema deja de mostrar la promoción automáticamente.
- Dado que defino una fecha de inicio futura, cuando llega esa fecha, entonces la promoción comienza a aplicarse automáticamente.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF11
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-A6: Ver productos más consultados (métricas)

**ID:** HU-A6  
**Título:** Ver productos más consultados (métricas)  
**Historia (Como/Quiero/Para):**  
Como administrador, quiero ver qué productos fueron más consultados en los últimos 30 días, para evaluar interés y ajustar el surtido o las promociones.  
**Criterios de aceptación (GWT):**

- Dado que accedo a la sección de métricas, cuando se carga, entonces veo un ranking de productos más consultados.
- Dado que selecciono un período diferente (7, 30, 90 días), cuando cambio el filtro, entonces las métricas se actualizan.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF16
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-A7: Ver consultas diarias por canal

**ID:** HU-A7  
**Título:** Ver consultas diarias por canal  
**Historia (Como/Quiero/Para):**  
Como administrador, quiero ver cuántas consultas se hicieron por día y por canal (QR / búsqueda), para entender cómo se usa la herramienta en góndola.  
**Criterios de aceptación (GWT):**

- Dado que accedo a las métricas, cuando veo el gráfico de consultas, entonces puedo ver la evolución diaria de consultas.
- Dado que hay datos de consultas, cuando veo el desglose, entonces puedo distinguir entre consultas por QR y por búsqueda.

**Prioridad (MoSCoW):** Should
**Dependencias:** RF17
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-A8: Iniciar sesión en el panel de administración

**ID:** HU-A8  
**Título:** Iniciar sesión en el panel de administración  
**Historia (Como/Quiero/Para):**  
Como administrador, quiero iniciar sesión con usuario y contraseña, para acceder al panel sin exponer sus funciones a cualquier usuario.  
**Criterios de aceptación (GWT):**

- Dado que ingreso credenciales correctas, cuando envío el formulario de login, entonces accedo al panel de administración.
- Dado que ingreso credenciales incorrectas, cuando envío el formulario, entonces veo un mensaje de error genérico (sin revelar qué dato está mal).
- Dado que intento acceder a una ruta de admin sin estar autenticado, cuando cargo la página, entonces soy redirigido al login.
- Dado que cierro sesión, cuando confirmo, entonces el token se invalida y no puedo acceder al panel sin volver a autenticarme.

**Prioridad (MoSCoW):** Must
**Dependencias:** RF18, RF19
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---

## HU-A9: Escanear QR desde panel admin

**ID:** HU-A9  
**Título:** Escanear QR desde panel admin  
**Historia (Como/Quiero/Para):**  
Como administrador, quiero escanear un QR y acceder rápidamente a la ficha del producto para editarlo, para agilizar la gestión del catálogo mientras recorro la góndola.  
**Criterios de aceptación (GWT):**

- Dado que estoy autenticado y escaneo un QR desde el panel admin, cuando se detecta el código, entonces se abre la ficha del producto con opciones de edición.

**Prioridad (MoSCoW):** Should
**Dependencias:** RF9
**Notas de UX (wireframe/link):** -
**DoR listo?** Sí
**Estimación:** -

---
