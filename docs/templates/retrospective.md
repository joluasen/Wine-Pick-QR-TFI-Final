# Retrospectiva del Proyecto – WINE-PICK-QR

Reflexión sobre el desarrollo del proyecto como Trabajo Final Integrador.

---

## Información del proyecto

| Campo        | Valor                                                 |
| ------------ | ----------------------------------------------------- |
| **Proyecto** | WINE-PICK-QR                                          |
| **Autores**  | Rusch Esteban Alberto (Legajo: 17873), Jorge Asensio  |
| **Período**  | Noviembre 2025 – Febrero 2026                         |
| **Contexto** | TFI – Tecnicatura Universitaria en Programación (UTN) |

---

## ¿Qué salió bien?

### Decisiones técnicas acertadas

| Decisión                                      | Resultado                                                                                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **JavaScript vanilla en lugar de frameworks** | Mayor control sobre el código, mejor rendimiento, sin dependencias pesadas. El resultado es liviano y fácil de mantener.               |
| **PHP puro con patrón MVC**                   | Estructura clara y organizada sin la curva de aprendizaje de un framework completo. Fácil de explicar y defender.                      |
| **PWA en lugar de app nativa**                | Los usuarios pueden usar la aplicación sin instalar nada desde una tienda. Se agrega a la pantalla de inicio fácilmente.               |
| **QR con URL completa**                       | Permite escanear directamente desde la cámara nativa del celular, sin necesidad de abrir la app primero. Mejor experiencia de usuario. |
| **JWT en cookie HttpOnly**                    | Seguridad robusta contra XSS sin complicar la implementación. Mejor que almacenar tokens en localStorage.                              |

### Funcionalidades bien logradas

| Funcionalidad                      | Observación                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Flujo de consulta (QR → ficha)** | Funciona de forma rápida y simple. El usuario obtiene la información en segundos.                       |
| **Panel de administración**        | Completo y usable. Permite gestionar productos y promociones sin conocimientos técnicos.                |
| **Validación de promociones**      | El sistema evita errores de configuración al no permitir promociones superpuestas (RF12).               |
| **Métricas de consultas**          | Aportan valor real al negocio: saber qué productos generan interés es información útil para decisiones. |

### Proceso de desarrollo

- La documentación previa (Project Brief, requerimientos, diseño funcional) ayudó a tener claridad sobre el alcance desde el principio.
- El desarrollo incremental permitió tener versiones funcionales desde temprano, lo que facilitó las pruebas.
- El uso de Git mantuvo el historial ordenado y permitió volver atrás cuando fue necesario.

---

## ¿Qué podría mejorar?

### Aspectos técnicos

| Aspecto                     | Observación                                                                         | Acción futura                                        |
| --------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Testing automatizado**    | No se implementaron tests unitarios ni de integración.                              | En proyectos futuros, incluir tests desde el inicio. |
| **Manejo de errores**       | Algunos casos borde podrían manejarse mejor (ej: timeout de conexión).              | Mejorar los mensajes y la recuperación de errores.   |
| **Documentación de código** | El código está organizado pero podría tener más comentarios en secciones complejas. |

### Proceso de trabajo

| Aspecto                                 | Observación                                                                                      | Acción futura                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| **Planificación inicial**               | Algunas funcionalidades tomaron más tiempo del esperado por no investigar bien antes de empezar. | Hacer spikes técnicos antes de estimar.  |
| **Commits**                             | En algunos momentos se acumularon muchos cambios en un solo commit.                              | Hacer commits más pequeños y frecuentes. |
| **Documentación durante el desarrollo** | Parte de la documentación se hizo al final.                                                      | Documentar decisiones en el momento.     |

### Funcionalidades pendientes (fuera del MVP)

- Recuperación de contraseña por email
- Exportación de métricas, productos a CSV/Excel
- Soporte para múltiples usuarios admin con roles
- Notificaciones cuando una promoción está por vencer

---

## Lecciones aprendidas

### Técnicas

