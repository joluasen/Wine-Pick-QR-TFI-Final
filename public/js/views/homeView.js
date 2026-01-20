// public/js/views/homeView.js
/**
 * Vista de inicio - Catálogo destacado
 * 
 * Muestra los productos más buscados con paginación
 */

import { setStatus, calculatePromoPrice, fetchJSON, escapeHtml } from '../core/utils.js';
import { modalManager } from '../core/modalManager.js';

const PAGE_SIZE = 20;

/**
 * Renderiza las tarjetas de productos
 */
function renderProducts(container, products) {
  if (!container) return;
  
  const grid = document.createElement('div');
  grid.className = 'product-grid';
  
  products.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });
  
  container.innerHTML = '';
  container.appendChild(grid);
}

/**
 * Crea una tarjeta de producto
 */
function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  
  const basePrice = parseFloat(product.base_price);
  const priceData = calculatePromoPrice(product);
  
  // Generar badge y texto de promoción
  let badge = '';
  let priceHtml = '';
  let savingsHtml = '';
  
  if (priceData.hasPromo) {
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
    }
  } else {
    priceHtml = `<span class="price-final">$${priceData.final.toFixed(2)}</span>`;
  }
  
  const stockHtml = product.visible_stock !== null 
    ? `<p class="stock"><strong>Stock:</strong> ${product.visible_stock} unidades</p>` 
    : '';
  
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
      <h3 class="card-title">${escapeHtml(product.name) || 'Producto'}</h3>
    </div>
    <div class="card-body">
      <p class="winery"><strong>Bodega:</strong> ${escapeHtml(product.winery_distillery) || '—'}</p>
      <div class="price-container">
        ${priceHtml}
      </div>
      ${savingsHtml}
      ${stockHtml}
    </div>
    <div class="card-footer">
      <span class="code">Cód: ${escapeHtml(product.public_code)}</span>
    </div>
  `;
  
  // Event listeners
  card.addEventListener('click', () => modalManager.showProduct(product));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      modalManager.showProduct(product);
    }
  });
  
  return card;
}

/**
 * Renderiza los controles de paginación
 */
function renderPagination(container, currentPage, hasMore, onPageChange, totalPages = null) {
  const paginationEl = container.querySelector('#home-pagination');
  if (!paginationEl) return;

  paginationEl.innerHTML = '';

  const controls = document.createElement('div');
  controls.className = 'pagination-controls';

  // Botón anterior SIEMPRE visible, deshabilitado en la primera página
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'btn-pagination';
  prevBtn.innerHTML = '← Anterior';
  if (currentPage === 0) {
    prevBtn.disabled = true;
  } else {
    prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
  }
  controls.appendChild(prevBtn);

  // Indicador de página con total
  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  if (totalPages && totalPages > 0) {
    pageInfo.textContent = `${currentPage + 1} de ${totalPages}`;
  } else {
    pageInfo.textContent = `${currentPage + 1}`;
  }
  controls.appendChild(pageInfo);

  // Botón siguiente
  if (hasMore) {
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn-pagination';
    nextBtn.innerHTML = 'Siguiente →';
    nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
    controls.appendChild(nextBtn);
  }

  paginationEl.appendChild(controls);
}

/**
 * Carga una página de productos
 */
async function loadPage(container, page = 0) {
  const statusEl = container.querySelector('#home-status');
  const resultsEl = container.querySelector('#home-results');

  setStatus(statusEl, 'Cargando productos destacados...', 'info');
  if (resultsEl) resultsEl.innerHTML = '';

  try {
    const offset = page * PAGE_SIZE;
    const data = await fetchJSON(`./api/public/mas-buscados?limit=${PAGE_SIZE}&offset=${offset}`);

    const products = data?.data?.products || [];
    // Intentar obtener el total de productos si la API lo provee
    const totalItems = data?.data?.total ?? null;
    const totalPages = totalItems ? Math.ceil(totalItems / PAGE_SIZE) : null;

    if (products.length === 0 && page === 0) {
      setStatus(statusEl, 'No hay productos para mostrar aún.', 'info');
      if (resultsEl) {
        resultsEl.innerHTML = '<p class="empty-state">Vuelve más tarde cuando crezca nuestro catálogo.</p>';
      }
      return;
    }

    if (products.length === 0) {
      setStatus(statusEl, 'No hay más productos.', 'info');
      renderPagination(container, page, false, (p) => loadPage(container, p), totalPages);
      return;
    }

    const from = page * PAGE_SIZE + 1;
    const to = from + products.length - 1;
    setStatus(statusEl, `Mostrando productos ${from} al ${to}`, 'success');

    renderProducts(resultsEl, products);
    renderPagination(container, page, products.length === PAGE_SIZE, (p) => loadPage(container, p), totalPages);

  } catch (err) {
    console.error('Error cargando productos:', err);
    setStatus(statusEl, `Error: ${err.message}`, 'error');
  }
}

/**
 * Inicializa la vista de inicio
 */
export function initHomeView(container) {
  loadPage(container, 0);
}
