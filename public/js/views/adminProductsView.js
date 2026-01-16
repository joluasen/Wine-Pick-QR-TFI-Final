/**
 * adminProductsView.js
 * Vista de gestión de productos - Refactorizada siguiendo principios SOLID y MVC
 *
 * RESPONSABILIDAD: Controlador de vista de productos
 * - Renderiza tabla de productos
 * - Maneja paginación
 * - Delega operaciones CRUD a servicios
 */

import { getProducts, deleteProduct as deleteProductService } from "../admin/services/productService.js";
import {
  getPromotions,
  deletePromotion,
  togglePromotionStatus,
} from "../admin/services/promotionService.js";
import { showToast, showToastSequence } from "../admin/components/Toast.js";
import { showConfirmDialog } from "../admin/components/ConfirmDialog.js";
import { modalManager } from "../core/modalManager.js";
import { setupPromotionCreateForm } from "../admin/components/PromotionFormHandler.js";

/**
 * Inicializa la vista de gestión de productos
 * @param {HTMLElement} _container - Contenedor (no usado, HTML está en adminProducts.php)
 */
export async function initAdminProductsView(_container) {
  // El HTML está en adminProducts.php, solo obtenemos referencias
  const loadingEl = document.getElementById("admin-products-loading");
  const contentEl = document.getElementById("admin-products-content");
  const tableBody = document.querySelector("#admin-products-table tbody");
  const cardsContainer = document.getElementById("admin-products-cards");
  const paginationEl = document.getElementById("admin-products-page");
  const prevBtn = document.getElementById("admin-products-prev");
  const nextBtn = document.getElementById("admin-products-next");

  const PAGE_SIZE = 20;
  let currentPage = 0;
  let totalProducts = 0;
  let cachedProducts = [];

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
    let rows = products.map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${p.public_code}</td>
        <td>${p.name}</td>
        <td>${p.drink_type}</td>
        <td>${p.winery_distillery}</td>
        <td>$${p.base_price.toFixed(2)}</td>
        <td>${p.is_active ? "Sí" : "No"}</td>
        <td>
          <button class="btn-table" data-edit-product="${p.id}">Editar</button>
          <button class="btn-table ms-1" data-view-product="${p.id}">Ver</button>
          <button class="btn-table ms-1" data-delete-product="${p.id}">Borrar</button>
          <button class="btn-table ms-1" data-new-promo="${p.id}">Nueva Promo</button>
        </td>
      </tr>
    `
    );

    // Rellenar con filas vacías
    for (let i = products.length; i < PAGE_SIZE; i++) {
      rows.push("<tr>" + "<td>&nbsp;</td>".repeat(8) + "</tr>");
    }

    return rows.join("");
  }

  /**
   * Renderiza las cards para vista mobile
   */
  function renderCards(products) {
    if (products.length === 0) {
      return '<div class="text-center py-4 text-muted">No hay productos para mostrar.</div>';
    }

    return products
      .map(
        (p) => `
      <div class="admin-product-card-mobile">
        <div class="card-mobile-header">
          <div style="flex: 1;">
            <div class="card-mobile-title">${p.name}</div>
            <div class="card-mobile-code">${p.public_code}</div>
          </div>
          <div class="card-mobile-status ${p.is_active ? "active" : ""}">
            ${p.is_active ? "Activo" : "Inactivo"}
          </div>
        </div>
        <div class="card-mobile-body">
          <div class="card-mobile-info">
            <span class="card-mobile-label">Tipo</span>
            <span class="card-mobile-value">${p.drink_type}</span>
          </div>
          <div class="card-mobile-info">
            <span class="card-mobile-label">Bodega</span>
            <span class="card-mobile-value">${p.winery_distillery}</span>
          </div>
          <div class="card-mobile-info">
            <span class="card-mobile-label">Precio</span>
            <span class="card-mobile-price">$${p.base_price.toFixed(2)}</span>
          </div>
        </div>
        <div class="card-mobile-actions">
          <button class="btn-table btn-mobile" data-edit-product="${p.id}">
            <i class="fas fa-edit"></i>
            <span>Editar</span>
          </button>
          <button class="btn-table btn-mobile" data-view-product="${p.id}">
            <i class="fas fa-eye"></i>
            <span>Ver</span>
          </button>
          <button class="btn-table btn-mobile" data-delete-product="${p.id}">
            <i class="fas fa-trash"></i>
            <span>Borrar</span>
          </button>
          <button class="btn-table btn-mobile" data-new-promo="${p.id}">
            <i class="fas fa-tag"></i>
            <span>Promo</span>
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  /**
   * Adjunta event listeners a los botones de acciones
   */
  function attachActionListeners() {
    // Obtener todos los botones tanto de tabla como de cards
    const allViewBtns = document.querySelectorAll("[data-view-product]");
    const allEditBtns = document.querySelectorAll("[data-edit-product]");
    const allDeleteBtns = document.querySelectorAll("[data-delete-product]");
    const allPromoBtns = document.querySelectorAll("[data-new-promo]");

    // Ver producto
    allViewBtns.forEach((btn) => {
      btn.onclick = () => {
        const productId = btn.getAttribute("data-view-product");
        const product = cachedProducts.find(
          (p) => String(p.id) === String(productId)
        );
        if (product) {
          modalManager.showProductAdmin(product);
        }
      };
    });

    // Editar producto
    allEditBtns.forEach((btn) => {
      btn.onclick = async () => {
        const productId = btn.getAttribute("data-edit-product");
        const product = cachedProducts.find(
          (p) => String(p.id) === String(productId)
        );
        if (!product) {
          showToast("Producto no encontrado", "error");
          return;
        }

        // Abrir modal de edición unificado
        modalManager.showEditProduct(product, () => {
          loadProducts(currentPage);
        });
      };
    });

    // Eliminar producto
    allDeleteBtns.forEach((btn) => {
      btn.onclick = async () => {
        const productId = btn.getAttribute("data-delete-product");
        const product = cachedProducts.find(
          (p) => String(p.id) === String(productId)
        );
        if (!product) {
          showToast("Producto no encontrado", "error");
          return;
        }

        // Confirmar eliminación con diálogo personalizado
        const confirmed = await showConfirmDialog({
          title: "Eliminar producto",
          message: `¿Estás seguro de que deseas eliminar "${product.name}"?`,
          confirmText: "Eliminar",
          cancelText: "Cancelar",
          confirmClass: "btn-danger",
        });

        if (!confirmed) {
          return;
        }

        try {
          // Mostrar toast de inicio
          const loadingToast = showToast("Eliminando producto...", "info", 0);
          
          // Llamar al servicio de eliminación
          await deleteProductService(productId);
          
          // Esperar un poco para que se vea el toast de carga
          await new Promise((resolve) => setTimeout(resolve, 800));
          
          // Remover toast de carga
          loadingToast.classList.remove('show');
          setTimeout(() => loadingToast.remove(), 300);
          
          // Mostrar toast de éxito
          showToast("Producto eliminado correctamente", "success");
          
          // Recargar lista
          loadProducts(currentPage);
        } catch (error) {
          showToast(`Error al eliminar: ${error.message}`, "error");
        }
      };
    });

    // Nueva promoción
    allPromoBtns.forEach((btn) => {
      btn.onclick = async () => {
        const productId = btn.getAttribute("data-new-promo");
        const product = cachedProducts.find(
          (p) => String(p.id) === String(productId)
        );
        if (!product) {
          showToast("Producto no encontrado", "error");
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
    // Mostrar loading, ocultar contenido
    loadingEl.style.display = "block";
    contentEl.style.display = "none";

    try {
      const offset = page * PAGE_SIZE;

      // Crear promesas para el fetch y el delay de 250 milisegundos
      const fetchPromise = getProducts({ limit: PAGE_SIZE, offset });
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 250));

      // Esperar ambas promesas
      const [{ products, total }] = await Promise.all([
        fetchPromise,
        delayPromise,
      ]);

      totalProducts = total;
      cachedProducts = products;

      if (products.length === 0 && totalProducts === 0) {
        tableBody.innerHTML = `<tr><td colspan='8'>No hay productos para mostrar.</td></tr>`;
        cardsContainer.innerHTML =
          '<div class="text-center py-4 text-muted">No hay productos para mostrar.</div>';
      } else {
        tableBody.innerHTML = renderRows(products);
        cardsContainer.innerHTML = renderCards(products);
        attachActionListeners();
      }

      updatePagination(page, totalProducts);

      // Ocultar loading, mostrar contenido
      loadingEl.style.display = "none";
      contentEl.style.display = "block";
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan='8'>Error al cargar productos</td></tr>`;
      showToast(`Error: ${err.message}`, "error");
      updatePagination(page, totalProducts);

      // Ocultar loading, mostrar contenido (incluso con error)
      loadingEl.style.display = "none";
      contentEl.style.display = "block";
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
      activePromo = promotions.find((p) => p.is_active);
    } catch (err) {
      // Continuar sin promoción activa
    }

    let modalContent = "";

    // Si hay promoción activa, mostrar alerta
    if (activePromo) {
      modalContent = `
        <div>
          <div class="promo-active-alert">
            <div class="mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size:1.5rem;"></i>
              <span class="fw-bold" style="font-size:1.2rem;color:#7a003c;">Promoción activa</span>
            </div>
            <div class="mb-2" style="font-size:1.05rem;">
              <span class="fw-semibold">${activePromo.promotion_type
                .replace("_", " ")
                .toUpperCase()}</span>
              <span class="mx-2">|</span>
              <span class="fw-semibold">Valor:</span> <span>${
                activePromo.parameter_value
              }</span>
              <span class="mx-2">|</span>
              <span class="fw-semibold">Vigencia:</span> <span>${
                activePromo.start_at ? activePromo.start_at.split(" ")[0] : ""
              }${
        activePromo.end_at ? " al " + activePromo.end_at.split(" ")[0] : ""
      }</span>
            </div>
            <div class="mb-3 text-muted" style="font-size:0.97rem;">No puedes crear otra promoción hasta que la actual finalice o sea eliminada.</div>
            <div class="mb-2 fw-semibold" style="color:#7a003c;">¿Qué acción deseas realizar sobre la promoción?</div>
            <div class="d-flex gap-2 justify-content-start align-items-center mt-2">
              <button type="button" class="btn-modal btn-modal-primary btn-xs fw-semibold px-2 py-1" style="font-size:0.92rem;" data-edit-promo="${
                activePromo.id
              }"><i class="bi bi-pencil-square me-1"></i>Editar</button>
              <button type="button" class="btn-modal btn-modal-danger btn-xs fw-semibold px-2 py-1" style="font-size:0.92rem;" data-delete-promo="${
                activePromo.id
              }"><i class="bi bi-trash me-1"></i>Eliminar</button>
              <button type="button" class="btn-modal btn-xs fw-semibold px-2 py-1" style="font-size:0.92rem;" data-toggle-promo="${
                activePromo.id
              }"><i class="bi bi-power me-1"></i>Desactivar</button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Mostrar formulario de creación
      modalContent = `
        <div>
          <div class="alert alert-info mb-3">
            <strong>Producto seleccionado:</strong> ${productName}
          </div>
          <form id="promo-create-form-modal">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="promo_type_modal" class="form-label fw-semibold">Tipo de promoción <span class="text-danger">*</span></label>
                <select id="promo_type_modal" class="form-select" required>
                  <option value="">Selecciona tipo</option>
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="precio_fijo">Precio fijo</option>
                  <option value="2x1">2x1</option>
                  <option value="3x2">3x2</option>
                  <option value="nxm">N x M</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="promo_value_modal" class="form-label fw-semibold">Valor <span class="text-danger">*</span></label>
                <input type="number" id="promo_value_modal" class="form-control" required min="0" step="0.01" placeholder="Ej: 15">
              </div>
            </div>

            <div class="row g-3 mt-2">
              <div class="col-12">
                <label for="promo_text_modal" class="form-label fw-semibold">Texto visible</label>
                <input type="text" id="promo_text_modal" class="form-control" maxlength="100" placeholder="Ej: Oferta especial">
                <div class="form-text">Máximo 100 caracteres</div>
              </div>
            </div>

            <div class="row g-3 mt-2">
              <div class="col-md-6">
                <label for="promo_start_modal" class="form-label fw-semibold">Fecha de inicio <span class="text-danger">*</span></label>
                <input type="date" id="promo_start_modal" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label for="promo_end_modal" class="form-label fw-semibold">Fecha de fin</label>
                <input type="date" id="promo_end_modal" class="form-control">
              </div>
            </div>

            <div id="promo-create-status-modal" class="mt-3"></div>

            <div class="d-flex gap-2 justify-content-end mt-4">
              <button type="button" class="btn-modal" data-dismiss-modal>Cancelar</button>
              <button type="submit" class="btn-modal btn-modal-success">
                <i class="bi bi-plus-circle me-1"></i>
                Crear promoción
              </button>
            </div>
          </form>
        </div>
      `;
    }

    // Abrir modal
    modalManager.open("modal-new-promo", modalContent, {
      title: "Nueva Promoción",
      onOpen: (modal) => {
        // Configurar botón cancelar
        const cancelBtn = modal.querySelector("[data-dismiss-modal]");
        if (cancelBtn) {
          cancelBtn.onclick = () => modalManager.close("modal-new-promo");
        }

        // Si hay promoción activa, configurar handlers
        if (activePromo) {
          const editBtn = modal.querySelector("[data-edit-promo]");
          const deleteBtn = modal.querySelector("[data-delete-promo]");
          const toggleBtn = modal.querySelector("[data-toggle-promo]");

          if (editBtn) {
            editBtn.onclick = () => {
              showToast("Editar promoción - Por implementar", "info");
            };
          }

          if (deleteBtn) {
            deleteBtn.onclick = async () => {
              if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;

              try {
                await deletePromotion(activePromo.id);
                showToast("Promoción eliminada con éxito", "success");
                modalManager.close("modal-new-promo");
              } catch (err) {
                showToast(`Error al eliminar: ${err.message}`, "error");
              }
            };
          }

          if (toggleBtn) {
            toggleBtn.onclick = async () => {
              try {
                await togglePromotionStatus(activePromo.id, false);
                showToast("Promoción desactivada con éxito", "success");
                modalManager.close("modal-new-promo");
              } catch (err) {
                showToast(`Error al desactivar: ${err.message}`, "error");
              }
            };
          }
        } else {
          // Configurar formulario de creación
          const form = modal.querySelector("#promo-create-form-modal");

          // Crear input hidden de producto
          const productIdInput = document.createElement("input");
          productIdInput.type = "hidden";
          productIdInput.id = "promo_product_id_modal";
          productIdInput.value = productId;
          form.appendChild(productIdInput);

          if (form) {
            setupPromotionCreateForm(modal, productIdInput, () => {
              modalManager.close("modal-new-promo");
              loadProducts(currentPage);
            });
          }
        }
      },
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
