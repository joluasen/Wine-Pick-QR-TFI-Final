// public/js/core/router.js
/**
 * Router SPA - Sistema de navegación unificado
 */

import { getBasePath, getHashParams } from './utils.js';
import { modalManager } from './modalManager.js';
import { initUnifiedSearchBar } from '../search-bar.js';

// Configuración de rutas
const ROUTES = {
  '': 'home',
  '#home': 'home',
  '#login': 'login',
  '#search': 'search',
  '#admin': 'admin',
  '#admin-scan': 'adminScan',
  '#admin-search': 'adminSearch',  // buscador exclusivo admin
  '#admin-products': 'adminProducts',
  '#admin-metrics': 'adminMetrics',
  '#admin-promotions': 'adminPromotions',
  //'#promos': 'promotions', //porque hay dos rutas para promociones?
  '#promotions': 'promotions',
  '#scan': 'scan'
};

const PROTECTED_ROUTES = ['admin', '#admin-scan', '#admin-search', 'admin-products', 'admin-metrics', 'admin-promotions'];
const PUBLIC_ROUTES = ['home', 'login', 'search', 'promotions', 'scan'];
const DEFAULT_ROUTE = 'home';

let currentView = null;
let isNavigating = false;

/**
 * Obtiene la URL base - prioriza APP_CONFIG inyectado por PHP
 */
function getBaseUrl() {
  if (window.APP_CONFIG?.baseUrl) {
    return window.APP_CONFIG.baseUrl;
  }
  return getBasePath();
}

/**
 * Verifica si el usuario está autenticado
 */
async function checkAuth() {
  try {
    const response = await fetch(getBaseUrl() + 'api/admin/me', {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin'
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Obtiene el nombre de la vista desde el hash actual
 */
function getViewFromHash() {
  const hash = window.location.hash.split('?')[0] || '#home';
  return ROUTES[hash] || DEFAULT_ROUTE;
}

/**
 * Carga la navegación apropiada según el contexto
 */
async function loadNavigation(viewName) {
  const navContainer = document.getElementById('nav-container');
  const sidebarContainer = document.getElementById('sidebar-container');
  
  const isPublic = PUBLIC_ROUTES.includes(viewName);
  
  let navFile = 'nav-public.php';
  if (!isPublic) {
    const isAuth = await checkAuth();
    navFile = isAuth ? 'nav-admin.php' : 'nav-public.php';
  }
  
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}views/partials/${navFile}`, { 
      cache: 'no-store',
      credentials: 'same-origin'
    });
    
    if (response.ok) {
      const html = await response.text();
      
      if (navContainer) navContainer.innerHTML = html;
      if (sidebarContainer) sidebarContainer.innerHTML = html;
      
      setupNavigationListeners();
      updateActiveNavItem();
    }
  } catch (err) {
    console.error('Error cargando navegación:', err);
  }
}

/**
 * Carga el header de búsqueda
 */
async function loadSearchHeader() {
  const mobileSearch = document.getElementById('mobile-search-header');
  const desktopSearch = document.getElementById('desktop-search-header');
  
  if (!mobileSearch && !desktopSearch) return;
  
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}views/partials/search-header.php`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const html = await response.text();
      if (mobileSearch) mobileSearch.innerHTML = html;
      if (desktopSearch) desktopSearch.innerHTML = html;
      
      initUnifiedSearchBar();
    }
  } catch (err) {
    console.error('Error cargando buscador:', err);
  }
}

/**
 * Configura los listeners de navegación usando event delegation
 */
function setupNavigationListeners() {
  const containers = ['nav-container', 'sidebar-container'];
  
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (container.dataset.listenersAttached) return;
    container.dataset.listenersAttached = 'true';
    
    container.addEventListener('click', handleNavClick);
  });
}

/**
 * Handler para clicks de navegación
 */
function handleNavClick(e) {
  const link = e.target.closest('[data-link]');
  if (!link) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const target = link.getAttribute('data-link');
  
  if (target) {
    navigate(target);
  }
}

/**
 * Actualiza el item activo en la navegación
 */
function updateActiveNavItem() {
  const currentHash = window.location.hash.split('?')[0] || '#home';
  
  document.querySelectorAll('[data-link]').forEach(item => {
    const itemHash = item.getAttribute('data-link');
    item.classList.toggle('active', itemHash === currentHash);
  });
}

/**
 * Inicializa los listeners del buscador
 */
