/**
 * adminView.js
 * Vista principal de administración - Refactorizada siguiendo principios SOLID y MVC
 *
 * RESPONSABILIDAD: Orquestación de la vista admin (controlador)
 * - Inicializa componentes
 * - Delega lógica de negocio a servicios
 * - Delega renderizado a componentes
 */

import { renderAdminProductCard } from './adminProductCard.js';
import { renderAdminProductModalView } from './adminProductModalView.js';
import { modalManager } from '../core/modalManager.js';
import { setStatus } from '../core/utils.js';

// Servicios
import { checkAuth, logout, redirectToLogin, redirectToHome } from '../admin/services/authService.js';
import { searchProductByCode } from '../admin/services/productService.js';

// Componentes
import { setupProductCreateForm, setupProductEditForm } from '../admin/components/ProductFormHandler.js';
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
    modalManager.open('admin-product-modal', `
      <div class="admin-product-card-error">
        <h2>Producto no encontrado</h2>
        <p>No se encontró ningún producto con ese código. Intenta con otro código o revisa la conexión.</p>
        <button type="button" class="modal-close" aria-label="Cerrar" onclick="document.querySelector('.modal-close').click()">Cerrar</button>
      </div>
    `);
    return;
  }

  // Mostrar ficha pública con botón Editar
  modalManager.open('admin-product-modal', renderAdminProductModalView(product), {
    onOpen: (modal) => {
      const editBtn = modal.querySelector('#admin-edit-product-btn');
      if (editBtn) {
        editBtn.onclick = () => {
          // Reemplazar contenido por formulario de edición
          modal.querySelector('.modal-body').innerHTML = renderAdminProductCard(product);
          const form = modal.querySelector('#admin-edit-product-form');
          if (form) {
            setupProductEditForm(form, product);
          }
        };
      }
    }
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
