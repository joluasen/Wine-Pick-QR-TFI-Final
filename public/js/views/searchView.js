
// public/js/views/searchView.js
/**
 * Vista de búsqueda pública y administrativa
 *
 * Muestra resultados de búsqueda con filtros y paginación.
 * Permite interacción con productos, métricas y navegación entre páginas.
 *
 * Funcionalidades principales:
 * - Renderizado de resultados y tarjetas de producto
 * - Paginación dinámica
 * - Filtros activos desde el hash
 * - Manejo de errores y estados vacíos
 */

import { setStatus, getHashParams, fetchJSON, escapeHtml, calculatePromoPrice, registerMetric } from '../core/utils.js';
import { modalManager } from '../core/modalManager.js';

const PAGE_SIZE = 20;

// Estado local de la vista
let currentPage = 0;
let currentQuery = '';
let viewContainer = null;

/**
 * Renderiza los resultados de búsqueda en la vista
 * @param {HTMLElement} container - Contenedor donde se muestran los resultados
 * @param {Array} products - Lista de productos encontrados
 * @param {number} total - Total de resultados
 * @param {number} page - Página actual
 */
function renderResults(container, products, total, page) {
  container.innerHTML = '';
  
  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-results">
        <p>No se encontraron productos para tu búsqueda.</p>
        <p class="empty-hint">Probá con otros términos o revisá los filtros.</p>
      </div>
    `;
    return;
  }
  
  // Crear grilla de productos
  const grid = document.createElement('div');
  grid.className = 'product-grid';
  
  products.forEach(product => {
    const card = createResultCard(product);
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
  
  // Paginación si hay más de una página
  if (total > PAGE_SIZE) {
    const pagination = createPagination(page, total);
    container.appendChild(pagination);
  }
}

/**
 * Crea una tarjeta de resultado de producto
 * @param {Object} product - Producto a mostrar
 * @returns {HTMLElement} - Elemento de la tarjeta
 */
function createResultCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  
  const priceData = calculatePromoPrice(product);
  const displayPrice = product.final_price ?? priceData.final;
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
    <h4 class="card-title">${escapeHtml(product.name) || 'Producto'}</h4>
    <p><strong>Bodega:</strong> ${escapeHtml(product.winery_distillery) || '—'}</p>
    <p class="price"><strong>Precio:</strong> <span class="price-value">$${displayPrice.toFixed(2)}</span></p>
    <p class="code"><small>Código: ${escapeHtml(product.public_code)}</small></p>
  `;
  
  // Detectar si esta búsqueda viene de un QR scan
  const channel = sessionStorage.getItem('lastSearchChannel') || 'BUSQUEDA';
  const isAdminContext = window.location.hash.startsWith('#admin');
  
  // Accesibilidad: click y enter/espacio abren el modal del producto
  card.addEventListener('click', () => {
    if (isAdminContext) {
      // Admin no registra métricas
      modalManager.showProductAdmin(product);
      return;
    }
    registerMetric(product.id, channel);
    modalManager.showProduct(product, null);
    sessionStorage.removeItem('lastSearchChannel');
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isAdminContext) {
        modalManager.showProductAdmin(product);
        return;
      }
      registerMetric(product.id, channel);
      modalManager.showProduct(product, null);
      sessionStorage.removeItem('lastSearchChannel');
    }
  });
  
  return card;
}

/**
 * Crea los controles de paginación para los resultados
 * @param {number} page - Página actual
 * @param {number} total - Total de resultados
 * @returns {HTMLElement} - Elemento de paginación
 */
function createPagination(page, total) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  
  const pagination = document.createElement('div');
  pagination.className = 'pagination-controls';
  
  if (page > 0) {
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn-pagination';
    prevBtn.textContent = '← Anterior';
    prevBtn.addEventListener('click', () => loadResults(currentQuery, page - 1));
    pagination.appendChild(prevBtn);
  }
  
  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  pageInfo.textContent = `Página ${page + 1} de ${totalPages}`;
  pagination.appendChild(pageInfo);
  
  if ((page + 1) * PAGE_SIZE < total) {
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn-pagination';
    nextBtn.textContent = 'Siguiente →';
    nextBtn.addEventListener('click', () => loadResults(currentQuery, page + 1));
    pagination.appendChild(nextBtn);
  }
  
  return pagination;
}

/**
 * Obtiene los filtros activos desde el hash de la URL
 * @returns {Object} - Filtros activos
 */
