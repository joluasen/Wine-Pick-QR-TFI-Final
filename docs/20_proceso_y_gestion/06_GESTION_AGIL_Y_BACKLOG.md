# Gestión ágil y Backlog – WINE-PICK-QR

## 1. Enfoque de trabajo

El proyecto WINE-PICK-QR se gestionará siguiendo un enfoque ágil liviano, inspirado en Scrum y en la Ruta Base de Proyecto:

- Sprints de 1–2 semanas.
- Entregas incrementales (MVP primero, luego refinamientos).
- Revisión frecuente con tutoría.
- Uso de Git/GitHub para control de versiones y tableros.

## 2. Roles del equipo

En función del tamaño real del equipo 2 personas, se adoptan los siguientes roles:

- **Desarrollador(es)**  
  Responsable(s) del análisis técnico, construcción, pruebas y despliegue.

- **Product Owner (rol asumido dentro del equipo)**  
  Se encarga de priorizar el backlog en función de los objetivos del TFI y de las necesidades del “cliente” (vinoteca/licorería).

- **Scrum Master (rol asumido dentro del equipo)**  
  Facilita la organización de sprints, ayuda a remover impedimentos y vela por el seguimiento de la Ruta Base de Proyecto.

En un equipo de 1 persona, todos estos roles se asumen por el mismo estudiante, pero se mantiene la distinción conceptual para ordenar las actividades.

## 3. Herramientas

- **Repositorio GitHub**  
  Uso de ramas, issues y releases etiquetados.

- **Tablero Kanban (GitHub Projects o equivalente)**  
  Columnas sugeridas:
  - Backlog
  - Ready
  - In Progress
  - Code Review
  - QA
  - Done

- **Plantillas de la Ruta Base de Proyecto**  
  Para historias de usuario, registro de riesgos, changelog, retrospectivas, etc.

## 4. Estrategia de ramas en Git

Se propone la siguiente convención:

- Rama **`main`**: contiene las versiones estables que corresponden a entregas y releases relevantes (por ejemplo, versión presentada en el video final).
- Rama **`dev`**: rama de integración, donde se fusionan las features antes de llegar a `main`.
- Ramas **`feature/*`**: una por funcionalidad o historia importante:
  - `feature/consulta-qr`
  - `feature/busqueda-productos`
  - `feature/panel-admin`
  - `feature/promociones`
  - `feature/metricas`
  - etc.

Flujo básico:

1. Crear rama `feature/...` desde `dev`.
2. Desarrollar y probar la funcionalidad.
3. Abrir Pull Request hacia `dev` y revisarlo (por otro integrante o por el mismo, documentando la revisión).
4. Una vez estable, fusionar `dev` en `main` para crear releases etiquetados (`v0.1`, `v1.0`, etc.).

## 5. Backlog inicial (alto nivel)

A continuación se lista un backlog inicial basado en las historias de usuario y requerimientos.

| ID   | Historia / Tarea                                         | Tipo       | Prioridad (MoSCoW) |
|------|----------------------------------------------------------|-----------|---------------------|
| HU-C1 | Cliente consulta producto desde QR                      | Feature   | Must                |
| HU-C2 | Cliente busca productos por texto                       | Feature   | Must                |
| HU-C3 | Cliente ve productos en promoción                       | Feature   | Should              |
| HU-P1 | Personal del local muestra fichas al cliente            | Feature   | Should              |
| HU-A1 | Admin crea producto                                     | Feature   | Must                |
| HU-A2 | Admin edita producto                                    | Feature   | Must                |
| HU-A3 | Admin desactiva producto                                | Feature   | Must                |
| HU-A4 | Admin crea promoción (descuento/precio/combo)           | Feature   | Must                |
| HU-A5 | Admin gestiona vigencia de promociones                  | Feature   | Must                |
| HU-A6 | Admin ve productos más consultados (últimos 30 días)    | Feature   | Must                |
| HU-A7 | Admin ve consultas diarias por canal                    | Feature   | Should              |
| HU-A8 | Admin inicia/cierra sesión                              | Feature   | Must                |
| T-API | Definir e implementar API REST                          | Técnica   | Must                |
| T-DB  | Diseñar e implementar base de datos                     | Técnica   | Must                |
| T-FE  | Implementar PWA (layout, navegación básica)             | Técnica   | Must                |
| T-QA  | Definir y ejecutar plan de pruebas                      | Técnica   | Must                |
| T-DEP | Configurar despliegue en entorno de demo                | Técnica   | Must                |
| T-DOC | Completar documentación técnica y de usuario            | Técnica   | Must                |

