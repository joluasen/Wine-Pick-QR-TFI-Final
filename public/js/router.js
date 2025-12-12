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
  '#promos': 'promotions',
  '#promotions': 'promotions',
  // Rutas de Admin
  '#admin': 'admin',
  '#admin/products': 'admin', // Ejemplo, podría tener su propia vista
  '#admin/create': 'admin',   // Ejemplo
  '#admin/metrics': 'admin',  // Ejemplo
};

// Rutas que se consideran parte del panel de administración
const adminRoutes = ['admin'];

function getViewFromHash() {
  const hash = window.location.hash || '#home';
  const baseHash = hash.split('?')[0];
  
  // Simplificamos la lógica: si la ruta empieza con #admin, es 'admin'.
  if (baseHash.startsWith('#admin')) {
    return 'admin';
  }
  
  return routes[baseHash] || 'home';
}

async function checkAuthentication() {
  try {
    const res = await fetch('./api/admin/me', {
      headers: { Accept: 'application/json' }
    });
    return res.ok;
  } catch (err) {
    console.error('Error de autenticación:', err);
    return false;
  }
}

/**
 * Carga la barra de navegación apropiada (pública o admin)
 * @param {boolean} isAdminView - True si la vista es de administrador
 */
async function loadNavigation(isAdminView) {
  const navContainer = document.getElementById('app-nav-container');
  if (!navContainer) return;

  const navPartial = isAdminView ? './views/partials/nav-admin.html' : './views/partials/nav-public.html';

  try {
    const res = await fetch(navPartial, { cache: 'no-store' });
    if (res.ok) {
      navContainer.innerHTML = await res.text();
      
      // Añadir listener para el botón de logout si es la nav de admin
      if (isAdminView) {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
              await fetch('./api/admin/logout', { method: 'POST' });
              window.location.hash = '#login';
            } catch (err) {
              console.error('Error al cerrar sesión:', err);
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error cargando la navegación:', err);
  }
}

async function showView(viewName) {
  const root = document.getElementById('app-root');
  if (!root) return;

  const isAdminView = adminRoutes.includes(viewName);
  
  // Cargar la navegación correcta ANTES de proteger la ruta
  await loadNavigation(isAdminView);

  // Proteger rutas que requieren autenticación
  if (isAdminView) {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      window.location.hash = '#login';
      return;
    }
  }

  // Cargar parcial de la vista correspondiente
  try {
    // La vista de login no necesita nav, podríamos ocultarla
    if (viewName === 'login') {
        const navContainer = document.getElementById('app-nav-container');
        if (navContainer) navContainer.innerHTML = '';
    }

    const res = await fetch(`./views/${viewName}.html`, { cache: 'no-store' });
    if (!res.ok) {
      root.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">Error cargando la vista ${viewName} (HTTP ${res.status})</div></div>`;
      return;
    }

    root.innerHTML = await res.text();
  } catch (err) {
    root.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">Error al cargar la vista: ${err.message}</div></div>`;
    return;
  }

  // Inicializar el controlador de la vista cargada
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
  
  // Marcar el ítem de navegación activo
  const currentHash = window.location.hash || '#home';
  const activeLink = document.querySelector(`.nav-item[data-link="${currentHash.split('?')[0]}"]`);
  if (activeLink) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    activeLink.classList.add('active');
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
