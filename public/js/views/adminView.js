/**
 * adminView.js
 * Vista principal de administración - Refactorizada siguiendo principios SOLID y MVC
 *
 * RESPONSABILIDAD: Orquestación de la vista admin (controlador)
 * - Inicializa componentes
 * - Delega lógica de negocio a servicios
 * - Delega renderizado a componentes
 */

import { modalManager } from '../core/modalManager.js';
import { setStatus } from '../core/utils.js';

// Servicios
import { searchProductByCode } from '../admin/services/productService.js';

// Componentes
import { setupPromotionCreateForm } from '../admin/components/PromotionFormHandler.js';

/**
 * Muestra la ficha editable de un producto dado su código público
 * Usado por el flujo de escaneo QR en admin
 * @param {string} code - Código público del producto
 */
export async function editProductByCode(code) {
  // Buscar producto
  const product = await searchProductByCode(code);

  if (!product) {
    alert('No se encontró ningún producto con ese código.');
    return;
  }

  // Abrir directamente el modal de edición
  modalManager.showEditProduct(product, (updatedProduct) => {
    // Recargar la vista si es necesario
    console.log('Producto actualizado:', updatedProduct);
  });
}

/**
 * Configura los botones de "Nuevo Producto"
 */
export function setupNewProductButtons() {
  const newProductBtns = document.querySelectorAll('#btn-new-product-mobile, #btn-new-product-desktop');

  newProductBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      // Mostrar modal de creación de producto
      modalManager.showCreateProduct((newProduct) => {
        // Callback de éxito: recargar la lista de productos si estamos en esa vista
        const currentHash = window.location.hash;
        if (currentHash === '#admin-products') {
          window.location.reload();
        }
      });
    });
  });
}

/**
 * Configura los botones de "Nueva Promoción" en el nav
 */
export function setupNewPromotionButtons() {
  const newPromoBtns = document.querySelectorAll('#btn-new-promo-mobile, #btn-new-promo-desktop');

  newPromoBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      // Mostrar modal de creación de promoción
      modalManager.showCreatePromotion((newPromotion) => {
        // Callback de éxito: recargar la lista de promociones si estamos en esa vista
        const currentHash = window.location.hash;
        if (currentHash === '#admin-promotions') {
          // Recargar la vista de promociones
          window.location.reload();
        }
      });
    });
  });
}

/**
 * Configura los botones de logout - FUNCIÓN ELIMINADA
 * @param {HTMLElement} container - Contenedor de la vista
 * @param {HTMLElement} statusEl - Elemento para mostrar estados
 */
export function setupLogout(container, statusEl) {
  // FUNCIÓN ELIMINADA - Ya no se requiere autenticación
}

/**
 * Inicializa la vista de administración
 * @param {HTMLElement} container - Contenedor de la vista
 */
export async function initAdminView(container) {
  const statusEl = container.querySelector('#product-create-status');
  const promoSelect = container.querySelector('#promo_product_id');

  // Configurar formularios usando componentes
  setupPromotionCreateForm(container);
  setupLogout(container, statusEl);
}
