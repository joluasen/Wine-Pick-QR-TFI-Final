// public/js/router.js
/**
 * Router cliente (SPA) con inyección dinámica de navegación
 *
 * Responsabilidad:
 * - Resolver la vista actual basada en el hash de la URL.
 * - Cargar la vista parcial correspondiente (`/views/{view}.html`).
 * - Inyectar dinámicamente la navegación correcta (pública o admin).
 * - Inyectar el buscador en el header.
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

const defaultRoute = 'home';

// Rutas que requieren autenticación
const protectedRoutes = ['admin'];

// Rutas públicas
const publicRoutes = ['home', 'login', 'qr', 'search', 'promotions'];

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
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Inyecta dinámicamente la navegación correcta (pública o admin)
 * en ambos contenedores: sidebar (desktop) y nav-container (mobile)
 */
async function loadNavigation(viewName) {
  const navContainer = document.getElementById('nav-container'); // Mobile bottom-nav
  const sidebarContainer = document.getElementById('sidebar-container'); // Desktop sidebar

  const isPublic = publicRoutes.includes(viewName);
  const navFile = isPublic ? 'nav-public.html' : 'nav-admin.html';

  try {
    const res = await fetch(`./views/partials/${navFile}`, { cache: 'no-store' });
    if (res.ok) {
      const html = await res.text();
      
      // Inyectar en mobile bottom-nav
      if (navContainer) {
        navContainer.innerHTML = html;
      }
      
      // Inyectar en desktop sidebar
      if (sidebarContainer) {
        sidebarContainer.innerHTML = html;
      }
      
      setupNavigation();
    }
  } catch (err) {
    console.error('Error cargando navegación:', err);
  }
}

/**
 * Inyecta el buscador en el header
 */
async function loadSearchHeader() {
  const mobileSearch = document.getElementById('mobile-search-header');
  const desktopSearch = document.getElementById('desktop-search-header');
  
  if (!mobileSearch && !desktopSearch) return;

  try {
    const res = await fetch('./views/partials/search-header.html', { cache: 'no-store' });
    if (res.ok) {
      const html = await res.text();
      if (mobileSearch) mobileSearch.innerHTML = html;
      if (desktopSearch) desktopSearch.innerHTML = html;
    }
  } catch (err) {
    console.error('Error cargando buscador:', err);
  }
}

/**
 * Configura los listeners de navegación después de inyectar
 */
function setupNavigation() {
  const navItems = document.querySelectorAll('[data-link]');
  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-link');
      window.location.hash = target;
    });
  });

  // Marcar item activo
  const currentHash = window.location.hash || '#home';
  const baseHash = currentHash.split('?')[0];
  document.querySelectorAll('[data-link]').forEach((item) => {
    if (item.getAttribute('data-link') === baseHash) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Destruir tooltips anteriores antes de crear nuevos
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    const tooltip = window.bootstrap?.Tooltip?.getInstance(el);
    if (tooltip) {
      tooltip.dispose();
    }
  });

  // Inicializar tooltips de Bootstrap (solo sidebar)
  const sidebarTooltips = document.querySelectorAll('#sidebar-container [data-bs-toggle="tooltip"]');
  sidebarTooltips.forEach((el) => {
    new window.bootstrap.Tooltip(el, {
      trigger: 'hover'
    });
  });
}

async function showView(viewName) {
  const root = document.getElementById('app-root');
  if (!root) return;

  // Proteger rutas que requieren autenticación
  if (protectedRoutes.includes(viewName)) {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      window.location.hash = '#login';
      return;
    }
  }

  // Si no hay hash y no está autenticado, redirigir a home
  if (!window.location.hash || window.location.hash === '#') {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      viewName = defaultRoute;
    }
  }

  // Inyectar navegación dinámica
  await loadNavigation(viewName);

  // Inyectar buscador en header
  await loadSearchHeader();

  // Cargar vista parcial
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

  // Inicializar la vista
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
    case 'admin':
      initAdminView(root);
      break;
    case 'promotions':
      initPromotionsView(root);
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
