// public/js/router.js
/**
 * Router cliente (SPA)
 *
 * Responsabilidad:
 * - Resolver la vista actual basada en el hash de la URL.
 * - Cargar la vista parcial correspondiente (`/views/{view}.html`) mediante fetch
 *   e inyectarla en el contenedor `#app-root`.
 * - Invocar el inicializador de la vista (controlador) para enlazar eventos.
 */
import { initHomeView } from './views/homeView.js';
import { initQrView } from './views/qrView.js';
import { initSearchView } from './views/searchView.js';
import { initAdminView } from './views/adminView.js';

const routes = {
  '': 'home',
  '#home': 'home',
  '#qr': 'qr',
  '#search': 'search',
  '#admin': 'admin',
};

function getViewFromHash() {
  const hash = window.location.hash || '#home';
  const baseHash = hash.split('?')[0];
  return routes[baseHash] || 'home';
}

async function showView(viewName) {
  const root = document.getElementById('app-root');
  if (!root) return;

  // Cargar parcial correspondiente
  try {
    const res = await fetch(`./views/${viewName}.html`, { cache: 'no-store' });
    if (!res.ok) {
      root.innerHTML = `<p>Error cargando la vista ${viewName} (HTTP ${res.status})</p>`;
      return;
    }

    const html = await res.text();
    root.innerHTML = html;
  } catch (err) {
    root.innerHTML = `<p>Error al cargar la vista: ${err.message}</p>`;
    return;
  }

  // Inicializar la vista cargada pasando el contenedor raíz
  switch (viewName) {
    case 'home':
      initHomeView(root);
      break;
    case 'qr':
      initQrView(root);
      break;
    case 'search':
      initSearchView(root);
      break;
    case 'admin':
      initAdminView(root);
      break;
    default:
      initHomeView(root);
      break;
  }
}

function navigate() {
  const viewName = getViewFromHash();
  showView(viewName);
}

export function initRouter() {
  window.addEventListener('hashchange', navigate);
  // Primer render
  navigate();
}
