// public/js/views/qrView.js

let initialized = false;

export function initQrView() {
  if (initialized) return;
  console.log('Vista Consulta por QR inicializada');

  // A futuro:
  // - Manejo de cámara / ingreso manual de código
  // - Llamadas a la API de consulta por código (HU-C1)

  initialized = true;
}
