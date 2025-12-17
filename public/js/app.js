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
import { initLoginModal } from './views/loginView.js';

import { showQrModal } from './views/qrModal.js';
window.showQrModal = showQrModal;

function setupNavigation() {
  // Botón QR: siempre abrir modal y nunca debe tener data-link
  const qrBtn = document.querySelector('.bottom-nav-scan');
  if (qrBtn) {
    qrBtn.removeAttribute('data-link'); // Refuerzo: nunca debe tener data-link
      // Limpia listeners previos y agrega uno único
      const cleanQrBtn = qrBtn.cloneNode(true);
      qrBtn.parentNode.replaceChild(cleanQrBtn, qrBtn);
      cleanQrBtn.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.hash = '#scan';
      });
  }
  // Otros botones de navegación
    const navButtons = document.querySelectorAll('[data-link]:not(.bottom-nav-scan)');
    navButtons.forEach((btn) => {
      const cleanBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(cleanBtn, btn);
      cleanBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const targetHash = cleanBtn.getAttribute('data-link') || '#home';
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

  // Inicializar login modal con pequeño delay para asegurar que Bootstrap esté listo
  setTimeout(() => {
    try {
      initLoginModal();
      console.log('Login modal inicializado');
    } catch (err) {
      console.error('Error inicializando login modal:', err);
    }
  }, 100);
});
