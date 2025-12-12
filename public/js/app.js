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
  // La navegación ahora es dinámica, los listeners se deben añadir después de cargar el parcial.
  // Usamos delegación de eventos en un contenedor estático.
  const navContainer = document.getElementById('app-nav-container');
  if (navContainer) {
    navContainer.addEventListener('click', (event) => {
      const target = event.target.closest('[data-link]');
      if (target) {
        event.preventDefault();
        const targetHash = target.getAttribute('data-link');
        if (targetHash && window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
      }
    });
  }
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
