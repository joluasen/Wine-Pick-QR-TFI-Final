# Project Brief – WINE-PICK-QR

## 1. Información general

- **Nombre del proyecto:** WINE-PICK-QR
- **Tipo de proyecto:** Trabajo Final Integrador – Tecnicatura Universitaria en Programación
- **Versión del documento:** 1.0
- **Fecha:** 02-12-2025
- **Integrante(s):** (Rusch Esteban Alberto Legajo: 17873 / Asensio Jorge Luis Legajo: )

## 2. Contexto y problema

En vinotecas y licorerías es frecuente que el cliente:

- Se encuentre frente a una góndola con muchos vinos, espirituosas y otras bebidas, sin información clara sobre cada producto.
- Dependa de la disponibilidad del personal para obtener recomendaciones.
- Se enfrente a cartelería desactualizada (precios viejos, promociones vencidas) o inexistente.
- Dude en el momento de la compra y, en algunos casos, abandone la decisión o elige “a ciegas”.

Desde el lado del comercio:

- Mantener cartelería actualizada producto por producto es costoso y poco flexible.
- No existen métricas simples sobre qué productos se consultan más, ni qué tipo de información interesa al cliente.
- Las promociones muchas veces se comunican de forma manual, con errores o poca visibilidad en góndola.

## 3. Objetivo general

Diseñar, desarrollar y validar una solución web que permita a clientes y personal de vinotecas/licorerías **consultar información clara y actualizada de los productos mediante códigos QR y búsquedas**, y que ofrezca a la administración del local **herramientas básicas de gestión de catálogo, promociones y métricas de consulta**.

## 4. Objetivos específicos

1. Permitir que cualquier cliente pueda, desde su propio celular:
   - Escanear un código QR en góndola o botella y acceder a la ficha pública del producto.
   - Buscar productos por texto (nombre, tipo de bebida, bodega/destilería, varietal, etc.).
   - Ver información clave: descripción, origen, tipo de bebida, recomendaciones de consumo, precio de referencia y promociones vigentes.

2. Brindar al administrador del negocio un panel web para:
   - Crear, editar y desactivar productos.
   - Definir promociones simples por producto (descuento porcentual o precio promocional) con fechas de vigencia.
   - Consultar métricas básicas de uso (productos más consultados, consultas diarias, canal QR vs búsqueda).

3. Desarrollar el proyecto siguiendo una **metodología ágil**, con:
   - Backlog priorizado.
   - Sprints cortos con entregas incrementales.
   - Uso de Git/GitHub para control de versiones, issues y releases.

4. Entregar un MVP funcional con:
   - Datos de prueba representativos.
   - Documentación técnica (arquitectura, modelo de datos, API, despliegue).
   - Manual de usuario y video de defensa/demostración.

## 5. Alcance 

El **MVP de WINE-PICK-QR** incluye:

- Aplicación web responsiva (PWA sencilla) accesible desde el navegador del celular.
- Lectura de códigos QR que redirigen a la ficha pública de un producto.
- Búsqueda de productos por texto y filtros básicos.
- Ficha de producto con:
  - Datos generales (nombre, tipo de bebida, bodega/destilería, varietal, origen, añada).
  - Descripción corta orientada al cliente.
  - Precio base y, si aplica, precio promocional y descripción de la promoción.
  - Indicador simple de disponibilidad (p. ej., disponible / consultar).
- Panel de administración (protección con login) para:
  - Alta, baja lógica y actualización de productos.
  - Gestión de promociones simples por producto:
    - Descuento porcentual.
    - Precio final promocional.
  - Visualización de métricas:
    - Productos más consultados (últimos 30 días).
    - Cantidad de consultas diarias segmentadas por canal (QR / búsqueda).
- Registro de eventos de consulta para alimentar las métricas.
- Despliegue en un entorno accesible para docentes (hosting compartido o similar).

## 6. Fuera de alcance 

Quedan explícitamente fuera del alcance del MVP:

- Gestión avanzada de stock (movimientos, compras, ventas, alertas automáticas).
- Integración con sistemas de facturación, punto de venta o ERP.
- Gestión de múltiples sucursales con sincronización en tiempo real.
- Promociones complejas de tipo “combos” con múltiples productos (2x1, 3x2, etc.) implementadas a nivel de reglas de carrito.
- Pasarela de pagos o e-commerce completo (carrito, checkout, pagos en línea).
- Autenticación de clientes finales (no se crean cuentas de cliente, el acceso público es anónimo).
- Integraciones con plataformas externas de delivery o marketplaces.

