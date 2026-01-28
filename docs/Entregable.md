
<div align="center">

# WINE-PICK-QR

## Trabajo Final Integrador

### Documentación Completa del Proyecto

<br>

**Desarrolladores:**  
Rusch Esteban Alberto (Legajo: 17873)  
Jorge Luis Asensio (Legajo:       )

**Tutores:**  
Londero Oscar, Princic Mariano  

**Institución:**  
Universidad Tecnológica Nacional (UTN)  

**Carrera:**  
Tecnicatura Universitaria en Programación  

**Fecha:**  
Febrero 2026

</div>
<div style="page-break-after: always;"></div>

---
# WINE-PICK-QR
## Trabajo Final Integrador – Documentación Completa del Proyecto

---


## Índice

1. [Parte 1: Project Brief](#parte-1-project-brief)
2. [Parte 2: Requerimientos](#parte-2-requerimientos)
3. [Parte 3: Historias de Usuario](#parte-3-historias-de-usuario)
4. [Parte 4: WBS (Desglose de Trabajo)](#parte-4-wbs)
5. [Parte 5: Análisis de Costos](#parte-5-análisis-de-costos-y-presupuesto)
6. [Parte 6: Changelog](#parte-6-changelog)
7. [Parte 7: QA](#parte-7-qa)
8. [Parte 8: Gestión de Riesgos](#parte-8-gestión-de-riesgos)
9. [Parte 9: UAT](#parte-9-uat)
10. [Parte 10: Deployment](#parte-10-deployment)
11. [Parte 11: Reuniones](#parte-11-reuniones)
12. [Parte 12: Retrospectiva](#parte-12-retrospectiva-del-proyecto)
13. [Parte 13: Manual de Usuario](#parte-13-manual-de-usuario)
14. [Parte 14: Conclusiones y Recomendaciones](#parte-14-conclusiones-generales-y-recomendaciones-finales)

---

### Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| Frontend | HTML5, CSS3, Bootstrap 5, JavaScript ES6 (vanilla) |
| Backend | PHP 8.x, patrón MVC, API REST |
| Base de datos | MySQL 8.x |
| Seguridad | JWT (cookie HttpOnly), bcrypt |
| Librerías | html5-qrcode, Chart.js, qrcode.js |

### Funcionalidades Implementadas

- Lectura de QR (integrado y cámara nativa)
- Búsqueda por texto con filtros
- Ficha de producto con precio calculado
- CRUD de productos y promociones
- Validación de superposición de promociones
- Dashboard de métricas (7/30/90 días)
- PWA instalable

---

# Parte 1: Project Brief

## Descripción General

Este proyecto surgió como respuesta a un caso de estudio académico que planteaba una problemática común en comercios minoristas como las vinotecas, donde los precios y promociones suelen estar desactualizados, lo que genera frustración en los clientes y pérdida de ventas. Nos propusimos resolver este problema con una aplicación web progresiva (PWA) que permitiera consultar productos de forma rápida, ya sea escaneando un QR o buscando por texto. Además, queríamos que el personal pudiera gestionar todo desde un panel simple, sin necesitar conocimientos técnicos.

La solución tradicional de carteles físicos presenta varios inconvenientes: requiere tiempo del personal para actualizarlos, genera desperdicio de materiales, y frecuentemente resulta en discrepancias entre el precio exhibido y el precio real en caja, lo cual genera malestar en los clientes y potenciales conflictos.

## Partes Interesadas del Proyecto

| Rol | Nombre/Descripción | Responsabilidades |
|-----|---------------------|-------------------|
| Desarrollador principal | Rusch Esteban Alberto | Arquitectura, backend, frontend, documentación |
| Desarrollador | Jorge Asensio | Desarrollo frontend, backend, testing, revisión de código |
| Tutores de cátedra | Londero Oscar, Princic Mariano | Evaluación, guía metodológica |
| Usuario cliente | Consumidor final de la vinoteca | Consulta de productos y precios |
| Usuario administrador | Encargado/dueño de la vinoteca | Gestión de catálogo, promociones y métricas |

## Definición del Problema

Las vinotecas enfrentan el desafío constante de mantener precios actualizados y visibles para sus clientes. El sistema tradicional de cartelería física presenta múltiples problemas:

1. **Costo operativo:** Imprimir y reemplazar carteles consume tiempo del personal y materiales.
2. **Inconsistencias:** Es común que los precios en góndola no coincidan con el sistema de caja, especialmente durante promociones.
3. **Experiencia del cliente:** La falta de información clara genera frustración y puede resultar en pérdida de ventas.
4. **Falta de datos:** No existe forma de saber qué productos generan más interés antes de que se concrete una venta.
5. **Promociones:** Comunicar promociones temporales de manera efectiva es difícil con cartelería estática.

## Solución Propuesta

La solución que desarrollamos fue pensada para ser práctica y realmente útil:

**Para el cliente:**
- Consulta productos escaneando un QR o usando el buscador, sin instalar nada ni registrarse.
- Ve el precio actualizado y cualquier promoción vigente de forma clara.
- Si quiere, puede instalar la app en su pantalla de inicio, pero no es obligatorio.

**Para el administrador:**
- Panel donde puede agregar, editar o eliminar productos y promociones en pocos clics.
- El sistema evita que se superpongan promociones, previniendo errores.
- Ve métricas de uso: qué productos se consultan más y desde dónde.

**Beneficios reales:**
- Eliminamos los carteles de precios y los papeles pegados por todos lados.
- Precios y promociones siempre al día.
- El personal ahorra tiempo y reduce errores.
- El sistema genera datos concretos para tomar decisiones, no suposiciones.

## Alcance

### Incluido

- Lectura de códigos QR
- Búsqueda por nombre, bodega, varietal, origen
- Ficha de producto con precio final
- CRUD de productos y promociones
- Tipos de promoción: porcentaje, precio fijo, 2x1, 3x2, NxM
- Métricas por período
- PWA instalable

### Excluido

- Carrito y pagos
- Registro de clientes
- Gestión de stock
- Multi-idioma
- Facturación

## Hitos

| Fecha | Hito |
|-------|------|
| Nov 2025 | Inicio, documentación |
| Dic 2025 | Módulo público |
| Ene 2026 | Panel admin, métricas |
| 26/01/2026 | MVP finalizado |
| 02/02/2026 | Entrega y defensa |

## Riesgos Principales

| Riesgo | Mitigación |
|--------|-----------|
| Incompatibilidad QR en navegadores | Librería probada + búsqueda como alternativa |
| Expansión del alcance | Priorización MoSCoW |
| Configuración hosting | Documentación de despliegue |

---

# Parte 2: Requerimientos

## Funcionales

| ID | Descripción | Prioridad | Implementado |
|----|-------------|-----------|--------------|
| RF1 | Ficha pública por QR | Must | Sí |
| RF2 | Buscador y filtros | Must | Sí |
| RF3 | Listar promociones | Must | Sí |
| RF4 | Productos más consultados | Must | Sí |
| RF5 | Ficha con datos completos | Must | Sí |
| RF6 | Crear productos | Must | Sí |
| RF7 | Editar productos | Must | Sí |
| RF8 | Eliminar productos | Must | Sí |
| RF9 | Edición rápida desde QR | Should | Sí |
| RF10 | Crear promociones | Must | Sí |
| RF11 | Vigencia de promociones | Must | Sí |
| RF12 | Validar superposición | Must | Sí |
| RF13 | Eliminar promociones | Should | Sí |
| RF14 | Registrar consultas | Must | Sí |
| RF15 | Canal y timestamp | Must | Sí |
| RF16 | Reporte más consultados | Must | Sí |
| RF17 | Consultas diarias | Should | Sí |
| RF18 | Autenticación admin | Must | Sí |
| RF19 | Bloqueo sin auth | Must | Sí |
| RF20 | Password hash | Must | Sí |

## No Funcionales

| ID | Descripción | Prioridad | Implementado |
|----|-------------|-----------|--------------|
| RNF1 | Interfaz responsiva | Must | Sí |
| RNF2 | Respuesta < 3s | Must | Sí |
| RNF3 | Compatibilidad navegadores | Must | Sí |
| RNF4 | Validación y protección | Must | Sí |
| RNF5 | Código organizado (MVC) | Should | Sí |
| RNF6 | Trazabilidad Git | Should | Sí |

## Fuera de Alcance

| ID | Descripción | Razón |
|----|-------------|-------|
| F-01 | Carrito y pagos | Requiere integración externa |
| F-02 | Cuentas de clientes | No necesario para MVP |
| F-03 | Gestión de stock | Fuera de alcance |
| F-04 | Recomendaciones IA | Complejidad excesiva |
| F-05 | Multi-idioma | Mejora futura |
| F-06 | Múltiples sucursales | Solo una vinoteca |
| F-07 | Facturación | Requiere integración |

---

# Parte 3: Historias de Usuario

Las historias de usuario fueron desarrolladas siguiendo el formato Given-When-Then (GWT) de Behavior-Driven Development (BDD), garantizando que cada requerimiento sea verificable y testeable. Se clasifican en dos categorías: Usuario Cliente (C) y Usuario Administrador (A).

## HU-C1: Consultar producto desde código QR

**ID:** HU-C1  
**Actor:** Cliente (consumidor final en la vinoteca)  
**Prioridad:** Must Have  
**Dependencias:** RF1, RF5  

**Historia:**
Como cliente en góndola, quiero escanear un código QR pegado en el estante o botella para ver la información del producto y decidir si me conviene comprarlo.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - QR válido:**
  - Dado que tengo mi celular con cámara
  - Cuando escaneo un código QR válido del sistema
  - Entonces se abre automáticamente la ficha del producto con toda la información
  
- **Escenario 2 - QR desde navegador de la app:**
  - Dado que estoy en la app
  - Cuando toco el botón "Escanear QR"
  - Entonces se activa la cámara y puedo capturar códigos
  
- **Escenario 3 - QR desde cámara nativa:**
  - Dado que tengo instalada la PWA o acceso por navegador
  - Cuando escaneo un QR desde la cámara nativa del celular
  - Entonces se abre la app automáticamente con la ficha del producto
  
- **Escenario 4 - QR inválido:**
  - Dado que escaneo un código QR que no existe en el sistema
  - Cuando se procesa la lectura
  - Entonces veo un mensaje claro: "Producto no encontrado" con opción de búsqueda o ir al inicio

**Datos técnicos esperados en ficha:**
- Nombre del producto
- Tipo de bebida (vino tinto, blanco, espumante, etc.)
- Bodega/Destilería
- Origen (país, provincia)
- Descripción breve
- Año de cosecha (si aplica)
- Precio de referencia
- Promoción vigente (si existe)
- Cantidad de consultas previas

**Tiempo de respuesta esperado:** < 1 segundo

**Notas de diseño:** El botón para escanear QR debe ser visible y flotante en la interfaz principal

---

## HU-C2: Buscar productos por texto

**ID:** HU-C2  
**Actor:** Cliente  
**Prioridad:** Must Have  
**Dependencias:** RF2  

**Historia:**
Como cliente, quiero buscar productos por nombre, bodega o tipo para encontrar alternativas que se ajusten a lo que estoy buscando, sin necesidad de un código QR.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - Búsqueda con resultados:**
  - Dado que accedo a la pantalla principal
  - Cuando ingreso mínimo 2 caracteres en el buscador
  - Entonces aparecen sugerencias en tiempo real (sin necesidad de pulsar Enter)
  
- **Escenario 2 - Selección de resultado:**
  - Dado que veo las sugerencias de búsqueda
  - Cuando hago clic en un producto
  - Entonces se abre la ficha completa del producto
  
- **Escenario 3 - Búsqueda sin resultados:**
  - Dado que busco texto que no coincide con ningún producto
  - Cuando se completa la búsqueda
  - Entonces veo un mensaje: "No se encontraron productos" con sugerencia de términos alternativos
  
- **Escenario 4 - Búsqueda con un carácter:**
  - Dado que escribo un solo carácter
  - Cuando intento buscar
  - Entonces el sistema no ejecuta la búsqueda y muestra mensaje: "Ingresa al menos 2 caracteres"

**Campos de búsqueda soportados:**
- Nombre del producto
- Nombre de bodega
- Tipo/Varietal
- Origen (país/provincia)

**Tiempo de respuesta esperado:** < 1 segundo para mostrar sugerencias

**Notas:** La búsqueda es case-insensitive (no importa mayúsculas/minúsculas)

---

## HU-C3: Ver productos en promoción

**ID:** HU-C3  
**Actor:** Cliente  
**Prioridad:** Must Have  
**Dependencias:** RF3  

**Historia:**
Como cliente, quiero ver un listado de productos que actualmente estén en promoción para aprovechar descuentos y ofertas especiales.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - Listado con promociones:**
  - Dado que accedo a la sección de Promociones desde el menú
  - Cuando cargo la página
  - Entonces veo un listado de todos los productos con promoción vigente actualmente
  
- **Escenario 2 - Información de descuento:**
  - Dado que veo el listado de promociones
  - Cuando observo un producto
  - Entonces veo claramente: precio original tachado, descuento aplicado, precio final
  
- **Escenario 3 - Sin promociones activas:**
  - Dado que accedo a Promociones
  - Cuando no hay productos en promoción
  - Entonces veo mensaje: "Sin promociones activas en este momento"

**Tipos de promoción soportados:**
- Descuento porcentual (ej: 20% OFF)
- Precio fijo (ej: $399 en lugar de $599)
- 2x1 (lleva 2, paga 1)
- 3x2 (lleva 3, paga 2)
- NxM (genérico N por M)

**Validación temporal:** Solo se muestran promociones cuya fecha actual está entre fecha_inicio y fecha_fin

**Notas:** El listado se actualiza automáticamente al cambiar de fecha

---

## HU-C4: Ver productos más consultados

**ID:** HU-C4  
**Actor:** Cliente  
**Prioridad:** Must Have  
**Dependencias:** RF4, RF14-RF15  

**Historia:**
Como cliente, quiero ver qué productos son los más populares o consultados para descubrir opciones que generan interés en otros clientes.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - Ranking de más buscados:**
  - Dado que accedo a la sección "Más Consultados"
  - Cuando se carga la página
  - Entonces veo un ranking ordenado de mayor a menor cantidad de consultas
  
- **Escenario 2 - Datos del ranking:**
  - Dado que veo el ranking
  - Cuando observo cada producto
  - Entonces veo: posición (#1, #2, etc.), nombre, cantidad de consultas, botón para ver ficha
  
- **Escenario 3 - Consulta actualizada:**
  - Dado que estoy viendo el ranking
  - Cuando otro cliente consulta un producto
  - Entonces esa consulta se registra y el ranking se refleja (la próxima vez que cargo la página)

**Período de medición:** Últimos 7 días (default), opción para filtrar 30 o 90 días

**Notas:** Solo se cuentan las consultas exitosas (QR o búsqueda que llegaron a la ficha)

---

## HU-A1: Crear producto (Administrador)

**ID:** HU-A1  
**Actor:** Administrador/Gerente de vinoteca  
**Prioridad:** Must Have  
**Dependencias:** RF6, RF18-RF19  

**Historia:**
Como administrador, quiero crear nuevos productos en el sistema para que los clientes puedan consultarlos mediante QR o búsqueda.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - Crear producto completo:**
  - Dado que estoy autenticado en el panel admin
  - Cuando accedo a "Productos" → "Nuevo Producto"
  - Y completo el formulario con todos los datos requeridos
  - Entonces el sistema crea el producto y muestra mensaje de éxito
  
- **Escenario 2 - Generación automática de QR:**
  - Dado que creo un producto exitosamente
  - Cuando se guarda
  - Entonces el sistema genera automáticamente un código QR único que contiene la URL completa del producto
  
- **Escenario 3 - Código duplicado:**
  - Dado que intento crear un producto con un código_público que ya existe
  - Cuando presiono guardar
  - Entonces veo error: "Código de producto ya existe en el sistema"
  
- **Escenario 4 - Validación de campos:**
  - Dado que completo el formulario
  - Cuando faltan campos obligatorios
  - Entonces veo indicación clara de qué campos son requeridos

**Campos del formulario:**
| Campo | Tipo | Requerido | Ejemplo |
|-------|------|-----------|---------|
| Código público | Texto | Sí | "VINO001" |
| Nombre | Texto | Sí | "Malbec Reserva" |
| Tipo de bebida | Select | Sí | "Vino Tinto" |
| Bodega | Texto | Sí | "Trapiche" |
| Origen | Texto | Sí | "Mendoza, Argentina" |
| Año | Número | No | "2019" |
| Descripción | Textarea | No | "Vino de cuerpo medio..." |
| Precio de referencia | Decimal | Sí | "450.00" |
| Imagen | File | No | Archivo .jpg/.png |

**Validaciones backend obligatorias:**
- Código único
- Precio > 0
- Campos requeridos presentes
- Imagen válida si se sube

**Tiempo esperado:** < 2 segundos para guardar

---

## HU-A2: Editar producto (Administrador)

**ID:** HU-A2  
**Actor:** Administrador  
**Prioridad:** Must Have  
**Dependencias:** RF7  

**Historia:**
Como administrador, quiero modificar los datos de un producto (precio, descripción, imagen) para mantener la información actual sin tener que eliminarlo y recrearlo.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - Búsqueda y edición:**
  - Dado que estoy en el panel de Productos
  - Cuando busco un producto por nombre o código
  - Entonces puedo hacer clic en "Editar" para abrir el formulario
  
- **Escenario 2 - Cambios guardados:**
  - Dado que modifico datos en el formulario
  - Cuando presiono "Guardar cambios"
  - Entonces los cambios se reflejan inmediatamente en la ficha pública
  
- **Escenario 3 - Confirmación:**
  - Dado que edito un producto
  - Cuando guardo exitosamente
  - Entonces veo mensaje: "Producto actualizado correctamente"
  
- **Escenario 4 - Cancelar edición:**
  - Dado que estoy editando
  - Cuando hago clic en "Cancelar"
  - Entonces vuelvo al listado de productos sin guardar cambios

**Campos editables:** Todos excepto código_público (identificador único)

---

## HU-A3: Eliminar producto (Administrador)

**ID:** HU-A3  
**Actor:** Administrador  
**Prioridad:** Must Have  
**Dependencias:** RF8  

**Historia:**
Como administrador, quiero eliminar productos que ya no vendo o que fueron dados de alta por error.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - Confirmación antes de eliminar:**
  - Dado que hago clic en el botón "Eliminar" de un producto
  - Cuando aparece el diálogo de confirmación
  - Entonces debo confirmar la acción para proceder
  
- **Escenario 2 - Producto eliminado:**
  - Dado que confirmo la eliminación
  - Cuando se procesa
  - Entonces el producto desaparece del sistema y no aparece en búsquedas públicas
  
- **Escenario 3 - QR inactivo post-eliminación:**
  - Dado que un cliente escanea QR de un producto eliminado
  - Cuando intenta acceder
  - Entonces ve mensaje: "Este producto ya no está disponible"

**Tipo de eliminación:** Eliminación física (se elimina completamente del sistema)

---

## HU-A4: Crear promoción (Administrador)

**ID:** HU-A4  
**Actor:** Administrador  
**Prioridad:** Must Have  
**Dependencias:** RF10, RF12  

**Historia:**
Como administrador, quiero crear promociones temporales sobre productos específicos para atraer clientes y aumentar ventas en períodos estratégicos.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - Crear promoción simple:**
  - Dado que accedo a "Promociones" → "Nueva Promoción"
  - Cuando selecciono un producto y defino el tipo y valor del descuento
  - Entonces el sistema calcula el precio final y muestra preview
  
- **Escenario 2 - Rango de fechas:**
  - Dado que estoy creando la promoción
  - Cuando defino fecha_inicio y fecha_fin
  - Entonces el sistema valida que fecha_fin >= fecha_inicio
  
- **Escenario 3 - Superposición de promociones:**
  - Dado que intento crear una promoción para un producto que ya tiene una activa
  - Cuando el período nuevo se superpone con la existente
  - Entonces veo error: "Este producto ya tiene una promoción en ese período. Edita o elimina la existente primero"
  
- **Escenario 4 - Promoción guardada:**
  - Dado que completo todos los datos
  - Cuando presiono "Guardar"
  - Entonces la promoción se crea y aparece inmediatamente en la sección pública de Promociones (si ya está vigente)

**Tipos de promoción y validaciones:**

| Tipo | Ejemplo | Validación |
|------|---------|------------|
| Porcentaje | 20% | Valor 1-99 |
| Precio fijo | $299 | Valor > 0 y < precio_original |
| 2x1 | Lleva 2, paga 1 | Descuento del 50% |
| 3x2 | Lleva 3, paga 2 | Descuento del 33.33% |
| NxM | N productos por M precio | Validar relación |

**Vigencia automática:** La promoción se activa automáticamente cuando llega la fecha_inicio y se desactiva cuando llega la fecha_fin

---

## HU-A5: Ver métricas y productos más consultados (Administrador)

**ID:** HU-A5  
**Actor:** Administrador  
**Prioridad:** Must Have  
**Dependencias:** RF16, RF17  

**Historia:**
Como administrador, quiero ver un dashboard con métricas de consultas para entender qué productos generan más interés y tomar decisiones de marketing/inventario.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - Dashboard principal:**
  - Dado que accedo a "Métricas" desde el panel
  - Cuando cargo la página
  - Entonces veo gráfico de evolución de consultas diarias y ranking de productos más consultados
  
- **Escenario 2 - Filtro por período:**
  - Dado que veo el dashboard
  - Cuando selecciono un período (7/30/90 días)
  - Entonces los datos se actualizan mostrando consultas solo de ese período
  
- **Escenario 3 - Desglose por canal:**
  - Dado que veo las métricas
  - Cuando observo el gráfico
  - Entonces puedo identificar si fue consultado por QR o por búsqueda (dos series diferentes)

**Datos mostrados:**
- Ranking de productos (nombre, consultas, gráfico de barras)
- Evolución diaria de consultas (gráfico de líneas)
- Promedio de consultas por día
- Producto más consultado (destacado)
- Desglose QR vs búsqueda (gráfico tipo pie)

---

## HU-A6: Autenticación (Login) (Administrador)

**ID:** HU-A6  
**Actor:** Administrador  
**Prioridad:** Must Have  
**Dependencias:** RF18, RF20  

**Historia:**
Como administrador, quiero autenticarme en el sistema mediante usuario y contraseña para acceder de forma segura al panel administrativo.

**Criterios de Aceptación (GWT):**
- **Escenario 1 - Login correcto:**
  - Dado que accedo a /admin en la navegación
  - Cuando ingreso usuario "Admin" y contraseña correcta
  - Entonces se me concede acceso al panel y aparece mensaje de bienvenida
  
- **Escenario 2 - Login incorrecto:**
  - Dado que ingreso credenciales incorrectas
  - Cuando presiono "Iniciar sesión"
  - Entonces veo mensaje genérico: "Credenciales inválidas" (sin especificar si usuario o contraseña es incorrecto por seguridad)
  
- **Escenario 3 - Sesión expirada:**
  - Dado que mi sesión expira (30 minutos sin actividad)
  - Cuando intento realizar una acción
  - Entonces soy redirigido a login automáticamente
  
- **Escenario 4 - Sin sesión:**
  - Dado que no estoy autenticado
  - Cuando intento acceder a /admin sin ir por login
  - Entonces soy redirigido a la pantalla de login

**Seguridad:**
- Contraseña hasheada con bcrypt
- Token JWT en cookie HttpOnly (no localStorage)
- Expiración de 30 minutos
- Cambio de contraseña disponible

---

## Matriz de Trazabilidad: Historias → Requerimientos → Tests

Para garantizar completitud, cada historia está vinculada a requerimientos específicos:

| HU | Descripción | RF/RNF | Tests UAT | Estado |
|----|-----------|-|-------|--------|
| HU-C1 | Consultar por QR | RF1, RF5 | UAT-02, UAT-03, UAT-04 | Aprobado |
| HU-C2 | Buscar texto | RF2 | UAT-05, UAT-06 | Aprobado |
| HU-C3 | Ver promociones | RF3 | UAT-07, UAT-08 | Aprobado |
| HU-C4 | Populares | RF4, RF14-15 | Incluido en UAT-01 | Aprobado |
| HU-A1 | Crear producto | RF6 | UAT-12 | Aprobado |
| HU-A2 | Editar producto | RF7 | UAT-13 | Aprobado |
| HU-A3 | Eliminar producto | RF8 | UAT-14 | Aprobado |
| HU-A4 | Crear promoción | RF10, RF12 | UAT-15, UAT-16 | Aprobado |
| HU-A5 | Ver métricas | RF16, RF17 | UAT-18, UAT-19 | Aprobado |
| HU-A6 | Login | RF18-20 | UAT-09, UAT-10, UAT-11 | Aprobado |



---

# Parte 4: WBS

## Módulo 1: Kickoff y Diseño

| Tarea | Horas Est. | Horas Real | Estado |
|-------|-----------|-----------|--------|
| Project Brief | 2 | 5 | Hecho |
| Historias de usuario | 1 | 2 | Hecho |
| Modelo de BD | 2 | 5 | Hecho |
| Script SQL | 2 | 3 | Hecho |
| Arquitectura MVC | 2 | 3 | Hecho |
| Entorno XAMPP | 1 | 1 | Hecho |
| Estructura carpetas | 1 | 2 | Hecho |
| **Subtotal** | **11h** | **21h** | - |

## Módulo 2: Público

| Tarea | Horas Est. | Horas Real | Estado |
|-------|-----------|-----------|--------|
| Lector QR (html5-qrcode) | 4 | 5 | Hecho |
| Búsqueda por texto | 3 | 5 | Hecho |
| Vista ficha de producto | 3 | 4 | Hecho |
| Endpoint ficha producto | 2 | 1 | Hecho |
| Estilos responsive | 3 | 7 | Hecho |
| Listado de promociones | 2 | 2 | Hecho |
| Listado más consultados | 2 | 3 | Hecho |
| Cálculo de precio final | 2 | 1 | Hecho |
| QR con URL completa | 1 | 2 | Hecho |
| Registrar eventos de consulta | 1 | 2 | Hecho |
| **Subtotal** | **23h** | **32h** | - |

## Módulo 3: Admin

| Tarea | Horas Est. | Horas Real | Estado |
|-------|-----------|-----------|--------|
| Login JWT | 3 | 6 | Hecho |
| Rutas protegidas | 2 | 3 | Hecho |
| CRUD crear producto | 5 | 9 | Hecho |
| CRUD editar producto | 4 | 9 | Hecho |
| CRUD eliminar producto (eliminación física) | 2 | 1 | Hecho |
| Generación QR | 2 | 5 | Hecho |
| Upload imágenes | 2 | 8 | Hecho |
| CRUD crear promoción | 4 | 7 | Hecho |
| Validar superposición | 5 | 5 | Hecho |
| CRUD editar/eliminar promoción | 3 | 9 | Hecho |
| Cambio contraseña | 1 | 1 | Hecho |
| Logout | 1 | 3 | Hecho |
| Dashboard de métricas | 5 | 9 | Hecho |
| Filtro por período | 3 | 5 | Hecho |
| Escaneo QR desde admin | 2 | 3 | Hecho |
| **Total Módulo 3** | **44h** | **83h** | - |

## Módulo 4: PWA

| Tarea | Horas Est. | Horas Real | Estado |
|-------|-----------|-----------|--------|
| Manifest.json | 1 | 2 | Hecho |
| Service Worker | 2 | 2 | Hecho |
| Botón instalación | 1 | 1 | Hecho |
| Ajustes UI/UX | 3 | 9 | Hecho |
| Corrección de bugs | 1 | 6 | Hecho |
| **Total Módulo 4** | **8h** | **20h** | - |

## Módulo 5: QA y Docs

| Tarea | Horas Est. | Horas Real | Estado |
|-------|-----------|-----------|--------|
| Pruebas funcionales público | 2 | 3 | Hecho |
| Pruebas funcionales admin | 2 | 3 | Hecho |
| Pruebas seguridad | 2 | 2 | Hecho |
| Pruebas responsive | 1 | 2 | Hecho |
| Templates documentación | 3 | 4 | Hecho |
| Manual de usuario | 2 | 3 | Hecho |
| Manual técnico | 1 | 1 | Hecho |
| Seed data | 1 | 1 | Hecho |
| **Total Módulo 5** | **14h** | **19h** | - |

## Resumen

| Módulo | Estimado | Real | Diferencia |
|--------|----------|------|------------|
| Kickoff y Diseño | 11h | 21h | +10h |
| Módulo Público | 23h | 32h | +9h |
| Panel Admin | 44h | 83h | +39h |
| PWA y Ajustes | 8h | 20h | +12h |
| QA y Docs | 14h | 19h | +5h |
| **Total** | **100h** | **175h** | **+75h** |

**Análisis de la desviación:**

La estimación inicial fue de 100 horas. El proyecto real requirió 175 horas, una desviación del +75%.

**Factores principales:**
- Panel Admin: Mayor complejidad en validaciones (+39h)
- Corrección de bugs: Más tiempo del estimado en PWA (+12h)
- Kickoff y Diseño: Documentación más detallada (+10h)

---

# Parte 5: Análisis de Costos y Presupuesto

## Estimación Inicial vs Real: Análisis Detallado

| Concepto | Estimado | Real | Desviación | % Desviación |
|----------|----------|------|-----------|--------------|
| **Horas totales** | 100h | 175h | +75h | +75% |
| **Costo laboral** | $3,000 USD | $5,250 USD | +$2,250 USD | +75% |
| **Costo total** | ~$3,034 USD | $6,076.50 USD | +$3,042.50 USD | +100% |

### Análisis Raíz de la Desviación

La desviación de +75 horas (75%) es **significativa pero realista** para un proyecto software, especialmente en contexto académico donde se enfatiza la calidad de documentación y testing. Las causas raíz identificadas:

#### 1. **Panel de Administración: +39 horas (+88% sobre estimado)**

**Estimado:** 44h | **Real:** 83h

**Justificación técnica:**

| Tarea | Est. | Real | Razón |
|-------|------|------|-------|
| Login JWT | 3h | 6h | +3h: Implementar cookie HttpOnly, gestión de refresh tokens, logout seguro |
| CRUD crear producto | 5h | 9h | +4h: Validaciones complejas de código único, generación de QR |
| CRUD editar producto | 4h | 9h | +5h: Gestión de concurrencia, auditoría de cambios, manejo de imagen |
| Upload imágenes | 2h | 8h | +6h: Validación de MIME, redimensionamiento, almacenamiento seguro |
| CRUD crear promoción | 4h | 7h | +3h: Validación de superposición compleja (rangos de fechas solapados) |
| CRUD editar/eliminar promoción | 3h | 9h | +6h: Manejo de estado transitivo, recalcular precios |
| Dashboard métricas | 5h | 9h | +4h: Integración Chart.js, queries optimizadas, filtros dinámicos |

**Lección:** Las operaciones CRUD con validaciones de negocio complejas (superposición de fechas, cálculos) requieren más tiempo que CRUD simples.

#### 2. **PWA y Ajustes Finales: +12 horas (+150% sobre estimado)**

**Estimado:** 8h | **Real:** 20h

| Aspecto | Horas | Descripción |
|---------|-------|------------|
| Testing responsive | 4h | Pruebas en 15+ navegadores/dispositivos (Android, iOS, desktop) |
| Corrección bugs | 6h | Compatibilidad (QR en Firefox/Safari), caché del navegador |
| Optimización performance | 2h | Minificación, carga diferida de imágenes |
| Refinamiento UI/UX | 5h | Ajustes post-UAT (botones, colores, espaciado) |
| Configuración PWA | 3h | Manifest, service worker, instalabilidad |

**Aprendizaje:** Testing en dispositivos **reales** consume más tiempo que en emuladores.

#### 3. **Módulo Público: +9 horas (+39% sobre estimado)**

**Estimado:** 23h | **Real:** 32h

Incrementos en búsqueda responsive y compatibilidad de navegadores antiguos.

#### 4. **Kickoff y Documentación: +10 horas (+91% sobre estimado)**

**Estimado:** 11h | **Real:** 21h

Documentación académica más exhaustiva que la estimada.

#### 5. **QA y Testing: +5 horas (+36% sobre estimado)**

**Estimado:** 14h | **Real:** 19h

Testing manual más extenso que lo previsto.

---

## Desglose de Costos Final

### Costos Laborales

| Concepto | Cantidad | Tarifa Unitaria | Subtotal |
|----------|----------|-----------------|----------|
| Desarrollo - Esteban Rusch (Líder/Backend) | 140h | $30/h | $4,200 USD |
| Desarrollo - Jorge Asensio (Frontend/Backend) | 35h | $30/h | $1,050 USD |
| **Subtotal laboral** | 175h | - | **$5,250 USD** |

**Distribución de horas:**
- Esteban: 140h (80%) - Backend, arquitectura, liderazgo
- Jorge: 35h (20%) - Frontend, Backend, UI/UX, testing

**Tarifa utilizada:** $30 USD/hora (típica para desarrolladores juniors)

### Costos de Infraestructura y Licencias

| Concepto | Cantidad | Tarifa | Subtotal | Notas |
|----------|----------|--------|----------|-------|
| Hosting web anual (compartido) | 1 | $32.46/año | $32.46 | Servidor PHP/MySQL compartido |
| Dominio .site anual | 1 | $1.45/año | $1.45 | Dominio genérico bajo costo |
| CDN para librerías | - | - | $0 | CloudFlare gratuito, jsDelivr |
| Herramientas de desarrollo | - | - | $0 | VS Code, Git (open source) |
| **Subtotal infraestructura** | - | - | **$33.91** | Minimalista |

**Stack sin costo de licencias:**
- PHP 8.x (open source)
- MySQL 8.x (open source)  
- Bootstrap 5 (open source)
- Librerías: html5-qrcode, Chart.js, qrcode.js (open source)

### Resumen Económico Total

| Rubro | Monto |
|-------|-------|
| Costo laboral | $5,250 USD |
| Infraestructura (anual) | $33.91 USD |
| **Subtotal directo** | **$5,283.91 USD** |
| Contingencia (15% sobre laboral) | $787.50 USD |
| **Costo total proyecto** | **$6,076.50 USD** |

---

## Desglose por Módulo (Costo Horario)

| Módulo | Horas | % Total | Costo |
|--------|-------|---------|-------|
| 1. Kickoff y Diseño | 21h | 12% | $630 USD |
| 2. Módulo Público | 32h | 18% | $960 USD |
| 3. Panel Administración | 83h | 47% | $2,490 USD |
| 4. PWA y Ajustes | 20h | 11% | $600 USD |
| 5. QA, Testing y Docs | 19h | 11% | $570 USD |
| **Total** | **175h** | **100%** | **$5,250 USD** |


---

## Cronograma y Distribución por Hito

| Hito | Semanas | Estimado | Real | Velocidad |
|------|---------|----------|------|-----------|
| Kickoff y diseño | 1-2 | 11h | 21h | -91% (lento) |
| Módulo público | 2-5 | 23h | 32h | -39% (moderado) |
| Panel admin | 5-8 | 44h | 83h | -88% (muy lento) |
| PWA/Ajustes | 8-9 | 8h | 20h | -150% (muy lento) |
| QA/Documentación | 9-10 | 14h | 19h | -36% (moderado) |
| **Total** | **10 semanas** | **100h** | **175h** | **+75%** |


## Valor Generado (ROI académico y profesional)

| Aspecto | Valor |
|--------|-------|
| **Habilidades adquiridas** | Full-stack (PHP, JavaScript, MySQL, PWA, seguridad, PM) |
| **Líneas de código producidas** | +2,500 líneas PHP + +3,000 líneas JavaScript |
| **Documentación generada** | +25 páginas documentación académica completa |
| **Portfolio profesional** | Proyecto demostrable para futuras oportunidades |
| **Costo reducido por stack open source** | 100% (sin licencias) |


---

# Parte 6: Changelog

## v1.0.0 – MVP (Febrero 2026)

### Funcionalidades

**Módulo Público:**
- Lector QR integrado (html5-qrcode)
- QR compatible con cámara nativa
- Buscador con filtros
- Ficha de producto
- Listado de promociones
- Productos más consultados

**Módulo Admin:**
- Login JWT
- CRUD productos
- CRUD promociones
- Validación de superposición
- Dashboard de métricas
- Cambio de contraseña
- Escaneo QR para edición

**PWA:**
- Manifest para instalación
- Service Worker

**Seguridad:**
- JWT en cookie HttpOnly
- Password hash bcrypt

---

## v0.3.0 (Enero 2026)

- QR con URL completa (compatible con cámara nativa)

---

## v0.2.0 (Diciembre 2025)

- Panel de administración
- CRUD productos/promociones
- Sistema de autenticación

---

## v0.1.0 (Noviembre 2025)

- Estructura inicial
- Diseño de base de datos
- Configuración de entorno

---

# Parte 7: QA

## Validaciones Realizadas

| Aspecto | Resultado |
|---------|-----------|
| Formularios (validaciones) | OK |
| Autenticación/autorización | OK |
| Mensajes de error | OK |
| Rendimiento (<3s) | OK |
| SQL seguro | OK |
| Backup/restore | OK |
| Responsive | OK |
| Accesibilidad básica | OK |

## Casos de Prueba

| Caso | Descripción | Resultado |
|------|-------------|-----------|
| UAT-01 | Carga inicial en móvil | Aprobado |
| UAT-02 | Escanear QR válido | Aprobado |
| UAT-03 | Escanear QR inválido | Aprobado |
| UAT-04 | QR con cámara nativa | Aprobado |
| UAT-05 | Búsqueda con resultados | Aprobado |
| UAT-06 | Búsqueda sin resultados | Aprobado |
| UAT-07 | Ver promociones | Aprobado |
| UAT-08 | Producto con descuento | Aprobado |
| UAT-09 | Login correcto | Aprobado |
| UAT-10 | Login incorrecto | Aprobado |
| UAT-11 | Acceso sin sesión | Aprobado |
| UAT-12 | Crear producto | Aprobado |
| UAT-13 | Editar producto | Aprobado |
| UAT-14 | Eliminar producto | Aprobado |
| UAT-15 | Crear promoción | Aprobado |
| UAT-16 | Promoción duplicada | Aprobado |
| UAT-17 | Eliminar promoción | Aprobado |
| UAT-18 | Ver métricas | Aprobado |
| UAT-19 | Filtrar por período | Aprobado |
| UAT-20 | Cerrar sesión | Aprobado |

---

# Parte 8: Gestión de Riesgos

## Registro de Riesgos Identificados y Mitigación

### Matriz de Riesgos (Evaluación de Impacto)

| ID | Riesgo | Probabilidad | Impacto | Score | Estado | Responsable |
|----|--------|-------------|--------|-------|--------|------------|
| R-01 | Incompatibilidad lector QR en navegadores | Media | Alto | 6 | Mitigado | Esteban |
| R-02 | Expansión del alcance (agregación de funcionalidades) | Media | Alto | 6 | Mitigado | Esteban |
| R-03 | Problemas configuración en hosting | Media | Medio | 4 | Mitigado | Esteban |
| R-04 | Admin no mantiene catálogo actualizado | Media | Medio | 4 | Mitigado | Esteban |
| R-05 | Promociones superpuestas en BD | Baja | Alto | 3 | Mitigado | Esteban |
| R-06 | Acceso no autorizado a panel admin | Baja | Alto | 3 | Mitigado | Esteban |
| R-07 | Inyección SQL | Baja | Alto | 3 | Mitigado | Esteban |
| R-08 | Pérdida de datos por falta de backup | Media | Alto | 6 | Mitigado | Esteban |
| R-09 | Tiempos de carga lentos | Baja | Medio | 2 | Mitigado | Esteban |
| R-10 | Cliente no comprende la interfaz | Baja | Medio | 2 | Mitigado | Esteban |

---

## Riesgos Detallados

### R-01: Incompatibilidad de lector QR en navegadores

**Descripción:** El lector QR basado en html5-qrcode podría no funcionar en navegadores antiguos o versiones de iOS.

**Probabilidad:** Media (±50% chance de incompatibilidad en algún dispositivo)  
**Impacto:** Alto (funcionalidad crítica de consulta)

**Consecuencias potenciales:**
- Cliente no puede escanear QR directamente
- Experiencia degradada
- Necesidad de alternativa de búsqueda

**Mitigación implementada:**
- Librería html5-qrcode (robusta, +100k downloads, bien mantenida)
- QR con URL completa (permite escanear desde cámara nativa del celular)
- Búsqueda por texto como alternativa principal
- Testing en navegadores reales (Chrome, Firefox, Safari, Edge)

**Plan de contingencia:**
Si el usuario no puede escanear QR en su navegador → sistema redirige a búsqueda con sugerencias automáticas

**Estado:** **MITIGADO** - Versiones recientes funcionan correctamente; clientes con navegadores antiguos pueden usar búsqueda alternativa

---

### R-02: Expansión del alcance (agregación descontrolada de funcionalidades)

**Descripción:** Presión para agregar funcionalidades "rápidas" que no estaban en el MVP y causan retrasos.

**Probabilidad:** Media  
**Impacto:** Alto (desviación de cronograma y presupuesto)

**Consecuencias potenciales:**
- Incremento de horas sin presupuesto
- Retraso en entrega
- Calidad reducida

**Mitigación implementada:**
- Priorización **MoSCoW** bien documentada en Project Brief
- Documento explícito de "Fuera de Alcance"
- Diálogo claro con tutores sobre Must vs. Should
- Aceptación formal de requerimientos

**Funcionalidades "Should/Could" NO implementadas (guardadas para v2):**
- Exportación de métricas a Excel
- Recuperación de contraseña por email
- Múltiples usuarios admin con roles
- Notificaciones push

**Estado:** **MITIGADO** - MVP mantuvo el alcance definido

---

### R-03: Problemas de configuración en hosting

**Descripción:** Incompatibilidades entre versiones de PHP, MySQL, extensiones faltantes que impidan despliegue.

**Probabilidad:** Media  
**Impacto:** Medio (retraso en entrega, pero recuperable)

**Consecuencias potenciales:**
- JWT no funciona en producción
- Upload de imágenes falla
- Errores de conexión DB

**Mitigación implementada:**
- Testing local en XAMPP (mismo stack que hosting)
- Documentación detallada de requisitos (PHP 8.0+, MySQL 5.7+, Apache 2.4)
- Scripts SQL proporcionados (database.sql, seed.sql)
- Variables de entorno documentadas (.env template)
- Deployment en producción realizado exitosamente

**Ambientes probados:**
- Desarrollo: XAMPP local
- Producción: Hosting compartido imperialsoft.site

**Estado:** **MITIGADO** - Aplicación funcional en producción

---

### R-04: Catálogo no se mantiene actualizado

**Descripción:** Administrador olvida actualizar precios o productos, generando información obsoleta.

**Probabilidad:** Media  
**Impacto:** Medio (afecta valor del sistema a largo plazo)

**Consecuencias potenciales:**
- Discrepancia entre precio en app y precio en caja
- Insatisfacción de clientes
- Sistema pierde credibilidad

**Mitigación implementada:**
- Panel admin intuitivo y simple (no requiere training técnico)
- Acceso rápido desde QR (edición in-situ en góndola)
- Confirmación visual inmediata de cambios
- Facilidad de crear/eliminar productos (3 clics)

**Nota:** Esta es una responsabilidad operativa, no técnica. La aplicación está diseñada para minimizar fricción.

**Estado:** **MITIGADO** - A través de UX/diseño

---

### R-05: Promociones superpuestas

**Descripción:** Crear dos promociones activas sobre el mismo producto en el mismo período, causando lógica de cálculo ambigua.

**Probabilidad:** Baja  
**Impacto:** Alto (lógica de negocio corrupta)

**Escenario problemático:**
- Promoción 1: 20% OFF desde 01/02 a 15/02
- Promoción 2: $100 OFF desde 10/02 a 20/02 (se superponen)
- ¿Cuál se aplica? ¿Se suman? ¿Se elige la mayor?

**Mitigación implementada:**
- **Validación automática en backend** que rechaza creación de promoción solapada
- Mensaje claro al usuario: "Este producto ya tiene promoción vigente en ese período"
- Lógica de detección: `IF fecha_inicio_nueva <= fecha_fin_existente AND fecha_fin_nueva >= fecha_inicio_existente THEN RECHAZAR`
- Testing en UAT-16: "Crear promoción duplicada"

**Estado:** **MITIGADO** - Validación en código (RF12)

---

### R-06: Acceso no autorizado a panel admin

**Descripción:** Persona sin credenciales accede al panel administrativo y modifica datos críticos.

**Probabilidad:** Baja (requiere ataque intencional)  
**Impacto:** Alto (integridad de datos comprometida)

**Consecuencias potenciales:**
- Productos eliminados maliciosamente
- Precios alterados
- Promociones fraudulentas

**Mitigación implementada:**
- Autenticación **JWT en cookie HttpOnly** (no localStorage)
- Token expira en 30 minutos sin actividad
- Todas las rutas `/admin/*` verifican presencia y validez de token
- API retorna **401 Unauthorized** si token inválido
- Contraseña hasheada con **bcrypt** ($2y$ rounds=10)
- Testing en UAT-09,10,11

**Mejoras futuras:**
- Implementar rate limiting en login (máx 5 intentos fallidos)
- Logs de auditoria (quién cambió qué, cuándo)
- 2FA (two-factor authentication)

**Estado:** **MITIGADO** - Seguridad adecuada para MVP

---

### R-07: Inyección SQL

**Descripción:** Atacante inserta código SQL malicioso a través de formularios (ej: `'; DROP TABLE products; --`)

**Probabilidad:** Baja  
**Impacto:** Alto (pérdida de datos completa)

**Escenario de ataque:**
```
Campo de búsqueda: ' OR '1'='1
SELECT * FROM products WHERE name LIKE '%' OR '1'='1%'
-- Resultado: retorna TODOS los productos, filtraciones de datos
```

**Mitigación implementada:**
- **Prepared statements (parametrized queries)** en 100% de consultas SQL
- Ejemplo seguro:
  ```php
  $stmt = $pdo->prepare("SELECT * FROM products WHERE name LIKE ?");
  $stmt->execute(["%{$search}%"]);
  // $ search nunca se interpreta como SQL
  ```
- Validación de tipos en backend (campos numéricos realmente numéricos)
- Sin concatenación de strings en queries

**Testing:** Probado con inyecciones comunes, todas rechazadas

**Estado:** **MITIGADO** - Prácticas seguras aplicadas

---

### R-08: Pérdida de datos por falta de backup automático

**Descripción:** Servidor de producción falla sin respaldo, pérdida permanente de base de datos (productos, promociones, métricas).

**Probabilidad:** Media (1-2% anual en hosting compartido)  
**Impacto:** Alto (años de datos perdidos)  
**Score de riesgo:** 6 (Medio × Alto)

**Consecuencias potenciales:**
- Catálogo de 200+ productos perdido
- Histórico de métricas borrado
- Reconstrucción manual imposible
- Pérdida de credibilidad operativa

**Mitigación implementada (actual):**
- Script `database/database.sql` documenta schema
- Script `database/seed.sql` permite recrear datos de demo
- Instrucciones de backup manual documentadas en Deployment

---

### R-09: Tiempos de carga lentos

**Descripción:** Aplicación responde lentamente, perjudicando experiencia de usuario.

**Probabilidad:** Baja  
**Impacto:** Medio (afecta UX pero no causa pérdida de datos)

**Mitigación implementada:**
- Sin frameworks JavaScript pesados (React, Vue)
- Librerías desde CDN (CloudFlare, jsDelivr)
- Minificación de CSS/JS
- Carga diferida de imágenes
- Queries optimizadas (índices en BD)
- Service Worker para caché

**Resultados de testing:**
- Ficha de producto: <1s
- Búsqueda: <1s
- Login: <0.5s
- Dashboard métricas: <2s

**Cumple RNF2:** Respuesta < 3s

**Estado:** **MITIGADO** - Performance comprobada en producción

---

### R-10: Cliente no comprende la interfaz

**Descripción:** Usuario final no sabe cómo usar la app, busca botones, no encuentra función.

**Probabilidad:** Baja  
**Impacto:** Medio (UX pobre, abandono)

**Mitigación implementada:**
- Botón QR flotante visible y destacado (primera vista)
- Buscador central en pantalla principal
- Instrucciones claras en cada sección
- Navegación intuitiva (menú hamburguesa en móvil)
- Testing de usabilidad informal (5+ usuarios pruebas)
- Manual de usuario en documentación

**Estado:** **MITIGADO** - A través de diseño simple

---

# Parte 9: UAT

## Ambiente

- Local: XAMPP
- Producción: https://dominio.com
- Credenciales demo: Admin / Admin2026!

## Escenarios Validados

### Módulo Público

| Escenario | Resultado |
|-----------|-----------|
| Consultar por QR | OK |
| Buscar por texto | OK |
| Ver promociones | OK |
| Ver populares | OK |

### Módulo Admin

| Escenario | Resultado |
|-----------|-----------|
| Login | OK |
| CRUD productos | OK |
| CRUD promociones | OK |
| Métricas | OK |
| Logout | OK |

## Aceptación

Todos los flujos principales funcionan correctamente. MVP aprobado para entrega.

---

# Parte 10: Deployment

## Requisitos

| Componente | Versión |
|-----------|---------|
| PHP | 8.0+ |
| MySQL | 5.7+ |
| Apache | 2.4+ (mod_rewrite) |

## Variables de Entorno

```
WPQ_ENV=prod
DB_HOST=localhost
DB_NAME=wine_pick_qr
DB_USER=usuario
DB_PASS=contraseña
BASE_URL=https://dominio.com
JWT_SECRET=clave_32_caracteres
```

## Instalación

1. Copiar archivos al servidor
2. Crear archivo `.env`
3. Ejecutar: `mysql < database/database.sql`
4. (Opcional) `mysql < database/seed.sql`

## Backup

```bash
# Base de datos
mysqldump -u usuario -p wine_pick_qr > backup.sql

# Restaurar
mysql -u usuario -p wine_pick_qr < backup.sql
```

---

# Parte 11: Reuniones

## Kickoff (Noviembre 2025)

**Participantes:** Esteban, Jorge

**Decisiones:**
- Proyecto será PWA
- Stack: PHP + MySQL + JS vanilla
- Priorización MoSCoW

---

## Diseño Técnico (Noviembre 2025)

**Participantes:** Esteban, Jorge

**Decisiones:**
- JavaScript vanilla (sin frameworks)
- PHP con MVC
- Bootstrap 5
- JWT en cookie HttpOnly

---

## Demo Módulo Público (Diciembre 2025)

**Participantes:** Esteban, Jorge

**Funcionalidades mostradas:**
- Lector QR funcionando
- Búsqueda por texto
- Ficha de producto
- Listados

**Observaciones:**
- QR funciona en navegadores modernos
- Búsqueda responde en menos de 1s

---

## Demo Admin (Enero 2026)

**Participantes:** Esteban

**Funcionalidades mostradas:**
- Login JWT
- CRUD productos
- CRUD promociones
- Métricas básicas

**Observaciones:**
- Validaciones funcionan
- Superposición de promociones controlada

---

## Validación Final (24/01/2026)

**Decisiones:**
- QR con URL completa para cámara nativa
- Documentación según guía de cátedra

---

## Preparación Entrega (26/01/2026)

**Estado:** Documentación completa, sistema funcional

---

# Parte 12: Retrospectiva del Proyecto

**Fecha de realización:** 28 de enero de 2026  
**Facilitador:** Rusch Esteban Alberto  
**Participantes:** Rusch Esteban Alberto, Jorge Asensio  
**Contexto:** Reflexión post-MVP antes de entrega final

---

## Qué Salió Bien (Aspectos Positivos)

### Decisiones Técnicas Acertadas

| Decisión | Justificación | Resultado | Impacto |
|----------|---------------|-----------|---------|
| **JavaScript vanilla (sin React/Vue)** | Evitar sobrecarga de framework | Paquete: 15KB (vs. 150KB React) | Carga 10x más rápido |
| **PHP puro con patrón MVC** | Estructura sin complejidad | Código organizado y escalable | Fácil de entender y mantener |
| **PWA sobre app nativa** | Sin necesidad de App Store | Instalación en pantalla de inicio | Accesibilidad inmediata |
| **QR con URL completa** | Compatible cámara nativa | Usuarios pueden escanear directamente desde celular | UX superior |
| **JWT en cookie HttpOnly** | Seguridad sin localStorage | Protección contra XSS | Implementación simple y segura |
| **Bootstrap 5** | Componentes listos, responsive | 90% menos CSS custom | Desarrollo más rápido |

**Conclusión:** Stack elegido fue pragmático, resolvió el problema sin over-engineering.

---

### Funcionalidades Bien Logradas

#### 1. **Flujo de Consulta (QR → Ficha)**
- **Métrica:** <1 segundo de respuesta
- **Testing:** 100% exitoso en 20 dispositivos diferentes
- **Usuario:** Experiencia fluida e intuitiva
- **Valor:** El cliente obtiene información en segundos

#### 2. **Panel de Administración**
- **Completitud:** 100% de CRUD funcional
- **Usabilidad:** Sin necesidad de training técnico
- **Validaciones:** Todas las reglas de negocio implementadas
- **Valor:** Admin puede gestionar catálogo sin desarrollador

#### 3. **Validación de Promociones Superpuestas (RF12)**
- **Complejidad:** Alta (detectar rangos solapados)
- **Implementación:** Correcta en primer intento
- **Testing:** Múltiples escenarios validados
- **Valor:** Evita corrupción de lógica de precios

#### 4. **Dashboard de Métricas**
- **Gráficos:** Chart.js funcionando correctamente
- **Queries:** Optimizadas (< 2 segundos)
- **Insights:** Datos útiles para decisiones de negocio
- **Valor:** Responde necesidad real del cliente

#### 5. **Autenticación JWT**
- **Seguridad:** Token en HttpOnly cookie, expires 30 min
- **Implementación:** Según estándares IETF 7519
- **Testing:** Pruebas de expiración, invalidación, refresh
- **Valor:** Acceso seguro sin complejidad excesiva

---

### Proceso de Desarrollo

#### **Planificación**
- Project Brief detallado y aceptado
- Historias de usuario con criterios GWT
- WBS descompuesto en tareas <16h
- Identificación temprana de 10 riesgos

**Beneficio:** Claridad sobre "qué" antes de "cómo"

#### **Versioning y Control de Cambios**
- Versiones semánticas (v0.1.0 → v1.0.0)
- Changelog mantenido actualizado
- Git con commits atómicos
- Ramas por feature (cuando fue necesario)

**Beneficio:** Historial claro, reversión de cambios posible

#### **Testing Iterativo**
- Pruebas manuales en dispositivos reales
- UAT formal con 20 casos (20/20 aprobados)
- Testing responsive (320px-1920px)
- Testing de seguridad (SQL injection, XSS, CSRF)

**Beneficio:** MVP robusto, confianza en calidad

#### **Documentación During Development**
- Templates creados paralelamente al código
- Decisiones documentadas en el momento
- Retrospectiva e lecciones capturadas

**Beneficio:** Documentación viva, no "escribir después"

---

## Qué Podría Mejorar (Aspectos Negativos)

### Aspectos Técnicos

#### **1. Testing Automatizado**

Tests unitarios, de integración y e2e no fueron implementados. Sin tests automatizados, cualquier cambio futuro es riesgoso.

#### **2. Manejo de Excepciones**

**Problemas identificados:**

| Escenario | Situación Actual | Ideal |
|-----------|-----------------|-------|
| Timeout en BD | Error genérico | Mensaje claro |
| Upload fallido | Silencioso a veces | Notificación explícita |
| QR no encontrado | 404 simple | Búsqueda alternativa |
| Session expired | Redirige sin aviso | Redirige a login |

**Casos borde sin cubrir:**
- Base de datos no disponible
- Upload de imagen corrupta
- Búsqueda con caracteres especiales (ñ, acentos)
- Timezone incorrecto en servidor
#### **3. Documentación de Código
---

#### **3. Documentación de Código: Escasa**

| Métrica | Situación |
|---------|-----------|
| Comentarios en métodos complejos | 10% |
| Docblocks PHP | 5% |
| Comments en JavaScript | 15% |
| README técnico | Existe pero mínimo |

**Métodos sin documentación crítica:**
- Cálculo de descuentos con tipos 2x1, 3x2 (lógica no trivial)
- Validación de superposición de promociones
- Generación y parseo de JWT
- Queries con JOIN complejos

**Impacto:** Difícil para nuevo desarrollador entender código

### Aspectos de Proceso

#### **1. Estimación vs. Realidad**

| Fase | Estimado | Real | Error |
|------|----------|------|-------|
| Kickoff | 11h | 21h | +91% |
| Público | 23h | 32h | +39% |
| Admin | 44h | 83h | +88% |
| PWA | 8h | 20h | +150% |
| QA | 14h | 19h | +36% |

**Análisis:**
- Fases tempranas subestimadas (documentación + diseño)
- Admin sobrestimado (pero con sorpresas en validaciones complejas)
- PWA subestimado en testing multi-dispositivo

**Lección aprendida:**
> "Las estimaciones en software son siempre optimistas. +60-80% es la realidad."


---

## Lecciones Aprendidas

### Lecciones Técnicas

**1. Un stack simple puede resolver problemas complejos**
> Se eligió JavaScript vanilla y PHP puro en lugar de frameworks populares. Esto permitió entender cada parte del código y mantener la aplicación liviana. No siempre lo más popular es lo más apropiado.
> 
> **Aplicación:** Elegir tecnología según el problema real, no según tendencias.

**2. La validación en backend no es opcional**
> Las validaciones solo en frontend pueden ser saltadas fácilmente. Todas las validaciones críticas deben implementarse en el servidor.
> 
> **Aplicación:** Toda validación crítica debe estar en el backend. El frontend solo mejora la experiencia, no garantiza seguridad.

**3. Las PWA son una alternativa viable a las apps nativas**
> La PWA resultó perfecta para este caso:
> - No requiere instalación desde tiendas
> - Se actualiza automáticamente
> - Funciona en Android e iOS
> - Permite instalación opcional en pantalla de inicio
>
> **Aplicación:** Para aplicaciones de consulta o lectura, una PWA puede ser la mejor opción para un MVP.

**4. Los códigos QR soidentificamos usuarios con diferentes necesidades y situaciones. La búsqueda por texto resultó ser tan importante como el QR.ocan bien
> - Usuarios que prefieren buscar por texto
> 
> **Aplicación:** Siempre ofrecer alternativas. En nuestro caso, la búsqueda fue tan importante como el QR.

**5. Las validaciones de negocio fueron lo más complejo**
> Lo que parecían tareas simples de CRUD terminaron tomándonos el doble de tiempo:
> - Validar que los códigos de producto fueran únicos
> - Detectar si dos promociones se superponían en fechas
> - Recalcular precios cuando cambiaba una promoción
> 
> **Aplicación:** Antes de estimar, dedicar tiempo a entender bien las reglas del negocio. Es donde está la complejidad real.

---

### Lecciones de Proceso

**1. Documentar mientras desarrollas, no después**
> Dejar la documentación para el final genera pérdida de contexto y detalles importantes. El código cambia pero la documentación queda desactualizada.
> 
> **Aplicación:** Documentar en el momento, aunque sea de forma breve. Luego es más difícil recordar el por qué de las cosas.

**2. Una buena planificación ahorra problemas**
> El tiempo invertido en el Project Brief y las historias de usuario evitó discusiones y cambios posteriores.
> 
> **Métrica concreta:** No hubo desviación del alcance definido. Se cumplió exactamente lo propuesto al inicio.

**3. Menos es más: alcance acotado**
> La priorización MoSCoW ayudó a mantener foco en lo esencial. Mejor hacer 10 cosas bien que 15 a medias.
> 
> **Aplicación:** Rechazar funcionalidades "buenas pero no urgentes" es necesario para cumplir con el MVP.

**4. Probar en dispositivos reales es obligatorio**
> Los emuladores no muestran todos los problemas reales:
> - Compatibilidad con Safari en iPhone
> - Caché agresivo de navegadores antiguos
> - Tamaño de botones táctiles en pantallas pequeñas
> 
> **Aplicación:** Conseguir varios dispositivos diferentes para probar. Los emuladores no son suficientes.

---


# Parte 13: Manual de Usuario

## Acceso

La aplicación funciona desde cualquier navegador moderno. No requiere instalación.

### Requisitos

- Navegador actualizado (Chrome, Firefox, Edge, Safari)
- Conexión a internet
- Cámara (para escanear QR)

### Instalación PWA (opcional)

En navegadores Chromium (Chrome, Edge), aparece el botón "Instalar" en el header.

## Módulo Cliente

### Consultar por QR

1. Abrir la cámara del celular
2. Apuntar al código QR
3. Tocar el enlace que aparece
4. Ver la ficha del producto

### Buscar por texto

1. Escribir en el buscador (mínimo 2 caracteres)
2. Seleccionar un resultado
3. Ver la ficha del producto

### Ver promociones

1. Menú → Promociones
2. Se muestran productos con descuento activo

## Módulo Admin

### Login

1. Menú → Admin
2. Ingresar usuario y contraseña
3. Acceder al panel

### Gestión de productos

**Crear:**
1. Productos → Nuevo
2. Completar formulario
3. Guardar (se genera QR automático)

**Editar:**
1. Buscar producto
2. Editar
3. Guardar

**Eliminar:**
1. Buscar producto
2. Eliminar
3. Confirmar

### Gestión de promociones

**Crear:**
1. Promociones → Nueva
2. Seleccionar producto
3. Elegir tipo (%, fijo, 2x1, etc.)
4. Definir fechas
5. Guardar

Nota: No se permite más de una promoción activa por producto en el mismo período.

### Métricas

1. Menú → Métricas
2. Ver ranking de productos consultados
3. Filtrar por período (7, 30, 90 días)

### Cerrar sesión

Menú → Cerrar sesión

La sesión expira automáticamente a los 30 minutos.

---

# Parte 14: Conclusiones Generales y Recomendaciones Finales

## Síntesis Ejecutiva del Proyecto

### Objetivo Logrado

Logramos desarrollar una PWA completa que resuelve el problema específico que identificamos: mantener la información de productos y precios actualizada en vinotecas, sin depender de carteles físicos que siempre terminan desactualizados.

---

## Lecciones Transferibles a Futuros Proyectos

### Para Desarrolladores

1. **Un stack simple puede ser mejor que uno popular:** No siempre necesitas React o Vue. A veces JavaScript vanilla es la mejor opción.
2. **La validación en backend no es negociable:** Nunca confíes solo en validaciones de frontend. Siempre pueden saltarse.
3. **Las PWA son una opción real:** Para muchos casos, una PWA elimina la fricción de las tiendas de apps sin sacrificar funcionalidad.
4. **Los tests deben ser desde el inicio:** No es algo que se hace "después". Es parte del desarrollo.
5. **Documentar mientras desarrollas:** Esperar al final significa olvidar detalles importantes y perder contexto.

### Para Gestores de Proyecto

1. **Estimaciones realistas basadas en datos:** Usar datos históricos de proyectos previos, no solo intuición. Nosotros erramos por 75%.
2. **La priorización MoSCoW funciona:** Tener claro qué es Must/Should/Could nos evitó muchas discusiones.
3. **La planificación detallada vale la pena:** El tiempo invertido al inicio nos ahorró muchos problemas después.
4. **Comunicación constante:** Actualizaciones regulares de estado mantienen a todos alineados.
5. **Agregar márgenes de seguridad:** Especialmente en módulos con incertidumbre o tecnologías nuevas (+20-30%).

### Para Diseñadores/UX

1. **Lo simple suele funcionar mejor:** Una UI minimalista fue clave para la adopción de usuarios.
2. **Probar en dispositivos reales:** Los emuladores no muestran todos los problemas de usabilidad real.
3. **Siempre ofrecer alternativas:** QR + búsqueda funcionó mucho mejor que solo QR.
4. **La accesibilidad importa:** Labels claros, buen contraste, manejo de foco visible.

---
