/**
 * adminProductsView.js
 * Vista de gestión de productos - Refactorizada siguiendo principios SOLID y MVC
 *
 * RESPONSABILIDAD: Controlador de vista de productos
 * - Renderiza tabla de productos
 * - Maneja paginación
 * - Delega operaciones CRUD a servicios
 */

import { getProducts, deleteProduct } from '../admin/services/productService.js';
import { getPromotions, deletePromotion, togglePromotionStatus } from '../admin/services/promotionService.js';
import { showToast } from '../admin/components/Toast.js';
import { modalManager } from '../core/modalManager.js';
import { renderAdminProductCard } from './adminProductCard.js';
import { setupProductEditForm } from '../admin/components/ProductFormHandler.js';
import { setupPromotionCreateForm } from '../admin/components/PromotionFormHandler.js';

/**
 * Inicializa la vista de gestión de productos
 * @param {HTMLElement} container - Contenedor de la vista
 */
export async function initAdminProductsView(container) {
  // Renderizar estructura de la tabla
  container.innerHTML = `
    <div class="table-responsive d-none d-md-block admin-table-wrapper">
      <table class="table table-bordered align-middle shadow" id="admin-products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Bodega</th>
            <th>Precio</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody><tr><td colspan='8'>Cargando...</td></tr></tbody>
      </table>
    </div>
    <div class="d-flex justify-content-center align-items-center mt-2">
      <button class="btn btn-secondary btn-sm mx-1" id="admin-products-prev" disabled>Anterior</button>
      <span id="admin-products-page" class="mx-2"></span>
      <button class="btn btn-secondary btn-sm mx-1" id="admin-products-next" disabled>Siguiente</button>
    </div>
  `;

  const tableBody = container.querySelector('#admin-products-table tbody');
  const paginationEl = container.querySelector('#admin-products-page');
  const prevBtn = container.querySelector('#admin-products-prev');
  const nextBtn = container.querySelector('#admin-products-next');

  const PAGE_SIZE = 20;
  let currentPage = 0;
  let totalProducts = 0;
  let cachedProducts = [];

  /**
   * Scroll automático a la paginación
   */
  function scrollToPagination() {
    const pagDiv = container.querySelector('.d-flex.justify-content-center.align-items-center.mt-2');
    if (pagDiv) {
      pagDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Actualiza los controles de paginación
   */
  function updatePagination(page, total) {
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    paginationEl.textContent = `Página ${page + 1} de ${totalPages}`;
    prevBtn.disabled = page <= 0;
    nextBtn.disabled = page >= totalPages - 1;
  }

  /**
   * Renderiza las filas de la tabla
   */
  function renderRows(products) {
    let rows = products.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.public_code}</td>
        <td>${p.name}</td>
        <td>${p.drink_type}</td>
        <td>${p.winery_distillery}</td>
        <td>${p.base_price.toFixed(2)}</td>
        <td>${p.is_active ? 'Sí' : 'No'}</td>
        <td>
          <button class="btn btn-xs btn-primary btn-admin-action px-2 py-1" data-edit-product="${p.id}">Editar</button>
          <button class="btn btn-xs btn-info ms-1 btn-admin-action px-2 py-1" data-view-product="${p.id}">Ver</button>
          <button class="btn btn-xs btn-danger ms-1 btn-admin-action px-2 py-1" data-delete-product="${p.id}">Borrar</button>
          <button class="btn btn-xs btn-success ms-1 btn-admin-action px-2 py-1" data-new-promo="${p.id}">Nueva Promoción</button>
        </td>
      </tr>
    `);

    // Rellenar con filas vacías
    for (let i = products.length; i < PAGE_SIZE; i++) {
      rows.push('<tr>' + '<td>&nbsp;</td>'.repeat(8) + '</tr>');
    }

    return rows.join('');
  }

  /**
   * Adjunta event listeners a los botones de acciones
   */
  function attachActionListeners() {
    // Ver producto
    tableBody.querySelectorAll('[data-view-product]').forEach(btn => {
      btn.onclick = () => {
        const productId = btn.getAttribute('data-view-product');
        const product = cachedProducts.find(p => String(p.id) === String(productId));
        if (product) {
          modalManager.showProduct(product);
        }
      };
    });

    // Editar producto
    tableBody.querySelectorAll('[data-edit-product]').forEach(btn => {
      btn.onclick = async () => {
        const productId = btn.getAttribute('data-edit-product');
        const product = cachedProducts.find(p => String(p.id) === String(productId));
        if (!product) {
          showToast('Producto no encontrado', 'error');
          return;
        }

        // Abrir modal con formulario de edición
        modalManager.open('admin-product-modal', renderAdminProductCard(product), {
          onOpen: (modal) => {
            const form = modal.querySelector('#admin-edit-product-form');
            if (form) {
              setupProductEditForm(form, product, () => {
                modalManager.close('admin-product-modal');
                loadProducts(currentPage);
              });
            }
          }
        });
      };
    });

    // Eliminar producto
    tableBody.querySelectorAll('[data-delete-product]').forEach(btn => {
      btn.onclick = async () => {
        const productId = btn.getAttribute('data-delete-product');
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
          await deleteProduct(productId);
          showToast('Producto eliminado con éxito', 'success');
          loadProducts(currentPage);
        } catch (err) {
          showToast(`Error al eliminar: ${err.message}`, 'error');
        }
      };
    });

    // Nueva promoción
    tableBody.querySelectorAll('[data-new-promo]').forEach(btn => {
      btn.onclick = async () => {
        const productId = btn.getAttribute('data-new-promo');
        const product = cachedProducts.find(p => String(p.id) === String(productId));
        if (!product) {
          showToast('Producto no encontrado', 'error');
          return;
        }

        await showNewPromoModal(productId, product.name);
      };
    });
  }

  /**
   * Carga productos de la página especificada
   */
  async function loadProducts(page = 0) {
    tableBody.innerHTML = `<tr><td colspan='8'>Cargando...</td></tr>`;

    try {
      const offset = page * PAGE_SIZE;
      const { products, total } = await getProducts({ limit: PAGE_SIZE, offset });

      totalProducts = total;
      cachedProducts = products;

      if (products.length === 0 && totalProducts === 0) {
        tableBody.innerHTML = `<tr><td colspan='8'>No hay productos para mostrar.</td></tr>`;
      } else {
        tableBody.innerHTML = renderRows(products);
        attachActionListeners();
      }

      updatePagination(page, totalProducts);
      scrollToPagination();

    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan='8'>Error al cargar productos</td></tr>`;
      showToast(`Error: ${err.message}`, 'error');
      updatePagination(page, totalProducts);
    }
  }

  /**
   * Muestra modal para crear nueva promoción
   */
  async function showNewPromoModal(productId, productName) {
    // Verificar si ya existe promoción activa
    let activePromo = null;
    try {
      const { promotions } = await getPromotions({ productId });
      activePromo = promotions.find(p => p.is_active);
    } catch (err) {
      // Continuar sin promoción activa
    }

    let modalContent = '';

    // Si hay promoción activa, mostrar alerta
    if (activePromo) {
      modalContent = `
        <div class="promo-active-alert">
          <div class="mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size:1.5rem;"></i>
            <span class="fw-bold" style="font-size:1.2rem;color:#7a003c;">Promoción activa</span>
          </div>
          <div class="mb-2" style="font-size:1.05rem;">
            <span class="fw-semibold">${activePromo.promotion_type.replace('_', ' ').toUpperCase()}</span>
            <span class="mx-2">|</span>
            <span class="fw-semibold">Valor:</span> <span>${activePromo.parameter_value}</span>
            <span class="mx-2">|</span>
            <span class="fw-semibold">Vigencia:</span> <span>${activePromo.start_at ? activePromo.start_at.split(' ')[0] : ''}${activePromo.end_at ? ' al ' + activePromo.end_at.split(' ')[0] : ''}</span>
          </div>
          <div class="mb-3 text-muted" style="font-size:0.97rem;">No puedes crear otra promoción hasta que la actual finalice o sea eliminada.</div>
          <div class="mb-2 fw-semibold" style="color:#7a003c;">¿Qué acción deseas realizar sobre la promoción?</div>
          <div class="d-flex gap-2 justify-content-start align-items-center mt-2">
            <button type="button" class="btn btn-outline-primary btn-xs fw-semibold px-2 py-1" style="font-size:0.92rem;" data-edit-promo="${activePromo.id}"><i class="bi bi-pencil-square me-1"></i>Editar</button>
            <button type="button" class="btn btn-outline-danger btn-xs fw-semibold px-2 py-1" style="font-size:0.92rem;" data-delete-promo="${activePromo.id}"><i class="bi bi-trash me-1"></i>Eliminar</button>
            <button type="button" class="btn btn-outline-secondary btn-xs fw-semibold px-2 py-1" style="font-size:0.92rem;" data-toggle-promo="${activePromo.id}"><i class="bi bi-power me-1"></i>Desactivar</button>
          </div>
        </div>
      `;
    } else {
      // Mostrar formulario de creación
      modalContent = `
        <div class='mb-2'><strong>Producto seleccionado:</strong> ${productName} (ID: ${productId})</div>
        <form id="promo-create-form-modal">
          <div class="mb-2">
            <label for="promo_type_modal" class="form-label">Tipo de promoción</label>
            <select id="promo_type_modal" class="form-select" required>
              <option value="">Selecciona tipo</option>
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="precio_fijo">Precio fijo</option>
              <option value="2x1">2x1</option>
              <option value="3x2">3x2</option>
              <option value="nxm">N x M</option>
            </select>
          </div>
          <div class="mb-2">
            <label for="promo_value_modal" class="form-label">Valor</label>
            <input type="number" id="promo_value_modal" class="form-control" required min="0" step="0.01">
          </div>
          <div class="mb-2">
            <label for="promo_text_modal" class="form-label">Texto visible</label>
            <input type="text" id="promo_text_modal" class="form-control" maxlength="100">
          </div>
          <div class="mb-2">
            <label for="promo_start_modal" class="form-label">Inicio</label>
            <input type="date" id="promo_start_modal" class="form-control" required>
          </div>
          <div class="mb-2">
            <label for="promo_end_modal" class="form-label">Fin</label>
            <input type="date" id="promo_end_modal" class="form-control">
          </div>
          <div id="promo-create-status-modal" class="mb-2"></div>
          <button type="submit" class="btn btn-success">Crear promoción</button>
        </form>
      `;
    }

    // Abrir modal
    modalManager.open('modal-new-promo', modalContent, {
      title: 'Nueva Promoción',
      onOpen: (modal) => {
        // Si hay promoción activa, configurar handlers
        if (activePromo) {
          const editBtn = modal.querySelector('[data-edit-promo]');
          const deleteBtn = modal.querySelector('[data-delete-promo]');
          const toggleBtn = modal.querySelector('[data-toggle-promo]');

          if (editBtn) {
            editBtn.onclick = () => {
              showToast('Editar promoción - Por implementar', 'info');
            };
          }

          if (deleteBtn) {
            deleteBtn.onclick = async () => {
              if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;

              try {
                await deletePromotion(activePromo.id);
                showToast('Promoción eliminada con éxito', 'success');
                modalManager.close('modal-new-promo');
              } catch (err) {
                showToast(`Error al eliminar: ${err.message}`, 'error');
              }
            };
          }

          if (toggleBtn) {
            toggleBtn.onclick = async () => {
              try {
                await togglePromotionStatus(activePromo.id, false);
                showToast('Promoción desactivada con éxito', 'success');
                modalManager.close('modal-new-promo');
              } catch (err) {
                showToast(`Error al desactivar: ${err.message}`, 'error');
              }
            };
          }
        } else {
          // Configurar formulario de creación
          const form = modal.querySelector('#promo-create-form-modal');

          // Crear input hidden de producto
          const productIdInput = document.createElement('input');
          productIdInput.type = 'hidden';
          productIdInput.id = 'promo_product_id_modal';
          productIdInput.value = productId;
          form.appendChild(productIdInput);

          if (form) {
            setupPromotionCreateForm(
              modal,
              productIdInput,
              () => {
                modalManager.close('modal-new-promo');
                loadProducts(currentPage);
              }
            );
          }
        }
      }
    });
  }

  // Event listeners de paginación
  prevBtn.onclick = () => {
    if (currentPage > 0) {
      currentPage--;
      loadProducts(currentPage);
    }
  };

  nextBtn.onclick = () => {
    const totalPages = Math.ceil(totalProducts / PAGE_SIZE) || 1;
    if (currentPage < totalPages - 1) {
      currentPage++;
      loadProducts(currentPage);
    }
  };

  // Inicializar carga
  loadProducts(0);
}