Este backlog se puede refinar en issues más pequeñas según avance el desarrollo.

## 6. Plan de sprints

Un posible plan de sprints (ajustable según tiempos reales):

### Sprint 0 – Kickoff y diseño (1 semana)

**Objetivos:**

- Completar Project Brief.
- Definir requerimientos y diseño funcional.
- Definir arquitectura técnica y modelo de datos.
- Configurar repositorio, rama `dev` y tablero de proyecto.

**Entregables:**

- `00_PROJECT_BRIEF.md`
- `01_DESCUBRIMIENTO_Y_REQUERIMIENTOS.md`
- `02_DISENIO_FUNCIONAL.md`
- `ARQUITECTURA_TECNICA.md`
- `BASE_DE_DATOS_MER.md`

### Sprint 1 – Consulta pública y base técnica (1–2 semanas)

**Objetivos:**

- Implementar estructura básica de la aplicación (frontend PWA + backend y DB).
- Implementar consulta de productos por QR y búsqueda simple.
- Implementar lectura de fichas públicas.

**Historias objetivo:**

- HU-C1, HU-C2, HU-A1 (mínimo), T-API, T-DB, T-FE.

### Sprint 2 – Panel de administración y promociones (1–2 semanas)

**Objetivos:**

- Implementar panel de administración con autenticación.
- Implementar CRUD básico de productos.
- Implementar gestión de promociones simples.

**Historias objetivo:**

- HU-A1, HU-A2, HU-A3, HU-A4, HU-A5, HU-A8.

### Sprint 3 – Métricas, QA y refinamientos (1–2 semanas)

**Objetivos:**

- Registrar eventos de consulta.
- Implementar reportes de productos más consultados y consultas diarias.
- Ejecutar plan de pruebas y ajustar la UI.

**Historias objetivo:**

- HU-A6, HU-A7, T-QA, tareas de refinamiento de UI/usabilidad.

### Sprint 4 – Despliegue, documentación y defensa (1–2 semanas)

**Objetivos:**

- Completar documentación técnica y de usuario.
- Finalizar despliegue en entorno demo.
- Registrar métricas obtenidas en pruebas.
- Preparar presentación y grabar video de defensa.

**Entregables:**

- `07_PRUEBAS_Y_CALIDAD.md`
- `09_DESPLIEGUE_Y_ENTORNO.md`
- `10_INFORME_FINAL_TFI.md`
- Presentación y video.

## 7. Definition of Done (DoD)

Una historia o tarea se considera **terminada** cuando:

1. El código está implementado en la rama de feature correspondiente.
2. Se ejecutan las pruebas definidas (unitarias, funcionales o manuales) relacionadas.
3. No hay errores conocidos que bloqueen el uso normal de la funcionalidad.
4. Se actualiza la documentación necesaria (API, manual de usuario, etc.).
5. La rama se fusiona en `dev` mediante Pull Request aceptado.
6. La funcionalidad se demuestra en la demo del sprint.

## 8. Evidencias y retrospectivas

- Cada sprint debe dejar:
  - Lista de issues cerradas y capturas del tablero.
  - Changelog con los cambios más relevantes.
  - Breve retrospectiva (qué funcionó bien, qué mejorar, acciones para el próximo sprint).

Estas evidencias se podrán adjuntar o referenciar en el **Informe Final del TFI**.
