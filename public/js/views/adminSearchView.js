// public/js/views/adminSearchView.js
// Vista de búsqueda para admin: reutiliza la lógica pública pero en contexto admin

import { initSearchView } from './searchView.js';

export function initAdminSearchView(container) {
  // Reutilizamos la misma vista y componentes que la pública
  // La navegación y el contexto admin son gestionados por el router (nav-admin)
  return initSearchView(container);
}
