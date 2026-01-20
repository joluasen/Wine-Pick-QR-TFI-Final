/**
 * adminPromotionsView.js
 * Vista de gestión de promociones - Refactorizada siguiendo principios SOLID y MVC
 *
 * RESPONSABILIDAD: Controlador de vista de promociones
 * - Renderiza tabla de promociones
 * - Maneja paginación
 * - Delega operaciones CRUD a servicios
 */

import {
  getPromotions,
  deletePromotion,
} from "../admin/services/promotionService.js";
import { showToast } from "../admin/components/Toast.js";
import { showConfirmDialog } from "../admin/components/ConfirmDialog.js";
import { modalManager } from "../core/modalManager.js";

/**
 * Inicializa la vista de gestión de promociones
 * @param {HTMLElement} container - Contenedor de la vista
 */
export async function initAdminPromotionsView(container) {
  // El HTML está en adminPromotions.php, solo obtenemos referencias a los elementos existentes
  const loadingEl = container.querySelector("#admin-promos-loading");
  const contentEl = container.querySelector("#admin-promos-content");
  const tableBody = container.querySelector("#admin-promos-table tbody");
  const cardsContainer = container.querySelector("#admin-promos-cards");
  const paginationEl = container.querySelector("#admin-promos-page");
  const prevBtn = container.querySelector("#admin-promos-prev");
  const nextBtn = container.querySelector("#admin-promos-next");

  const PAGE_SIZE = 20;
  let currentPage = 0;
  let totalPromos = 0;

  function showLoading() {
    if (loadingEl) loadingEl.style.display = "block";
    if (contentEl) contentEl.style.display = "none";
  }

  function showContent() {
    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.style.display = "block";
  }

  /**
   * Actualiza los controles de paginación
   */
  function updatePagination(page, total) {
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    paginationEl.textContent = `${page + 1} de ${totalPages}`;
    prevBtn.disabled = page <= 0;
    nextBtn.disabled = page >= totalPages - 1;
  }

  /**
   * Renderiza las filas de la tabla
   */
  function renderRows(promos) {
    let rows = promos.map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${p.product_name || ""}</td>
        <td>${p.promotion_type}</td>
        <td>${p.parameter_value}</td>
        <td>${p.visible_text}</td>
        <td>${p.start_at ? p.start_at.split(" ")[0] : ""}</td>
        <td>${p.end_at ? p.end_at.split(" ")[0] : ""}</td>
        <td>${p.is_active ? "Activa" : "Inactiva"}</td>
        <td>
          <button class="btn-table" data-edit-promo="${p.id}">Editar</button>
          <button class="btn-table ms-1" data-delete-promo="${p.id}">Borrar</button>
        </td>
      </tr>
    `
    );

    // Rellenar con filas vacías
    for (let i = promos.length; i < PAGE_SIZE; i++) {
      rows.push("<tr>" + "<td>&nbsp;</td>".repeat(9) + "</tr>");
    }

    return rows.join("");
  }

  /**
   * Renderiza las cards para vista mobile
   */
  function renderCards(promos) {
    if (promos.length === 0) {
      return '<div class="text-center py-4 text-muted">No hay promociones para mostrar.</div>';
    }

    return promos
      .map(
        (p) => `
      <div class="admin-promo-card-mobile">
        <div class="card-mobile-header">
          <div style="flex: 1;">
            <div class="card-mobile-title">${p.product_name || "Sin producto"}</div>
            <div class="card-mobile-code">ID: ${p.id}</div>
          </div>
          <div class="card-mobile-status ${p.is_active ? "active" : ""}">
            ${p.is_active ? "Activa" : "Inactiva"}
          </div>
        </div>
        <div class="card-mobile-body">
          <div class="card-mobile-info">
            <span class="card-mobile-label">Tipo</span>
            <span class="card-mobile-value">${p.promotion_type}</span>
          </div>
          <div class="card-mobile-info">
            <span class="card-mobile-label">Valor</span>
            <span class="card-mobile-value">${p.parameter_value}</span>
          </div>
          <div class="card-mobile-info">
            <span class="card-mobile-label">Texto visible</span>
            <span class="card-mobile-value">${p.visible_text}</span>
          </div>
          <div class="card-mobile-info">
            <span class="card-mobile-label">Inicio</span>
            <span class="card-mobile-value">${p.start_at ? p.start_at.split(" ")[0] : "N/A"}</span>
          </div>
          <div class="card-mobile-info">
            <span class="card-mobile-label">Fin</span>
            <span class="card-mobile-value">${p.end_at ? p.end_at.split(" ")[0] : "N/A"}</span>
          </div>
        </div>
        <div class="card-mobile-actions">
          <button class="btn-table btn-mobile" data-edit-promo="${p.id}">
            <i class="fas fa-edit"></i>
            <span>Editar</span>
          </button>
          <button class="btn-table btn-mobile" data-delete-promo="${p.id}">
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
   * Adjunta event listeners a los botones de acciones
   */
  function attachActionListeners() {
    // Obtener todos los botones tanto de tabla como de cards
    const allEditBtns = container.querySelectorAll("[data-edit-promo]");
    const allDeleteBtns = container.querySelectorAll("[data-delete-promo]");

    // Editar
    allEditBtns.forEach((btn) => {
      btn.onclick = async () => {
        const promoId = btn.getAttribute("data-edit-promo");
        
        try {
          // Buscar la promoción en la lista actual
          const { promotions } = await getPromotions({
            limit: PAGE_SIZE,
            offset: currentPage * PAGE_SIZE,
          });
          
          const promotion = promotions.find(p => p.id == promoId);
          
          if (!promotion) {
            showToast("No se pudo cargar la promoción", "error");
            return;
          }
          
          // Abrir modal de edición
          modalManager.showEditPromotion(promotion, () => {
            // Recargar lista después de editar
            loadPromos(currentPage);
          });
          
        } catch (err) {
          showToast(`Error al cargar promoción: ${err.message}`, "error");
        }
      };
    });

    // Eliminar
    allDeleteBtns.forEach((btn) => {
      btn.onclick = async () => {
        const promoId = btn.getAttribute("data-delete-promo");
        
        // Confirmar eliminación con diálogo personalizado
        const confirmed = await showConfirmDialog({
          title: "Eliminar promoción",
          message: `¿Estás seguro de que deseas eliminar esta promoción?`,
          confirmText: "Eliminar",
          cancelText: "Cancelar",
          confirmClass: "btn-danger",
        });

        if (!confirmed) {
          return;
        }

        try {
          // Mostrar toast de inicio
          const loadingToast = showToast("Eliminando promoción...", "info", 0);
          
          // Llamar al servicio de eliminación
          await deletePromotion(promoId);
          
          // Esperar un poco para que se vea el toast de carga
          await new Promise((resolve) => setTimeout(resolve, 800));
          
          // Remover toast de carga
          loadingToast.classList.remove('show');
          setTimeout(() => loadingToast.remove(), 300);
          
          // Mostrar toast de éxito
          showToast("Promoción eliminada correctamente", "success");
          
          // Recargar lista
          loadPromos(currentPage);
        } catch (err) {
          showToast(`Error al eliminar: ${err.message}`, "error");
        }
      };
    });
  }

  /**
   * Carga promociones de la página especificada
   */
  async function loadPromos(page = 0) {
    showLoading();
    tableBody.innerHTML = `<tr><td colspan='9'>Cargando...</td></tr>`;

    try {
      const offset = page * PAGE_SIZE;
      
      // Crear promesas para el fetch y el delay de 250 milisegundos
      const fetchPromise = getPromotions({
        limit: PAGE_SIZE,
        offset,
      });
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 250));

      // Esperar ambas promesas
      const [{ promotions, total }] = await Promise.all([
        fetchPromise,
        delayPromise,
      ]);

      totalPromos = total;

      if (promotions.length === 0 && totalPromos === 0) {
        tableBody.innerHTML = `<tr><td colspan='9'>No hay promociones para mostrar.</td></tr>`;
        cardsContainer.innerHTML =
          '<div class="text-center py-4 text-muted">No hay promociones para mostrar.</div>';
      } else {
        tableBody.innerHTML = renderRows(promotions);
        cardsContainer.innerHTML = renderCards(promotions);
        attachActionListeners();
      }

      updatePagination(page, totalPromos);
      showContent();
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan='9'>Error al cargar promociones</td></tr>`;
      showToast(`Error: ${err.message}`, "error");
      updatePagination(page, totalPromos);
      showContent();
    }
  }

  // Event listeners de paginación
  prevBtn.onclick = () => {
    if (currentPage > 0) {
      currentPage--;
      loadPromos(currentPage);
    }
  };

  nextBtn.onclick = () => {
    const totalPages = Math.ceil(totalPromos / PAGE_SIZE) || 1;
    if (currentPage < totalPages - 1) {
      currentPage++;
      loadPromos(currentPage);
    }
  };

  // Inicializar carga
  loadPromos(0);
}