1. **El stack simple funciona:** No siempre se necesita el framework más popular. PHP + JavaScript vanilla resolvieron el problema de forma efectiva.

2. **La validación en backend es esencial:** Aunque el frontend valide, nunca confiar solo en él.

3. **PWA es una buena alternativa:** Para aplicaciones de consulta, una PWA es más accesible que una app nativa. No requiere instalación desde tiendas.

4. **La compatibilidad de cámara varía:** El lector QR funciona diferente en cada navegador. Tener alternativas (búsqueda por texto, QR con URL completa) fue clave.

### De proceso

1. **Documentar antes de codificar:** Tener claros los requerimientos y el diseño funcional antes de escribir código ahorra tiempo y evita retrabajos.

2. **Mantener el alcance acotado:** Es tentador agregar funcionalidades, pero el MVP debe enfocarse en lo esencial. Lo demás puede ser "futuras versiones".

3. **Probar en dispositivos reales:** Las pruebas en el navegador de escritorio no son suficientes. Hay que probar en celulares reales.

---

## Acciones para proyectos futuros

| #   | Acción                                                   | Aplicar en         |
| --- | -------------------------------------------------------- | ------------------ |
| 1   | Implementar tests desde el inicio del proyecto           | Próximo proyecto   |
| 2   | Hacer commits más pequeños y frecuentes                  | Siempre            |
| 3   | Investigar tecnologías nuevas antes de elegirlas (spike) | Fase de diseño     |
| 4   | Documentar decisiones técnicas en el momento             | Durante desarrollo |
| 5   | Probar en dispositivos reales desde el principio         | Durante desarrollo |
| 6   | Usar un sistema de tareas (Trello, GitHub Projects)      | Próximo proyecto   |

---

## Impedimentos encontrados y cómo se resolvieron

| Impedimento                                | Cómo se resolvió                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Compatibilidad de cámara entre navegadores | Se agregó búsqueda por texto como alternativa y QR con URL completa para cámara nativa              |
| Tiempo limitado para el desarrollo         | Se priorizaron funcionalidades Must have y se dejaron otras para futuras versiones                  |
| Falta de cliente real para feedback        | Se simuló el caso de uso basándose en vinotecas reales y la problemática de precios desactualizados |
| Configuración de CORS para cookies         | Se implementó correctamente SameSite y Secure en las cookies JWT                                    |

---

## Métricas del proyecto

| Métrica                                 | Valor                          |
| --------------------------------------- | ------------------------------ |
| **Requerimientos funcionales (RF)**     | 20 definidos, 20 implementados |
| **Requerimientos no funcionales (RNF)** | 6 definidos, 6 implementados   |
| **Historias de usuario**                | 14 definidas, 14 implementadas |
| **Riesgos identificados**               | 10                             |
| **Riesgos mitigados**                   | 9                              |
| **Verificaciones de QA**                | 74 aprobadas                   |

---

## Conclusión

El proyecto cumplió con los objetivos planteados para el MVP. La aplicación permite a los clientes consultar precios y promociones de forma rápida y simple, y al administrador gestionar el catálogo sin complicaciones.

Las decisiones técnicas fueron apropiadas para el alcance y contexto académico: un stack simple pero bien organizado, con buenas prácticas de seguridad y una arquitectura clara.

Las lecciones aprendidas, especialmente sobre testing y documentación durante el desarrollo, serán valiosas para futuros proyectos.

**Calificación personal del resultado:** Si bien el sistema es funcional, usable y cumple con los objetivos planteados, considero que existen aspectos a mejorar en la gestión del proyecto. El presupuesto y los plazos previstos se vieron superados, en parte por la incorporación de funcionalidades no planificadas inicialmente. La inexperiencia en la gestión de proyectos fue un factor determinante en estos desvíos. Esta experiencia resalta la importancia de una planificación más rigurosa y del control del alcance para futuros proyectos, permitiendo optimizar recursos y tiempos sin perder de vista los objetivos principales.

---

## Agradecimientos

- A la cátedra de TFI por la guía metodológica
- A quienes probaron la aplicación y dieron feedback
