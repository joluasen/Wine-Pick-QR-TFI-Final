/**
 * homeView.js
 *
 * Vista de inicio del catálogo público.
 *
 * Muestra los productos más buscados con paginación, renderiza tarjetas de producto,
 * gestiona el estado de carga y UX accesible, y permite ver detalles de productos destacados.
 *
 * Funcionalidades principales:
 * - Renderizado de tarjetas de productos destacados
 * - Paginación dinámica
 * - Manejo de precios promocionales y badges
 * - Accesibilidad (teclado, roles, focus)
 * - Feedback visual y estados vacíos
 */

import {
  setStatus,
  calculatePromoPrice,
  fetchJSON,
  escapeHtml,
} from "../core/utils.js";
import { modalManager } from "../core/modalManager.js";

const PAGE_SIZE = 20;

/**
 * Renderiza todas las tarjetas de productos en el contenedor dado.
 * @param {HTMLElement} container - Contenedor donde se insertan las tarjetas
 * @param {Array} products - Lista de productos a mostrar
 */
function renderProducts(container, products) {
  if (!container) return;

  const grid = document.createElement("div");
  grid.className = "product-grid";

  products.forEach((product) => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(grid);
}

/**
 * Crea una tarjeta de producto destacada con toda la información relevante y UX accesible.
 * @param {Object} product - Objeto producto
 * @returns {HTMLElement} - Elemento de la tarjeta
 */
function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.setAttribute("role", "button"); // Accesibilidad: permite foco y click
  card.setAttribute("tabindex", "0");

  const basePrice = parseFloat(product.base_price);
  const priceData = calculatePromoPrice(product);

  // Generar badge y texto de promoción según el tipo de promo
  let badge = "";
  let priceHtml = "";
  let savingsText = "";

  if (priceData.hasPromo) {
    switch (priceData.type) {
      case "porcentaje":
        badge = `<span class="badge badge-discount">${priceData.discount}% OFF</span>`;
        priceHtml = `
          <span class="price-original">$${basePrice.toFixed(2)}</span>
          <span class="price-final">$${priceData.final.toFixed(2)}</span>
        `;
        savingsText = `Ahorrás $${priceData.savings.toFixed(2)}`;
        break;
      case "precio_fijo":
        badge = `<span class="badge badge-offer">OFERTA</span>`;
        priceHtml = `
          <span class="price-original">$${basePrice.toFixed(2)}</span>
          <span class="price-final">$${priceData.final.toFixed(2)}</span>
        `;
        savingsText = `Ahorrás $${priceData.savings.toFixed(2)}`;
        break;
      case "2x1":
        badge = `<span class="badge badge-combo">2x1</span>`;
        priceHtml = `<span class="price-final">$${basePrice.toFixed(2)}</span>`;
        savingsText = `Precio efectivo: $${priceData.final.toFixed(2)} c/u`;
        break;
      case "3x2":
        badge = `<span class="badge badge-combo">3x2</span>`;
        priceHtml = `<span class="price-final">$${basePrice.toFixed(2)}</span>`;
        savingsText = `Pagás solo 2 unidades`;
        break;
      case "nxm":
        badge = `<span class="badge badge-combo">COMBO</span>`;
        priceHtml = `<span class="price-final">$${priceData.final.toFixed(2)}</span>`;
        savingsText = `${escapeHtml(priceData.customText) || "Consultá condiciones"}`;
        break;
    }
  } else {
    priceHtml = `<span class="price-final">$${priceData.final.toFixed(2)}</span>`;
  }

  const badgeBlock = badge;
  const savingsBlock = `<p class="savings">${savingsText || "&nbsp;"}</p>`;

  const imageUrl = product.image_url || "";

  card.innerHTML = `
    <div class="card-image">
      ${
        imageUrl
          ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>`
          : ""
      }
      <div class="card-image-placeholder" style="${imageUrl ? "display: none;" : "display: flex;"}">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>
      ${badgeBlock}
    </div>
    <div class="card-header">
      <h3 class="card-title">${escapeHtml(product.name) || "Producto"}</h3>
    </div>
    <div class="card-body">
      <p class="winery"><strong>Bodega:</strong> ${escapeHtml(product.winery_distillery) || "—"}</p>
      <div class="price-container">
        ${priceHtml}
      </div>
      ${savingsBlock}
    </div>
    <div class="card-footer">
      <span class="code">Cód: ${escapeHtml(product.public_code)}</span>
    </div>
  `;

  // UX: Permite abrir el modal de producto con click o teclado
  card.addEventListener("click", () => {
    import("../core/utils.js").then(({ registerMetric }) => {
      registerMetric(product.id, "BUSQUEDA");
      modalManager.showProduct(product, null);
    });
  });
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      import("../core/utils.js").then(({ registerMetric }) => {
        registerMetric(product.id, "BUSQUEDA");
        modalManager.showProduct(product, null);
      });
    }
  });

  return card;
}

/**
 * Renderiza los controles de paginación para la vista de inicio.
 * @param {HTMLElement} container - Contenedor principal
 * @param {number} currentPage - Página actual (base 0)
 * @param {boolean} hasMore - Si hay más páginas siguientes
 * @param {function} onPageChange - Callback para cambiar de página
 * @param {number|null} totalPages - Total de páginas (opcional)
 * @param {number} totalProducts - Total de productos (para ocultar paginación si es <= 20)
 */
function renderPagination(
  container,
  currentPage,
  hasMore,
  onPageChange,
  totalPages = null,
  totalProducts = 0,
) {
  const paginationEl = container.querySelector("#home-pagination");
  if (!paginationEl) return;

  // Ocultar paginación si el total de productos es <= 20
  if (totalProducts <= 20 && totalProducts > 0) {
    paginationEl.innerHTML = "";
    return;
  }

  paginationEl.innerHTML = "";

  const controls = document.createElement("div");
  controls.className = "pagination-controls";

  // Botón anterior: siempre visible, deshabilitado en la primera página
  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "btn-pagination";
  prevBtn.innerHTML = "← Anterior";
  if (currentPage === 0) {
    prevBtn.disabled = true;
  } else {
    prevBtn.addEventListener("click", () => onPageChange(currentPage - 1));
  }
  controls.appendChild(prevBtn);

  // Indicador de página actual y total
  const pageInfo = document.createElement("span");
  pageInfo.className = "page-info";
  if (totalPages && totalPages > 0) {
    pageInfo.textContent = `${currentPage + 1} de ${totalPages}`;
  } else {
    pageInfo.textContent = `${currentPage + 1}`;
  }
  controls.appendChild(pageInfo);

  // Botón siguiente: siempre visible, pero deshabilitado si no hay más productos
  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "btn-pagination";
  nextBtn.innerHTML = "Siguiente →";
  if (!hasMore) {
    nextBtn.disabled = true;
  } else {
    nextBtn.addEventListener("click", () => onPageChange(currentPage + 1));
  }
  controls.appendChild(nextBtn);

  paginationEl.appendChild(controls);
}

/**
 * Carga y renderiza una página de productos destacados desde la API pública.
 * Muestra estados de carga, vacíos y errores.
 * @param {HTMLElement} container - Contenedor principal de la vista
 * @param {number} page - Número de página (base 0)
 */
async function loadPage(container, page = 0) {
  const statusEl = container.querySelector("#home-status");
  const resultsEl = container.querySelector("#home-results");

  setStatus(statusEl, "Cargando productos destacados...", "info");
  if (resultsEl) resultsEl.innerHTML = "";

  try {
    // Si tenemos el total de productos, limitamos la página máxima
    let maxPage = null;
    let totalItems = null;
    let totalPages = null;
    // Primer fetch para obtener el total si es necesario
    if (page > 0) {
      const dataTotal = await fetchJSON(
        `./api/public/mas-buscados?limit=1&offset=0`,
      );
      totalItems = dataTotal?.data?.total ?? null;
      if (totalItems) {
        totalPages = Math.ceil(totalItems / PAGE_SIZE);
        maxPage = totalPages - 1;
        if (page > maxPage) page = maxPage;
      }
    }

    const offset = page * PAGE_SIZE;
    const data = await fetchJSON(
      `./api/public/mas-buscados?limit=${PAGE_SIZE}&offset=${offset}`,
    );

    const products = data?.data?.products || [];
    // Intentar obtener el total de productos si la API lo provee
    if (totalItems === null) totalItems = data?.data?.total ?? null;
    if (totalPages === null && totalItems)
      totalPages = Math.ceil(totalItems / PAGE_SIZE);

    // Estado vacío: sin productos en la primera página
    if (products.length === 0 && page === 0) {
      setStatus(statusEl, "No hay productos para mostrar aún.", "info");
      if (resultsEl) {
        resultsEl.innerHTML =
          '<p class="empty-state">Vuelve más tarde cuando crezca nuestro catálogo.</p>';
      }
      return;
    }

    // Estado vacío: sin más productos en páginas siguientes
    if (products.length === 0) {
      setStatus(statusEl, "No hay más productos.", "info");
      renderPagination(
        container,
        page,
        false,
        (p) => loadPage(container, p),
        totalPages,
        totalItems,
      );
      return;
    }

    // Mostrar rango de productos actuales
    const from = page * PAGE_SIZE + 1;
    const to = from + products.length - 1;
    setStatus(statusEl, `Mostrando productos ${from} al ${to}`, "success");

    // Calcular total real: si es primera página y hay < 20, ese es el total. Si no, usar el que viene de la API
    const estimatedTotal =
      page === 0 && products.length < PAGE_SIZE ? products.length : totalItems;
    renderProducts(resultsEl, products);
    // Calcular hasMore correctamente usando totalPages si está disponible
    let hasMore = false;
    if (totalPages && totalPages > 0) {
      hasMore = page < totalPages - 1;
    } else {
      hasMore = products.length === PAGE_SIZE;
    }
    renderPagination(
      container,
      page,
      hasMore,
      (p) => loadPage(container, p),
      totalPages,
      estimatedTotal,
    );
  } catch (err) {
    console.error("Error cargando productos:", err);
    setStatus(statusEl, `Error: ${err.message}`, "error");
  }
}

/**
 * Inicializa la vista de inicio del catálogo público.
 * Carga la primera página de productos destacados.
 * @param {HTMLElement} container - Contenedor principal de la vista
 */
export function initHomeView(container) {
  loadPage(container, 0);
}