function getActiveFilters() {
  const params = getHashParams();
  const filters = {};

  // Filtros de campo (checkboxes)
  if (params.varietal === '1') filters.field = 'varietal';
  else if (params.origin === '1') filters.field = 'origin';
  else if (params.winery_distillery === '1') filters.field = 'winery_distillery';

  // Filtro de tipo de bebida (select con valor)
  if (params.drink_type && params.drink_type !== '1') {
    filters.drink_type = params.drink_type;
  }

  // Filtro de año
  if (params.vintage_year) {
    filters.vintage_year = params.vintage_year;
  }

  return filters;
}

/**
 * Renderiza el resumen de filtros activos sobre los resultados
 * @param {HTMLElement} container
 * @param {Object} filters
 */
function renderActiveFilters(container, filters) {
  let summary = '';
  const filterLabels = {
    varietal: 'Varietal',
    origin: 'Origen',
    winery_distillery: 'Bodega',
    drink_type: 'Tipo de bebida',
    vintage_year: 'Año: ',
    public_code: 'Código: '
  };
  const active = [];
  if (filters.field) active.push(filterLabels[filters.field]);
  if (filters.vintage_year) active.push(filterLabels.vintage_year + filters.vintage_year);
  if (filters.public_code) active.push(filterLabels.public_code + filters.public_code);
  // Insertar o actualizar el resumen arriba de los resultados
  let bar = container.querySelector('.active-filters-bar');
  if (!bar && summary) {
    container.insertAdjacentHTML('afterbegin', summary);
  } else if (bar) {
    if (summary) bar.outerHTML = summary;
    else bar.remove();
  }
}

/**
 * Carga los resultados de búsqueda desde la API
 * @param {string} query - Término de búsqueda
 * @param {number} page - Página a mostrar
 * @param {HTMLElement|null} containerOverride - Contenedor alternativo
 */
async function loadResults(query, page = 0, containerOverride = null) {
  const container = containerOverride || viewContainer || document.querySelector('[data-view="search"], [data-view="adminSearch"]');
  if (!container) return;
  
  const resultsEl = container.querySelector('#search-results') || container;
  
  currentQuery = query;
  currentPage = page;
  
  resultsEl.innerHTML = '<p class="loading-state">Buscando...</p>';
  
  const filters = getActiveFilters();

  const params = {
    search: query,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    ...filters
  };

  try {
    const queryParams = new URLSearchParams(params);
    const url = `./api/public/productos?${queryParams.toString()}`;
    const data = await fetchJSON(url);

    const products = data?.data?.products || [];
    const total = data?.data?.total || 0;

    renderResults(resultsEl, products, total, page);
    
  } catch (err) {
    console.error('Error en búsqueda:', err);
    resultsEl.innerHTML = `
      <div class="error-state">
        <p>Error al buscar: ${escapeHtml(err.message)}</p>
        <button type="button" class="btn-primary" onclick="window.location.reload()">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Inicializa la vista de búsqueda
 * @param {HTMLElement} container - Contenedor principal de la vista
 */
export function initSearchView(container) {
  viewContainer = container;
  const params = getHashParams();
  const query = params.query || '';

  // Verificar si hay filtros activos
  const filters = getActiveFilters();
  const hasFilters = filters.field || filters.drink_type || filters.vintage_year;

  // Crear estructura de la vista si está vacía
  if (!container.querySelector('#search-results')) {
    container.innerHTML = `
      <div id="search-results" class="search-results"></div>
    `;
  }

  // Si no hay query ni filtros, mostrar estado vacío
  if (!query && !hasFilters) {
    container.innerHTML = `
      <div class="empty-search">
        <h2>Buscar Productos</h2>
        <p>Usá el buscador del header para encontrar vinos y bebidas.</p>
        <p class="hint">Podés buscar por nombre, bodega, varietal o código.</p>
      </div>
    `;
    return;
  }

  // Actualizar título de la vista
  const title = document.createElement('h2');
  title.className = 'search-title';
  container.insertBefore(title, container.firstChild);

  // Mostrar resumen de filtros activos
  renderActiveFilters(container, filters);

  // Listener para limpiar filtros
  setTimeout(() => {
    const clearBtn = container.querySelector('#clearFiltersBtn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        // Limpiar solo los filtros, mantener el término
        window.location.hash = `#search?query=${encodeURIComponent(query)}`;
      };
    }
  }, 0);

  loadResults(query, 0, container);
}
