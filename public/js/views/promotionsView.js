
// public/js/views/promotionsView.js
/**
 * Vista de promociones públicas
 *
 * Muestra productos con promociones vigentes, tarjetas interactivas y paginación.
 *
 * Funcionalidades principales:
 * - Renderizado de tarjetas de productos en promoción
 * - Paginación dinámica
 * - Manejo de estados de carga, vacío y error
 */

import { setStatus, calculatePromoPrice, fetchJSON, escapeHtml, formatDate, registerMetric } from '../core/utils.js';
import { modalManager } from '../core/modalManager.js';

const PAGE_SIZE = 20;

/**
 * Renderiza las tarjetas de productos con promoción
 * @param {HTMLElement} container - Contenedor donde se muestran las tarjetas
 * @param {Array} products - Lista de productos en promoción
 */
function renderPromotions(container, products) {
  if (!container) return;
  
  const grid = document.createElement('div');
  grid.className = 'product-grid';
  
  products.forEach(product => {
    const card = createPromoCard(product);
    grid.appendChild(card);
  });
  
  container.innerHTML = '';
  container.appendChild(grid);
}

/**
 * Crea una tarjeta de producto con promoción
 * @param {Object} product - Producto a mostrar
 * @returns {HTMLElement} - Elemento de la tarjeta
 */
function createPromoCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card promo-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  
  const basePrice = parseFloat(product.base_price);
  const priceData = calculatePromoPrice(product);
  
  let badge = '';
  let priceHtml = '';
  let savingsHtml = '';
  
  // Determinar el tipo de promoción y renderizar los elementos visuales
  switch (priceData.type) {
    case 'porcentaje':
      badge = `<span class="badge badge-discount">${priceData.discount}% OFF</span>`;
      priceHtml = `
        <span class="price-original">$${basePrice.toFixed(2)}</span>
        <span class="price-final">$${priceData.final.toFixed(2)}</span>
      `;
      savingsHtml = `<p class="savings">Ahorrás $${priceData.savings.toFixed(2)}</p>`;
      break;
    case 'precio_fijo':
      badge = `<span class="badge badge-offer">OFERTA</span>`;
      priceHtml = `
        <span class="price-original">$${basePrice.toFixed(2)}</span>
        <span class="price-final">$${priceData.final.toFixed(2)}</span>
      `;
      savingsHtml = `<p class="savings">Ahorrás $${priceData.savings.toFixed(2)}</p>`;
      break;
    case '2x1':
      badge = `<span class="badge badge-combo">2x1</span>`;
      priceHtml = `<span class="price-final">$${basePrice.toFixed(2)}</span>`;
      savingsHtml = `<p class="savings">Precio efectivo: $${priceData.final.toFixed(2)} c/u</p>`;
      break;
    case '3x2':
      badge = `<span class="badge badge-combo">3x2</span>`;
      priceHtml = `<span class="price-final">$${basePrice.toFixed(2)}</span>`;
      savingsHtml = `<p class="savings">Pagás solo 2 unidades</p>`;
      break;
    case 'nxm':
      badge = `<span class="badge badge-combo">COMBO</span>`;
      priceHtml = `<span class="price-final">$${priceData.final.toFixed(2)}</span>`;
      savingsHtml = `<p class="savings">${escapeHtml(priceData.customText) || 'Consultá condiciones'}</p>`;
      break;
    default:
      priceHtml = `<span class="price-final">$${priceData.final.toFixed(2)}</span>`;
  }
  
  const endDate = product.promotion?.end_at 
    ? formatDate(product.promotion.end_at) 
    : 'Sin vencimiento';
  
  const imageUrl = product.image_url || '';

  card.innerHTML = `
    <div class="card-image">
      ${imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
        : ''
      }
      <div class="card-image-placeholder" style="${imageUrl ? 'display: none;' : 'display: flex;'}">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>
    </div>
    <div class="card-header">
      ${badge}
      <h4 class="card-title">${escapeHtml(product.name) || 'Producto'}</h4>
    </div>
    <div class="card-body">
      <p><strong>Bodega:</strong> ${escapeHtml(product.winery_distillery) || '—'}</p>
      <div class="price-container">
        ${priceHtml}
      </div>
      ${savingsHtml}
      <p class="validity">Válido hasta: ${endDate}</p>
    </div>
    <div class="card-footer">
      <span class="code">Cód: ${escapeHtml(product.public_code)}</span>
    </div>
  `;
  
  // Accesibilidad: click y enter/espacio abren el modal del producto
  card.addEventListener('click', () => {
    registerMetric(product.id, 'BUSQUEDA');
    modalManager.showProduct(product, null);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      registerMetric(product.id, 'BUSQUEDA');
      modalManager.showProduct(product, null);
    }
  });
  
  return card;
}

