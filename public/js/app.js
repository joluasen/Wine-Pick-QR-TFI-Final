
// public/js/app.js
/**
 * Punto de entrada de la aplicación Wine-Pick-QR
 *
 * Responsabilidades principales:
 * - Inicializar el router SPA
 * - Registrar el Service Worker para PWA
 * - Gestionar la instalación como PWA
 * - Inicializar el modal de login global
 * - Configurar el comportamiento de los dropdowns del sidebar
 *
 * NOTA: La navegación se maneja ÚNICAMENTE en router.js
 */

import { initRouter } from './core/router.js';
import { modalManager } from './core/modalManager.js';

/**
 * Variable global para almacenar el evento de instalación PWA (beforeinstallprompt)
 * Permite mostrar el prompt de instalación bajo demanda.
 */
let deferredPrompt = null;

/**
 * Inicializa la funcionalidad de instalación PWA.
 * Captura el evento beforeinstallprompt y muestra los botones de instalar en desktop y mobile.
 */
function initPWAInstall() {
  const installBtnDesktop = document.getElementById('pwa-install-btn');
  const installBtnMobile = document.getElementById('pwa-install-btn-mobile');
  const installBtns = [installBtnDesktop, installBtnMobile].filter(Boolean);

  if (installBtns.length === 0) return;

  // Función para mostrar ambos botones de instalación
  const showInstallBtns = () => {
    installBtns.forEach(btn => btn.classList.remove('pwa-btn-hidden'));
  };

  // Función para ocultar ambos botones de instalación
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

  // Capturar el evento beforeinstallprompt para controlar el prompt manualmente
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    localStorage.setItem('pwa-installable', 'true');
    showInstallBtns();
  });

  // Función para manejar el click en los botones de instalación
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
 * Registra el Service Worker para funcionalidad PWA.
 * Permite navegación offline y otras capacidades PWA.
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      // Se puede agregar lógica adicional aquí si se requiere
    } catch (err) {
      console.error('Error registrando Service Worker:', err);
    }
  });
}

/**
 * Inicializa el modal de login global (no usa Bootstrap, es custom).
 * Importa dinámicamente la lógica del modal de login.
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
 * (Obsoleta) Muestra estado en el modal de login.
 * Ya no se utiliza autenticación por estado.
 */
function showLoginStatus(el, message, type) {
  // FUNCIÓN ELIMINADA - Ya no se utiliza autenticación
}

/**
 * Inicializa los dropdowns del sidebar para que se muestren correctamente
 * fuera del contenedor con overflow hidden.
 * Corrige problemas de visualización en menús laterales.
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
 * Inicializa el modal de filtros de búsqueda sin Bootstrap.
 * Maneja la apertura/cierre y la aplicación de filtros.
 */
// Modal de filtros: vuelve a usar Bootstrap (no custom JS necesario)

/**
 * Inicializa la aplicación cuando el DOM está listo.
 * Llama a todos los inicializadores principales.
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

// Esperar a que el DOM esté listo antes de inicializar la app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exportar modalManager para uso global si es necesario
window.modalManager = modalManager;