function initSearchListeners() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  
  if (!form) return;
  
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  const newInput = newForm.querySelector('#searchInput');
  
  newForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = newInput?.value?.trim();
    
    if (query) {
      navigate(`#search?query=${encodeURIComponent(query)}`);
      newInput?.blur();
    }
  });
  
  const params = getHashParams();
  if (params.query && newInput) {
    newInput.value = params.query;
  }
}

/**
 * Carga e inicializa una vista
 */
async function loadView(viewName) {
  // Interceptar búsqueda QR admin: si venimos de adminScan y hay query, mostrar ficha admin
  if (viewName === 'search') {
    const params = getHashParams();
    // Si el usuario es admin y viene de adminScan, mostrar ficha admin
    if (window.sessionStorage.getItem('adminScanActive') === '1' && params.query) {
      window.sessionStorage.removeItem('adminScanActive');
      const { editProductByCode } = await import('../views/adminView.js');
      await editProductByCode(params.query);
      return;
    }
  }
  const root = document.getElementById('app-root');
  if (!root) return;
  
  if (isNavigating) return;
  isNavigating = true;
  
  try {
    // Ruta especial #scan (modal QR)
    if (viewName === 'scan') {
      await modalManager.showQrScanner();
      isNavigating = false;
      return;
    }
      // Ruta especial #admin-scan (modal QR admin)
      if (viewName === 'adminScan') {
        // Marcar que el próximo #search?query=... es por adminScan
        window.sessionStorage.setItem('adminScanActive', '1');
        const { showAdminQrScanner } = await import('./modalAdmin.js');
        await showAdminQrScanner();
        isNavigating = false;
        return;
      }
    
    // Verificar autenticación para rutas protegidas
    if (PROTECTED_ROUTES.includes(viewName)) {
      const isAuth = await checkAuth();
      if (!isAuth) {
        isNavigating = false;
        navigate('#login');
        return;
      }
    }

    // Solo mostrar loading del router si la vista no tiene su propio loading
    const viewsWithOwnLoading = ['adminProducts', 'adminPromotions'];

    if (!viewsWithOwnLoading.includes(viewName)) {
      root.innerHTML = `
        <div class="loading-view text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      `;
    } else {
      // Para vistas con su propio loading, solo limpiar el contenido
      root.innerHTML = '';
    }

    // Cargar header y navegación en paralelo
    await Promise.all([
      loadSearchHeader(),
      loadNavigation(viewName)
    ]);
    
    // Cargar vista (.php)
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}views/${viewName}.php`, {
      cache: 'no-store',
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`Vista no encontrada: ${viewName}`);
    }
    
    const html = await response.text();
    root.innerHTML = html;
    
    // Inicializar la vista
    await initializeView(viewName, root);
    
    currentView = viewName;
    root.scrollTop = 0;
    window.scrollTo(0, 0);
    
  } catch (err) {
    console.error('Error cargando vista:', err);
    root.innerHTML = `
      <div class="error-view text-center py-5">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h2>Error al cargar la página</h2>
        <p class="text-muted">${err.message}</p>
        <button onclick="window.location.hash='#home'" class="btn btn-primary">
          <i class="fas fa-home me-1"></i> Volver al inicio
        </button>
      </div>
    `;
  } finally {
    isNavigating = false;
  }
}

/**
 * Inicializa la lógica específica de cada vista
 */
async function initializeView(viewName, container) {
  const viewModules = {
    home: () => import('../views/homeView.js'),
    login: () => import('../views/loginView.js'),
    search: () => import('../views/searchView.js'),
    admin: () => import('../views/adminView.js'),
    adminProducts: () => import('../views/adminProductsView.js'),
    adminMetrics: () => import('../views/adminMetricsView.js'),
    adminPromotions: () => import('../views/adminPromotionsView.js'),
    promotions: () => import('../views/promotionsView.js')
  };

  const moduleLoader = viewModules[viewName];

  if (moduleLoader) {
    try {
      const module = await moduleLoader();
      const initFnName = `init${viewName.charAt(0).toUpperCase() + viewName.slice(1)}View`;
      const initFn = module[initFnName];

      if (typeof initFn === 'function') {
        await initFn(container);
      }
    } catch (err) {
      console.error(`Error inicializando vista ${viewName}:`, err);
    }
  }
}

/**
 * Navega a una ruta específica
 */
export function navigate(hash) {
  modalManager.closeAll();
  
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    handleHashChange();
  }
}

/**
 * Handler para cambios de hash
 */
function handleHashChange() {
  const viewName = getViewFromHash();
  loadView(viewName);
}

/**
 * Inicializa el router
 */
export function initRouter() {
  modalManager.init();
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
}

/**
 * Obtiene la vista actual
 */
export function getCurrentView() {
  return currentView;
}
