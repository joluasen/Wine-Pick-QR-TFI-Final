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
  togglePromotionStatus,
} from "../admin/services/promotionService.js";
import { showToast } from "../admin/components/Toast.js";

/**
 * Inicializa la vista de gestión de promociones
 * @param {HTMLElement} container - Contenedor de la vista
 */
export async function initAdminPromotionsView(container) {
  // Renderizar estructura de la tabla
  container.innerHTML = `
    <div class="table-responsive d-none d-md-block admin-table-wrapper">
      <table class="table table-bordered align-middle shadow" id="admin-promos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Texto</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody><tr><td colspan='9'>Cargando...</td></tr></tbody>
      </table>
    </div>

    <!-- Cards Mobile -->
    <div class="d-md-none" id="admin-promos-cards">
      <!-- Cards inyectadas dinámicamente por JS -->
    </div>

    <div class="d-flex justify-content-center align-items-center mt-2">
      <button class="btn-modal btn-modal-secondary btn-sm mx-1" id="admin-promos-prev" disabled>Anterior</button>
      <span id="admin-promos-page" class="mx-2"></span>
      <button class="btn-modal btn-modal-secondary btn-sm mx-1" id="admin-promos-next" disabled>Siguiente</button>
    </div>
  `;

  const tableBody = container.querySelector("#admin-promos-table tbody");
  const cardsContainer = container.querySelector("#admin-promos-cards");
  const paginationEl = container.querySelector("#admin-promos-page");
  const prevBtn = container.querySelector("#admin-promos-prev");
  const nextBtn = container.querySelector("#admin-promos-next");

  const PAGE_SIZE = 20;
  let currentPage = 0;
  let totalPromos = 0;

  /**
   * Scroll automático a la paginación
   */
  function scrollToPagination() {
    const pagDiv = container.querySelector(
      ".d-flex.justify-content-center.align-items-center.mt-2"
    );
    if (pagDiv) {
      pagDiv.scrollIntoView({ behavior: "smooth", block: "center" });
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
          <button class="btn-table ms-1" data-toggle-promo="${p.id}" data-is-active="${p.is_active}">
            ${p.is_active ? "Deshabilitar" : "Habilitar"}
          </button>
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
          <button class="btn-table btn-mobile" data-toggle-promo="${p.id}" data-is-active="${p.is_active}">
            <i class="fas fa-${p.is_active ? "toggle-off" : "toggle-on"}"></i>
            <span>${p.is_active ? "Deshabilitar" : "Habilitar"}</span>
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
    const allToggleBtns = container.querySelectorAll("[data-toggle-promo]");

    // Editar
    allEditBtns.forEach((btn) => {
      btn.onclick = async () => {
        const promoId = btn.getAttribute("data-edit-promo");
        // TODO: Implementar edición
        showToast(`Editar promoción ${promoId} - Por implementar`, "info");
      };
    });

    // Eliminar
    allDeleteBtns.forEach((btn) => {
      btn.onclick = async () => {
        const promoId = btn.getAttribute("data-delete-promo");
        if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;

        try {
          await deletePromotion(promoId);
          showToast("Promoción eliminada con éxito", "success");
          loadPromos(currentPage);
        } catch (err) {
          showToast(`Error al eliminar: ${err.message}`, "error");
        }
      };
    });

    // Activar/Desactivar
    allToggleBtns.forEach((btn) => {
      btn.onclick = async () => {
        const promoId = btn.getAttribute("data-toggle-promo");
        const isActive = btn.getAttribute("data-is-active") === "true";

        try {
          await togglePromotionStatus(promoId, !isActive);
          showToast(
            `Promoción ${!isActive ? "activada" : "desactivada"} con éxito`,
            "success"
          );
          loadPromos(currentPage);
        } catch (err) {
          showToast(`Error al cambiar estado: ${err.message}`, "error");
        }
      };
    });
  }

  /**
   * Carga promociones de la página especificada
   */
  async function loadPromos(page = 0) {
    tableBody.innerHTML = `<tr><td colspan='9'>Cargando...</td></tr>`;

    try {
      const offset = page * PAGE_SIZE;
      const { promotions, total } = await getPromotions({
        limit: PAGE_SIZE,
        offset,
      });

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
      scrollToPagination();
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan='9'>Error al cargar promociones</td></tr>`;
      showToast(`Error: ${err.message}`, "error");
      updatePagination(page, totalPromos);
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
