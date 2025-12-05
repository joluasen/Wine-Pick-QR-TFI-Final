// public/js/router.js
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
  return routes[hash] || 'home';
}

function showView(viewName) {
  const sections = document.querySelectorAll('[data-view]');
  sections.forEach((section) => {
    const isActive = section.dataset.view === viewName;
    section.classList.toggle('view--active', isActive);
  });

  // Llamada a inicializadores de vistas (a futuro se puede ampliar)
  switch (viewName) {
    case 'home':
      initHomeView();
      break;
    case 'qr':
      initQrView();
      break;
    case 'search':
      initSearchView();
      break;
    case 'admin':
      initAdminView();
      break;
    default:
      initHomeView();
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
