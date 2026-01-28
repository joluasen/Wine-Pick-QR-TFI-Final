# Estimación y Costos — WINE-PICK-QR

## Resumen

**Alcance/base:** MVP de PWA para consulta de productos y precios mediante QR/búsqueda + panel de administración con CRUD y métricas.
**Método(s) usados:** Bottom-up (WBS) + Analogía (experiencia en proyectos similares)
**Supuestos clave:**

- Desarrollo en equipo
- Entorno XAMPP local para desarrollo, hosting compartido para producción
- Sin costos de licencias (stack open source)
- Tiempo disponible: ~10 semanas (noviembre - enero 2026)
  **Exclusiones:**
- Carrito de compras y pagos
- App nativa (solo PWA)
- Multilenguaje
- Integración con facturación

## Tarifas y costos

| Rol/Concepto               | Tarifa (USD/h) |   Horas |     Subtotal |
| -------------------------- | -------------: | ------: | -----------: |
| Desarrollador (Esteban)    |            $30 |     140 |       $4,200 |
| Desarrollador (Jorge)      |            $30 |      35 |       $1,050 |
| **Subtotal laboral**       |                | **175** |   **$5,250** |
| Hosting anual (compartido) |              - |       - |       $32.46 |
| Dominio (opcional)         |              - |       - |        $1.45 |
| Librerías/CDN              |              - |       - |           $0 |
| **Subtotal no laboral**    |                |         |   **$33.91** |
| **Contingencia** (15%)     |                |         |  **$792.59** |
| **Total Estimado**         |                |         | **$6,076.5** |

## Conversión Story Points (opcional)

No se utilizó metodología Scrum formal con story points. El desarrollo fue incremental por hitos semanales.
**Velocity aproximada:**

- Hito 1-2 (semana 1-2): ~30h - Kickoff, diseño, estructura
- Hito 3 (semana 2-5): ~45h - Módulo público
- Hito 4-5 (semana 5-8): ~70h - Panel admin, métricas
- Hito 6 (semana 8-10): ~30h - QA, documentación, ajustes

## Detalle por WBS

> Adjuntar tabla desde `wbs.md` con columnas O/M/P, E y σ.
> **Resumen por módulo:**

| Módulo                               | Horas estimadas | Horas reales |
| ------------------------------------ | --------------: | -----------: |
| Kickoff y diseño                     |              11 |           21 |
| Módulo público (QR, búsqueda, ficha) |              23 |           32 |
| Panel admin (CRUD productos)         |              18 |           39 |
| Promociones y validaciones           |              14 |           26 |
| Métricas y dashboard                 |              12 |           18 |
| PWA y ajustes finales                |               8 |           20 |
| QA y testing                         |               7 |           10 |
| Documentación                        |               7 |           9  |
| **Total**                            |         **100** |      **175** |

## Cronograma tentativo (derivado de capacidad)

**Equipo / disponibilidad:**

**Duración estimada:** 10 semanas
**Hitos:**

**Cronograma detallado:**

- Semana 1: Kickoff + Diseño técnico
- Semana 2-4: Módulo público
- Semana 5-7: Panel de administración
- Semana 8-9: QA + UAT + Ajustes
- Semana 10: Documentación + Entrega

## Versionado del presupuesto

- **v1 (Noviembre 2025):** Alcance inicial MVP, 100h estimadas a $30/h, ~$3,000 USD (solo laboral).
- **v2 (Enero 2026):** Revisión final, 175h reales a $30/h, $6,076.5 USD total (incluye hosting, dominio y contingencia 15%). Esteban: 140h, Jorge: 35h.
