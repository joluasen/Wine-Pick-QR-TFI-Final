// public/js/app.js
/**
 * Punto de entrada de la aplicación
 * 
 * Responsabilidades:
 * - Inicializar el router SPA
 * - Registrar el Service Worker
 * 
 * NOTA: La navegación se maneja ÚNICAMENTE en router.js
 */

import { initRouter } from './core/router.js';
import { modalManager } from './core/modalManager.js';

/**
 * Variable para almacenar el evento de instalación PWA
 */
let deferredPrompt = null;

/**
 * Inicializa la funcionalidad de instalación PWA
 * Captura el evento beforeinstallprompt y muestra los botones de instalar
 */
function initPWAInstall() {
  const installBtnDesktop = document.getElementById('pwa-install-btn');
  const installBtnMobile = document.getElementById('pwa-install-btn-mobile');
  const installBtns = [installBtnDesktop, installBtnMobile].filter(Boolean);

  if (installBtns.length === 0) return;

  // Función para mostrar ambos botones
  const showInstallBtns = () => {
    installBtns.forEach(btn => btn.classList.remove('pwa-btn-hidden'));
  };

  // Función para ocultar ambos botones
  const hideInstallBtns = () => {
    installBtns.forEach(btn => btn.classList.add('pwa-btn-hidden'));
  };

  // Si ya está instalada como PWA (standalone), no mostrar botón
  if (window.matchMedia('(display-mode: standalone)').matches) {
    localStorage.setItem('pwa-installed', 'true');
    return;
  }

  // Si ya fue instalada previamente, no mostrar
  if (localStorage.getItem('pwa-installed') === 'true') {
    return;
  }

  // Si anteriormente se detectó que es instalable, mostrar botones
  if (localStorage.getItem('pwa-installable') === 'true') {
    showInstallBtns();
  }

  // Capturar el evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    localStorage.setItem('pwa-installable', 'true');
    showInstallBtns();
  });

  // Función para manejar instalación
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    } else {
      alert('Para instalar la app:\n\n• Chrome/Edge: Menú (⋮) → "Instalar aplicación"\n• Safari iOS: Compartir → "Agregar a inicio"');
    }
  };

  // Agregar listener a ambos botones
  installBtns.forEach(btn => btn.addEventListener('click', handleInstallClick));

  // Ocultar botones cuando la app se instala
  window.addEventListener('appinstalled', () => {
    hideInstallBtns();
    localStorage.setItem('pwa-installed', 'true');
    localStorage.removeItem('pwa-installable');
    deferredPrompt = null;
  });
}

/**
 * Registra el Service Worker para funcionalidad PWA
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
    } catch (err) {
      console.error('Error registrando Service Worker:', err);
    }
  });
}

/**
 * Inicializa el modal de login global (Bootstrap)
 */
async function initGlobalLoginModal() {
  try {
    const { initLoginModal } = await import('./views/loginView.js');
    initLoginModal();
  } catch (err) {
    console.error('Error inicializando modal de login:', err);
  }
}

/**
 * Muestra estado en el modal de login
 */
function showLoginStatus(el, message, type) {
  // FUNCIÓN ELIMINADA - Ya no se utiliza autenticación
}

/**
 * Inicializa los dropdowns del sidebar para que se muestren correctamente
 * fuera del contenedor con overflow
 */
function initSidebarDropdowns() {
  document.addEventListener('show.bs.dropdown', (e) => {
    const toggle = e.target;
    if (!toggle.closest('.sidebar-dropdown')) return;

    const menu = toggle.nextElementSibling;
    if (!menu || !menu.classList.contains('dropdown-menu')) return;

    // Calcular posición del toggle
    const rect = toggle.getBoundingClientRect();

    // Necesitamos esperar un frame para que el menú tenga sus dimensiones
    requestAnimationFrame(() => {
      const menuHeight = menu.offsetHeight;
      const toggleCenterY = rect.top + (rect.height / 2);
      const menuTop = toggleCenterY - (menuHeight / 2);

      // Posicionar el menú a la derecha del toggle, centrado verticalmente
      menu.style.left = `${rect.right + 4}px`;
      menu.style.top = `${Math.max(8, menuTop)}px`; // Mínimo 8px del borde superior
    });
  });
}

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
function init() {
  // Inicializar router (maneja toda la navegación)
  initRouter();

  // Registrar Service Worker
  registerServiceWorker();

  // Inicializar instalación PWA
  initPWAInstall();

  // Inicializar modal de login global
  initGlobalLoginModal();

  // Inicializar dropdowns del sidebar
  initSidebarDropdowns();
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exportar modalManager para uso global si es necesario
window.modalManager = modalManager;
