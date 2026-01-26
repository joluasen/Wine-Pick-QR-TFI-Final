
/**
 * adminView.js
 *
 * Vista principal de administración (panel admin).
 *
 * Orquesta la inicialización de componentes, delega lógica de negocio a servicios,
 * y gestiona la interacción de usuario para productos y promociones.
 *
 * Principales responsabilidades:
 * - Inicializar componentes y formularios admin
 * - Delegar lógica de negocio a servicios (ej: búsqueda de productos)
 * - Delegar renderizado y modales a componentes
 * - Gestionar acciones de usuario (crear, editar, logout)
 * - Mantener separación de responsabilidades (MVC/SOLID)
 */

import { modalManager } from '../core/modalManager.js';
import { setStatus, fetchJSON } from '../core/utils.js';

// Servicios
import { searchProductByCode } from '../admin/services/productService.js';

// Componentes
import { setupPromotionCreateForm } from '../admin/components/PromotionFormHandler.js';
import { setupProfileModal as setupProfileModalComponent } from '../admin/components/profileModal.js';

// Re-exportar para uso en router
export { setupProfileModalComponent as setupProfileModal };


/**
 * Muestra la ficha editable de un producto dado su código público.
 * Usado por el flujo de escaneo QR en admin.
 * @param {string} code - Código público del producto
 */
export async function editProductByCode(code) {
  // Buscar producto por código usando el servicio
  const product = await searchProductByCode(code);

  if (!product) {
    alert('No se encontró ningún producto con ese código.');
    return;
  }

  // Asegurar contexto admin para que se muestren las acciones
  if (!window.location.hash.startsWith('#admin')) {
    window.location.hash = '#admin-products';
  }

  // Mostrar ficha del producto con acciones admin (editar, eliminar, QR)
  modalManager.showProductAdmin(product);
}


/**
 * Configura los botones de "Nuevo Producto" (mobile y desktop).
 * Al hacer click, abre el modal de creación y recarga la lista si corresponde.
 */
export function setupNewProductButtons() {
  const newProductBtns = document.querySelectorAll('#btn-new-product-mobile, #btn-new-product-desktop');

  newProductBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      // Mostrar modal de creación de producto
      modalManager.showCreateProduct((newProduct) => {
        // Si estamos en la vista de productos, recargar para mostrar el nuevo
        const currentHash = window.location.hash;
        if (currentHash === '#admin-products') {
          window.location.reload();
        }
      });
    });
  });
}


/**
 * Configura los botones de "Nueva Promoción" (mobile y desktop).
 * Al hacer click, abre el modal de creación y recarga la lista si corresponde.
 */
export function setupNewPromotionButtons() {
  const newPromoBtns = document.querySelectorAll('#btn-new-promo-mobile, #btn-new-promo-desktop');

  newPromoBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      // Mostrar modal de creación de promoción
      modalManager.showCreatePromotion((newPromotion) => {
        // Si estamos en la vista de promociones, recargar para mostrar la nueva
        const currentHash = window.location.hash;
        if (currentHash === '#admin-promotions') {
          window.location.reload();
        }
      });
    });
  });
}


/**
 * Configura los botones de logout (cerrar sesión) para desktop y mobile.
 * Realiza logout vía API, limpia estado y recarga la navegación pública.
 * @param {HTMLElement} container - Contenedor de la vista
 * @param {HTMLElement} statusEl - Elemento para mostrar estados
 */
export function setupLogout(container, statusEl) {
  // Delegación de eventos: escuchar clicks en el documento
  if (window.__logoutDelegationBound) return;
  window.__logoutDelegationBound = true;

  document.addEventListener('click', async function(e) {
    // Captura clicks sobre el enlace o cualquier hijo (icono/span)
    const logoutLink = e.target.closest('#logout-btn-desktop, #logout-btn-mobile');
    if (logoutLink) {
      e.preventDefault();
      e.stopPropagation();

      console.log('[LOGOUT] 1. Click detectado, iniciando...');

      try {
        console.log('[LOGOUT] 2. Haciendo fetch...');

        const response = await fetch('./api/admin/logout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Accept': 'application/json' }
        });

        console.log('[LOGOUT] 3. Response status:', response.status);

        if (!response.ok) {
          throw new Error('Status: ' + response.status);
        }

        const data = await response.json();
        console.log('[LOGOUT] 4. Response data:', data);
        console.log('[LOGOUT] 5. Logout exitoso, esperando para recargar...');

        // Destruir gráfico si existe
        if (window.dailyChartInstance?.destroy) {
          try { window.dailyChartInstance.destroy(); } catch (_) {}
          window.dailyChartInstance = null;
        }

        // Esperar 500ms para que el navegador procese los headers Set-Cookie
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('[LOGOUT] 6. Recargando...');
        window.location.href = window.location.pathname + '#home';
        window.location.reload();

      } catch (err) {
        console.error('[LOGOUT] ERROR:', err);
        alert('Error al cerrar sesión: ' + err.message);
      }
    }
  });
}


/**
 * Inicializa la vista principal de administración.
 * Configura formularios, botones y modales necesarios para la gestión admin.
 * @param {HTMLElement} container - Contenedor de la vista
 */
export async function initAdminView(container) {
  const statusEl = container.querySelector('#product-create-status');
  // const promoSelect = container.querySelector('#promo_product_id'); // No usado actualmente

  // Configurar formularios y componentes admin
  setupPromotionCreateForm(container);
  setupLogout(container, statusEl);
  setupProfileModalComponent();
}
