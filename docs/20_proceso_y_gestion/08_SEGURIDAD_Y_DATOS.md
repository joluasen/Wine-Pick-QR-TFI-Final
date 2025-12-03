# Seguridad y datos – WINE-PICK-QR

## 1. Alcance

Este documento resume las consideraciones de seguridad, protección de datos y aspectos éticos del proyecto WINE-PICK-QR en el contexto del Trabajo Final Integrador.

El sistema no gestiona datos personales de clientes finales; se centra en:

- Datos de productos (bebidas).
- Datos de promociones.
- Usuarios administradores del sistema.

## 2. Autenticación y autorización

- El acceso al **panel de administración** se protege mediante autenticación por usuario y contraseña.
- Las credenciales de administrador:
  - Se almacenan en la base de datos con algoritmos de hash (no en texto plano).
  - No se devuelven a través de la API.
- Las operaciones de administración (gestión de productos, promociones, métricas) sólo se permiten si existe una sesión de administrador válida.
- Las rutas públicas (`/api/public/...`) sólo ofrecen operaciones de lectura, sin exponer funciones de modificación de datos.

## 3. Validación y sanitización de datos

Para reducir riesgos de vulnerabilidades comunes:

- Todos los parámetros de entrada (formularios, parámetros de consulta, cuerpos JSON):
  - Se validan en backend (tipos, rangos, formatos).
  - Se sanitizan antes de interactuar con la base de datos.
- Se utilizan consultas preparadas o mecanismos equivalentes para prevenir **SQL Injection**.
- Se evita la inclusión de HTML sin controlo en campos de texto libre para prevenir **XSS** (Cross-Site Scripting).

## 4. Gestión de sesiones

- Se utilizan sesiones de servidor para identificar a los administradores autenticados.
- Las cookies de sesión:
  - Deben tener configuraciones seguras acorde al entorno (por ejemplo, `HttpOnly` y `Secure` en producción con HTTPS).
- El cierre de sesión borra la información de la sesión y deja sin efecto el acceso a rutas administrativas.

## 5. Protección de datos y ética

- Los datos utilizados para la demostración del TFI corresponden a:
  - Productos ficticios o
  - Datos simulados basados en ejemplos genéricos, sin vínculo contractual con comercios reales, salvo autorización explícita.
- No se incluirán datos personales reales de clientes ni información sensible.
- Si se reutilizan nombres de bodegas o marcas reales, será únicamente con fines educativos y en un contexto de demo, sin registrar datos comerciales privados.

## 6. Licencias y propiedad intelectual

- Se respetan las licencias de:
  - Frameworks y librerías utilizadas (por ejemplo, Bootstrap, html5-qrcode, Chart.js, etc.).
  - Otros componentes de terceros (iconos, fuentes, plantillas).
- El código desarrollado por el equipo para este TFI:
  - Es original, aunque puede haberse apoyado en ejemplos, documentación oficial y herramientas de asistencia (incluida IA), lo cual se declara explícitamente en la documentación.
- Cualquier porción de código copiada o adaptada de fuentes externas debe:
  - Estar claramente comentada.
  - Incluir referencia a la fuente original si corresponde.

## 7. Logs y métricas

- El sistema registra **eventos de consulta** sin información personal identificable.
- Los logs de aplicación (errores, advertencias técnicas):
  - No deben incluir contraseñas ni secretos.
  - Pueden registrarse en el entorno de desarrollo para depuración.
  - Deben manejarse con cuidado en entornos públicos.

## 8. Respeto a la normativa del TFI

- El desarrollo del proyecto cumple con:
  - La prohibición de exponer datos personales reales sin consentimiento.
  - La obligación de declarar componentes externos y herramientas utilizadas.
- Se está atento a cualquier indicación adicional que la cátedra pueda realizar sobre seguridad y protección de datos.

## 9. Relación con otros documentos

- `STACK_TECNOLOGICO_Y_PATRONES.md` – describe las tecnologías y patrones que ayudan a implementar estas prácticas de seguridad.
- `API_REST.md` – detalla los endpoints y su exposición (pública vs admin).
- `09_DESPLIEGUE_Y_ENTORNO.md` – puede incluir detalles adicionales de configuración segura en el entorno de demo/producción.
