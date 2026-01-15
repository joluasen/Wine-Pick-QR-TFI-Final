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
import { checkAuth, logout, redirectToLogin, redirectToHome } from '../admin/services/authService.js';
import { searchProductByCode } from '../admin/services/productService.js';

// Componentes
import { setupPromotionCreateForm, loadProductsIntoSelect } from '../admin/components/PromotionFormHandler.js';

/**
 * Muestra la ficha editable de un producto dado su código público
 * Usado por el flujo de escaneo QR en admin
 * @param {string} code - Código público del producto
 */
export async function editProductByCode(code) {
  // Verificar autenticación
  const isAuth = await checkAuth();
  if (!isAuth) {
    alert('Sesión expirada. Redirigiendo a login.');
    redirectToLogin();
    return;
  }

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

      // Verificar autenticación
      const isAuth = await checkAuth();
      if (!isAuth) {
        alert('Sesión expirada. Redirigiendo a login.');
        redirectToLogin();
        return;
      }

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
 * Configura los botones de logout
 * @param {HTMLElement} container - Contenedor de la vista
 * @param {HTMLElement} statusEl - Elemento para mostrar estados
 */
export function setupLogout(container, statusEl) {
  const logoutBtns = document.querySelectorAll('#logout-btn, #logout-btn-mobile, #logout-btn-desktop');

  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      await logout();
      setStatus(statusEl, 'Sesión cerrada. Redirigiendo...', 'info');

      setTimeout(redirectToHome, 300);
    });
  });
}

/**
 * Inicializa la vista de administración
 * @param {HTMLElement} container - Contenedor de la vista
 */
export async function initAdminView(container) {
  const statusEl = container.querySelector('#product-create-status');
  const promoSelect = container.querySelector('#promo_product_id');

  // Verificar autenticación
  const isAuth = await checkAuth();
  if (!isAuth) {
    setStatus(statusEl, 'No autenticado. Redirigiendo...', 'error');
    setTimeout(redirectToLogin, 400);
    return;
  }

  // Cargar productos para selector de promociones
  await loadProductsIntoSelect(promoSelect);

  // Configurar formularios usando componentes
  setupProductCreateForm(container);
  setupPromotionCreateForm(container, promoSelect);
  setupLogout(container, statusEl);
}
