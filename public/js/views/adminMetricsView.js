// public/js/views/adminMetricsView.js
import { setupLogout } from './adminView.js';

export function initAdminMetricsView(container) {
  container.innerHTML += `<div class='alert alert-info mt-3'>Vista de métricas cargada correctamente.</div>`;
  // Configura el botón de logout
  setupLogout(container);
}
