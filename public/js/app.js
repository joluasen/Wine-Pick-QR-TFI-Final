// public/js/app.js
/**
 * Punto de entrada de la aplicación
 * 
 * Responsabilidades:
 * - Inicializar el router SPA
 * - Registrar el Service Worker
 * - Inicializar el modal de login global
 * 
 * NOTA: La navegación se maneja ÚNICAMENTE en router.js
 */

import { initRouter } from './core/router.js';
import { modalManager } from './core/modalManager.js';

/**
 * Registra el Service Worker para funcionalidad PWA
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker no soportado');
    return;
  }
  
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registrado:', registration.scope);
    } catch (err) {
      console.error('Error registrando Service Worker:', err);
    }
  });
}

/**
 * Inicializa el modal de login global (Bootstrap)
 */
function initGlobalLoginModal() {
  const modalEl = document.getElementById('loginModal');
  const form = document.getElementById('login-form-modal');
  
  if (!form || !modalEl) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username-modal')?.value?.trim();
    const password = document.getElementById('login-password-modal')?.value;
    const statusEl = document.getElementById('login-status-modal');
    
    if (!username || !password) {
      showLoginStatus(statusEl, 'Ingresá usuario y contraseña', 'error');
      return;
    }
    
    showLoginStatus(statusEl, 'Autenticando...', 'info');
    
    try {
      const response = await fetch('./api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json().catch(() => null);
      
      if (!response.ok || !data?.ok) {
        showLoginStatus(statusEl, data?.error?.message || 'Credenciales inválidas', 'error');
        return;
      }
      
      showLoginStatus(statusEl, 'Login exitoso', 'success');
      
      // Cerrar modal y navegar a admin
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        
        form.reset();
        window.location.hash = '#admin';
      }, 500);
      
    } catch (err) {
      showLoginStatus(statusEl, `Error de conexión: ${err.message}`, 'error');
    }
  });
  
  // Limpiar estado al cerrar modal
  modalEl.addEventListener('hidden.bs.modal', () => {
    const statusEl = document.getElementById('login-status-modal');
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.dataset.type = '';
    }
  });
}

/**
 * Muestra estado en el modal de login
 */
function showLoginStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
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

  // Inicializar login modal global
  // Pequeño delay para asegurar que Bootstrap esté listo
  setTimeout(initGlobalLoginModal, 100);

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
