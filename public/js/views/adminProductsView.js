
/**
 * adminProductsView.js
 *
 * Vista de gestión de productos para el panel de administración.
 *
 * Orquesta la carga, renderizado y acciones CRUD sobre productos, tanto en tabla (desktop)
 * como en cards (mobile), delegando operaciones a servicios y componentes.
 *
 * Principales responsabilidades:
 * - Renderizar tabla y cards de productos
 * - Manejar paginación y estado de carga
 * - Delegar operaciones CRUD a servicios
 * - Adjuntar listeners para ver, editar y eliminar
 */

import { getProducts, deleteProduct as deleteProductService } from "../admin/services/productService.js";
import { showToast, showToastSequence } from "../admin/components/Toast.js";
import { showConfirmDialog } from "../admin/components/ConfirmDialog.js";
import { modalManager } from "../core/modalManager.js";
import { getActivePromotionByProduct } from "../admin/services/getActivePromotionByProduct.js";

/**
 * Inicializa la vista de gestión de productos.
 * Configura listeners, renderiza tabla/cards y maneja paginación y acciones CRUD.
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
   * Actualiza los controles de paginación (número de página y botones).
   * @param {number} page - Página actual (base 0)
   * @param {number} total - Total de productos
   */
  function updatePagination(page, total) {
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    paginationEl.textContent = `${page + 1} de ${totalPages}`;
    prevBtn.disabled = page <= 0;
    nextBtn.disabled = page >= totalPages - 1;
  }

  /**
   * Renderiza las filas de la tabla de productos (modo desktop).
   * @param {Array} products - Lista de productos
   * @returns {string} HTML de filas
   */
  function renderRows(products) {
    let rows = products.map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${p.public_code}</td>
        <td class="cell-truncate" title="${p.name}">${p.name}</td>
        <td class="col-secondary">${p.drink_type}</td>
        <td class="col-secondary cell-truncate" title="${p.winery_distillery}">${p.winery_distillery}</td>
        <td>$${p.base_price.toFixed(2)}</td>
        <td>
          <button class="btn-table" data-edit-product="${p.id}">Editar</button>
          <button class="btn-table ms-1" data-view-product="${p.id}">Ver</button>
          <button class="btn-table ms-1" data-delete-product="${p.id}">Borrar</button>
        </td>
      </tr>
    `
    );

    // Rellenar con filas vacías
    for (let i = products.length; i < PAGE_SIZE; i++) {
      rows.push("<tr>" + "<td>&nbsp;</td>".repeat(7) + "</tr>");
    }

    return rows.join("");
  }

  /**
   * Renderiza las cards de productos para la vista mobile.
   * @param {Array} products - Lista de productos
   * @returns {string} HTML de cards
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
        </div>
      </div>
    `
      )
      .join("");
  }

  /**
   * Adjunta event listeners a los botones de acciones (ver, editar, eliminar).
   * Utiliza el cache de productos para encontrar el producto correspondiente.
   */
  function attachActionListeners() {
    // Obtener todos los botones tanto de tabla como de cards
    const allViewBtns = document.querySelectorAll("[data-view-product]");
    const allEditBtns = document.querySelectorAll("[data-edit-product]");
    const allDeleteBtns = document.querySelectorAll("[data-delete-product]");

    // Ver producto
    allViewBtns.forEach((btn) => {
      btn.onclick = async () => {
        const productId = btn.getAttribute("data-view-product");
        const product = cachedProducts.find(
          (p) => String(p.id) === String(productId)
        );
        if (product) {
          btn.setAttribute('aria-busy', 'true');
          const promo = await getActivePromotionByProduct(product.id);
          if (promo) product.promotion = promo;
          btn.setAttribute('aria-busy', 'false');
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
  }

  /**
   * Carga productos de la página especificada desde el servicio.
   * Renderiza tabla/cards, actualiza paginación y maneja estados vacíos y errores.
   * @param {number} page - Página a cargar (base 0)
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
