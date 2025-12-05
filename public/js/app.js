// public/js/app.js
/**
 * Punto de entrada del cliente
 *
 * Responsabilidad:
 * - Configurar la navegación interna (botones que actualizan el hash).
 * - Inicializar el router SPA.
 * - Registrar el service worker cuando corresponda.
 */
import { initRouter } from './router.js';

function setupNavigation() {
  const navButtons = document.querySelectorAll('[data-link]');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const targetHash = btn.getAttribute('data-link') || '#home';
      window.location.hash = targetHash;
    });
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js')
        .then((registration) => {
          console.log('Service Worker registrado con scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Error registrando Service Worker:', error);
        });
    });
  } else {
    console.log('Service Worker no soportado en este navegador.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initRouter();
  registerServiceWorker();
});
