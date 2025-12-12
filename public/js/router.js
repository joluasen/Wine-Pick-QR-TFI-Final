// public/js/router.js
/**
 * Router cliente (SPA)
 *
 * Responsabilidad:
 * - Resolver la vista actual basada en el hash de la URL.
 * - Cargar la vista parcial correspondiente (`/views/{view}.html`) mediante fetch
 *   e inyectarla en el contenedor `#app-root`.
 * - Invocar el inicializador de la vista (controlador) para enlazar eventos.
 * - Proteger rutas admin (requiere autenticación).
 */
import { initHomeView } from './views/homeView.js';
import { initQrView } from './views/qrView.js';
import { initSearchView } from './views/searchView.js';
import { initAdminView } from './views/adminView.js';
import { initLoginView } from './views/loginView.js';
import { initPromotionsView } from './views/promotionsView.js';

const routes = {
  '': 'home',
  '#home': 'home',
  '#login': 'login',
  '#qr': 'qr',
  '#search': 'search',
  '#admin': 'admin',
  '#promos': 'promotions',
  '#promotions': 'promotions',
};

// Rutas que requieren autenticación
const protectedRoutes = ['admin'];

function getViewFromHash() {
  const hash = window.location.hash || '#home';
  const baseHash = hash.split('?')[0];
  return routes[baseHash] || 'home';
}

async function checkAuthentication() {
  try {
    const res = await fetch('./api/admin/me', {
      headers: { Accept: 'application/json' }
    });
    return res.ok; // true si está autenticado, false si no
  } catch (err) {
    return false;
  }
}

async function showView(viewName) {
  const root = document.getElementById('app-root');
  if (!root) return;

  // Proteger rutas que requieren autenticación
  if (protectedRoutes.includes(viewName)) {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      // Redirigir a login
      window.location.hash = '#login';
      return;
    }
  }

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
    case 'login':
      initLoginView(root);
      break;
    case 'qr':
      initQrView(root);
      break;
    case 'search':
      initSearchView(root);
      break;
    case 'promotions':
      initPromotionsView(root);
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
