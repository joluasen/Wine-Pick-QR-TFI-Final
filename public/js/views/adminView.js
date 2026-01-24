
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

  // Abrir directamente el modal de edición
  modalManager.showEditProduct(product, (updatedProduct) => {
    // Callback opcional: aquí se podría actualizar la UI tras editar
  });
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
  const btnDesktop = document.getElementById('logout-btn-desktop');
  const btnMobile = document.getElementById('logout-btn-mobile');

  // Lógica de logout: llamada a API, feedback y limpieza de estado
  const doLogout = async () => {
    try {
      await fetchJSON('./api/admin/logout', { method: 'POST' });
      setStatus(statusEl || document.createElement('div'), 'Sesión cerrada', 'success');
      // Forzar salida a Home
      window.location.hash = '#home';
      // Destruir instancia de gráfico si existe (prevención bug Chart.js)
      if (window.dailyChartInstance && typeof window.dailyChartInstance.destroy === 'function') {
        try { window.dailyChartInstance.destroy(); } catch (_) {}
        window.dailyChartInstance = null;
      }
      // Recargar navegación pública
      setTimeout(() => window.location.reload(), 200);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setStatus(statusEl || document.createElement('div'), 'Error al cerrar sesión', 'error');
    }
  };

  btnDesktop?.addEventListener('click', (e) => { e.preventDefault(); doLogout(); });
  btnMobile?.addEventListener('click', (e) => { e.preventDefault(); doLogout(); });
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
