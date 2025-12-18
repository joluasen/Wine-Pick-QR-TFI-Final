// public/js/views/adminProductsView.js
import { setupLogout } from './adminView.js';

export function initAdminProductsView(container) {
  container.innerHTML += `<div class='alert alert-info mt-3'>Vista de productos cargada correctamente.</div>`;
  // Configura el botón de logout
  setupLogout(container);
}
