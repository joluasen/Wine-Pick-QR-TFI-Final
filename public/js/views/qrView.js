// public/js/views/qrView.js
/**
 * Controlador de la vista 'qr'
 *
 * Responsabilidad:
 * - Preparar el contenedor para la lectura de códigos (cámara o ingreso manual).
 * - Enlazar eventos y llamadas a la API para obtener datos por código.
 * - Recibe el contenedor DOM (la sección cargada) como argumento.
 */
let initialized = false;

export function initQrView(container) {
  if (initialized) return;
  // Inicialización perezosa: dejar el hook implementado para agregar soporte
  // de cámara o entrada manual cuando se implemente la funcionalidad.
  initialized = true;
}