/**
 * Renderiza los controles de paginación
 * @param {HTMLElement} container - Contenedor principal
 * @param {number} currentPage - Página actual
 * @param {boolean} hasMore - Si hay más páginas
 * @param {function} onPageChange - Callback para cambiar de página
 */
function renderPagination(container, currentPage, hasMore, onPageChange) {
  const paginationEl = container.querySelector('#promos-pagination');
  if (!paginationEl) return;
  
  paginationEl.innerHTML = '';
  
  const controls = document.createElement('div');
  controls.className = 'pagination-controls';
  
  // Botón anterior SIEMPRE visible, deshabilitado en la primera página
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'btn-pagination';
  prevBtn.textContent = '← Anterior';
  if (currentPage === 0) {
    prevBtn.disabled = true;
  } else {
    prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
  }
  controls.appendChild(prevBtn);
  
  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  if (typeof window.promotionsTotalPages === 'number' && window.promotionsTotalPages > 0) {
    pageInfo.textContent = `${currentPage + 1} de ${window.promotionsTotalPages}`;
  } else {
    pageInfo.textContent = `${currentPage + 1}`;
  }
  controls.appendChild(pageInfo);
  
  if (hasMore) {
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn-pagination';
    nextBtn.textContent = 'Siguiente →';
    nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
    controls.appendChild(nextBtn);
  }
  
  paginationEl.appendChild(controls);
}

/**
 * Carga una página de promociones desde la API
 * @param {HTMLElement} container - Contenedor principal
 * @param {number} page - Página a cargar
 */
async function loadPage(container, page = 0) {
  const statusEl = container.querySelector('#promos-status');
  const resultsEl = container.querySelector('#promos-results');
  
  setStatus(statusEl, 'Cargando promociones...', 'info');
  if (resultsEl) resultsEl.innerHTML = '';
  
  try {
    const offset = page * PAGE_SIZE;
    const data = await fetchJSON(`./api/public/promociones?limit=${PAGE_SIZE}&offset=${offset}`);

    // Compatibilidad: puede venir como 'products' o 'promotions'
    const products = data?.data?.products || data?.data?.promotions || [];
    const total = data?.data?.total || null;
    window.promotionsTotalPages = total ? Math.ceil(total / PAGE_SIZE) : null;

    if (products.length === 0 && page === 0) {
      setStatus(statusEl, 'No hay promociones disponibles.', 'info');
      if (resultsEl) {
        resultsEl.innerHTML = '<p class="empty-state">Vuelve más tarde para ver nuevas ofertas.</p>';
      }
      return;
    }

    if (products.length === 0) {
      setStatus(statusEl, 'No hay más promociones.', 'info');
      renderPagination(container, page, false, (p) => loadPage(container, p));
      return;
    }

    const from = page * PAGE_SIZE + 1;
    const to = from + products.length - 1;
    setStatus(statusEl, `Mostrando promociones ${from} al ${to}`, 'success');

    renderPromotions(resultsEl, products);
    renderPagination(container, page, products.length === PAGE_SIZE, (p) => loadPage(container, p));
    
  } catch (err) {
    console.error('Error cargando promociones:', err);
    setStatus(statusEl, `Error: ${err.message}`, 'error');
  }
}

/**
 * Inicializa la vista de promociones
 * @param {HTMLElement} container - Contenedor principal de la vista
 */
export function initPromotionsView(container) {
  loadPage(container, 0);
}
