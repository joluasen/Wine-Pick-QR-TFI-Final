// public/js/views/searchView.js
/**
 * Vista de búsqueda
 * 
 * Muestra resultados de búsqueda con filtros y paginación
 */

import { setStatus, getHashParams, fetchJSON, escapeHtml, calculatePromoPrice } from '../core/utils.js';
import { modalManager } from '../core/modalManager.js';

const PAGE_SIZE = 20;

// Estado local de la vista
let currentPage = 0;
let currentQuery = '';

/**
 * Renderiza los resultados de búsqueda
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
  
  const grid = document.createElement('div');
  grid.className = 'product-grid';
  
  products.forEach(product => {
    const card = createResultCard(product);
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
  
  // Paginación
  if (total > PAGE_SIZE) {
    const pagination = createPagination(page, total);
    container.appendChild(pagination);
  }
}

/**
 * Crea una tarjeta de resultado
 */
function createResultCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  
  const priceData = calculatePromoPrice(product);
  const displayPrice = product.final_price ?? priceData.final;
  
  card.innerHTML = `
    <h4 class="card-title">${escapeHtml(product.name) || 'Producto'}</h4>
    <p><strong>Bodega:</strong> ${escapeHtml(product.winery_distillery) || '—'}</p>
    <p class="price"><strong>Precio:</strong> <span class="price-value">$${displayPrice.toFixed(2)}</span></p>
    <p class="code"><small>Código: ${escapeHtml(product.public_code)}</small></p>
  `;
  
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
 * Crea los controles de paginación
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
 * Obtiene los filtros activos desde el hash
 */
function getActiveFilters() {
  const params = getHashParams();
  const filters = {};
  
  // Filtros de campo
  if (params.varietal === '1') filters.field = 'varietal';
  else if (params.origin === '1') filters.field = 'origin';
  else if (params.winery_distillery === '1') filters.field = 'winery_distillery';
  else if (params.drink_type === '1') filters.field = 'drink_type';
  
  // Filtro de año
  if (params.vintage_year) {
    filters.vintage_year = params.vintage_year;
  }
  
  // Filtro de código público
  if (params.public_code) {
    filters.public_code = params.public_code;
  }
  
  return filters;
}

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
 * Carga los resultados de búsqueda
 */
async function loadResults(query, page = 0) {
  const container = document.querySelector('[data-view="search"]');
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
 */
export function initSearchView(container) {
  const params = getHashParams();
  const query = params.query || '';
  
  // Crear estructura de la vista si está vacía
  if (!container.querySelector('#search-results')) {
    container.innerHTML = `
      <div id="search-results" class="search-results"></div>
    `;
  }
  
  if (!query) {
    container.innerHTML = `
      <div class="empty-search">
        <h2>Buscar Productos</h2>
        <p>Usá el buscador del header para encontrar vinos y bebidas.</p>
        <p class="hint">Podés buscar por nombre, bodega, varietal o código.</p>
      </div>
    `;
    return;
  }
  
  // Actualizar título
  const title = document.createElement('h2');
  title.className = 'search-title';
  container.insertBefore(title, container.firstChild);
  
  // Mostrar resumen de filtros activos
  const filters = getActiveFilters();
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
  
  loadResults(query, 0);
}