Estas funcionalidades pueden considerarse **trabajo futuro**, siempre que el MVP demuestre valor y viabilidad técnica.

## 7. Usuarios y stakeholders

- **Clientes finales de la vinoteca/licorería**  
  Personas que desean elegir una bebida adecuada para una ocasión, con información clara y rápida desde su celular.

- **Personal del local (vendedores, sommeliers, cajeros)**  
  Utilizan la misma interfaz pública para complementar su asesoría al cliente, mostrando fichas y promociones desde un dispositivo del comercio.

- **Administrador del negocio**  
  Responsable de cargar y mantener actualizados productos, promociones y de consultar métricas de uso.

- **Equipo de desarrollo**  
  Responsable del análisis, diseño, construcción, pruebas y despliegue de la solución, así como de la documentación y la defensa del TFI.

- **Tutoría y cátedra**  
  Stakeholders académicos que validan el avance, el cumplimiento de la metodología y la calidad del entregable.

## 8. Métricas de éxito

Algunas métricas tentativas para evaluar el éxito del proyecto (en el contexto del TFI) son:

- **Cobertura de funcionalidades del MVP**  
  Porcentaje de historias de usuario completadas respecto al backlog planificado.

- **Uso de la aplicación en pruebas**  
  Cantidad de consultas registradas durante las sesiones de prueba (escaneos QR + búsquedas).

- **Tiempos de respuesta percibidos**  
  La interfaz debería responder en forma fluida en entornos de conectividad y dispositivos típicos.

- **Calidad de la información**  
  Grado de satisfacción de usuarios de prueba respecto a la claridad y utilidad de las fichas.

- **Calidad técnica y de proceso**  
  Cumplimiento de la rúbrica: arquitectura coherente, pruebas realizadas, documentación completa, uso de Git, video de defensa.

Estas métricas se refinarán y concretarán en el documento de **Informe Final del TFI**.

## 9. Riesgos principales (resumen)

- **Riesgo técnico:** dificultades en la integración del lector de QR en navegadores móviles.  
  _Mitigación:_ utilizar librerías probadas (por ejemplo, html5-qrcode) y ofrecer alternativa via cámara nativa + URL.

- **Riesgo de alcance/tiempo:** incorporar demasiadas funcionalidades (combos complejos, multi-sucursal, etc.) y no llegar con un MVP sólido.  
  _Mitigación:_ mantener el foco en el alcance declarado, priorizar el flujo de consulta de productos y la gestión básica de promociones.

- **Riesgo de despliegue:** problemas de configuración en el hosting compartido (PHP, base de datos, rutas).  
  _Mitigación:_ realizar pruebas tempranas de despliegue y documentar los pasos en el documento de despliegue.

- **Riesgo de coordinación:** si el equipo tiene más de un integrante, puede haber desorden en el uso de Git y en la gestión de tareas.  
  _Mitigación:_ adoptar convenciones simples de ramas, issues y tableros desde el inicio, siguiendo la Ruta Base de Proyecto.

## 10. Canales y frecuencia de comunicación

- **Canal principal con tutoría:** plataforma indicada por la cátedra (Moodle, foros, correo institucional, etc.).
- **Comunicación interna del equipo:** canales acordados (por ejemplo, grupo de mensajería, reuniones virtuales).
- **Frecuencia mínima sugerida:**
  - Reunión corta interna por semana para revisar avance y ajustar prioridades.
  - Revisión con tutoría en los hitos de cada sprint, con demostración del incremento alcanzado.

## 11. Relación con otros documentos

Este Project Brief se complementa con:

- `readme.md` (descripción funcional detallada).
- `ARQUITECTURA_TECNICA.md`.
- `BASE_DE_DATOS_MER.md`.
- `STACK_TECNOLOGICO_Y_PATRONES.md`.
- `API_REST.md`.
- `01_DESCUBRIMIENTO_Y_REQUERIMIENTOS.md`.
- `02_DISENIO_FUNCIONAL.md`.
- `06_GESTION_AGIL_Y_BACKLOG.md`.
- `07_PRUEBAS_Y_CALIDAD.md`.
- `09_DESPLIEGUE_Y_ENTORNO.md`.
- `10_INFORME_FINAL_TFI.md`.
