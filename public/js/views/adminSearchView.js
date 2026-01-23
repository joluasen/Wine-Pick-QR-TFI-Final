/**
 * adminSearchView.js
 * Vista de búsqueda para admin: muestra resultados en tabla
 */

import { getHashParams, fetchJSON } from '../core/utils.js';
import { modalManager } from '../core/modalManager.js';
import { showToast } from '../admin/components/Toast.js';
import { showConfirmDialog } from '../admin/components/ConfirmDialog.js';
import { deleteProduct as deleteProductService } from '../admin/services/productService.js';

const PAGE_SIZE = 20;

let currentPage = 0;
let currentQuery = '';
let totalProducts = 0;
let cachedProducts = [];

/**
 * Renderiza las filas de la tabla
 */
function renderRows(products) {
  if (products.length === 0) {
    return `<tr><td colspan="7" class="text-center py-4">No se encontraron productos.</td></tr>`;
  }

  let rows = products.map(
    (p) => `
    <tr>
      <td>${p.id}</td>
      <td>${p.public_code}</td>
      <td>${p.name}</td>
      <td>${p.drink_type || '—'}</td>
      <td>${p.winery_distillery || '—'}</td>
      <td>$${(p.base_price || 0).toFixed(2)}</td>
      <td>
        <button class="btn-table" data-edit-product="${p.id}">Editar</button>
        <button class="btn-table ms-1" data-view-product="${p.id}">Ver</button>
        <button class="btn-table ms-1" data-delete-product="${p.id}">Borrar</button>
      </td>
    </tr>
  `
  );

  return rows.join('');
}

/**
 * Renderiza las cards para vista mobile
 */
function renderCards(products) {
  if (products.length === 0) {
    return '<div class="text-center py-4 text-muted">No se encontraron productos.</div>';
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
      </div>
      <div class="card-mobile-body">
        <div class="card-mobile-info">
          <span class="card-mobile-label">Tipo</span>
          <span class="card-mobile-value">${p.drink_type || '—'}</span>
        </div>
        <div class="card-mobile-info">
          <span class="card-mobile-label">Bodega</span>
          <span class="card-mobile-value">${p.winery_distillery || '—'}</span>
        </div>
        <div class="card-mobile-info">
          <span class="card-mobile-label">Precio</span>
          <span class="card-mobile-price">$${(p.base_price || 0).toFixed(2)}</span>
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
    .join('');
}

/**
 * Actualiza los controles de paginación
 */
function updatePagination(page, total) {
  const paginationEl = document.getElementById('admin-search-page');
  const prevBtn = document.getElementById('admin-search-prev');
  const nextBtn = document.getElementById('admin-search-next');

  if (!paginationEl || !prevBtn || !nextBtn) return;

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  paginationEl.textContent = `${page + 1} de ${totalPages}`;
  prevBtn.disabled = page <= 0;
  nextBtn.disabled = page >= totalPages - 1;
}

/**
 * Adjunta event listeners a los botones de acciones
 */
function attachActionListeners() {
  const allViewBtns = document.querySelectorAll('[data-view-product]');
  const allEditBtns = document.querySelectorAll('[data-edit-product]');
  const allDeleteBtns = document.querySelectorAll('[data-delete-product]');

  // Ver producto
  allViewBtns.forEach((btn) => {
    btn.onclick = () => {
      const productId = btn.getAttribute('data-view-product');
      const product = cachedProducts.find((p) => String(p.id) === String(productId));
      if (product) {
        modalManager.showProductAdmin(product);
      }
    };
  });

  // Editar producto
  allEditBtns.forEach((btn) => {
    btn.onclick = async () => {
      const productId = btn.getAttribute('data-edit-product');
      const product = cachedProducts.find((p) => String(p.id) === String(productId));
      if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
      }
      modalManager.showEditProduct(product, () => {
        loadSearchResults(currentQuery, currentPage, promosMode);
      });
    };
  });

  // Eliminar producto
  allDeleteBtns.forEach((btn) => {
    btn.onclick = async () => {
      const productId = btn.getAttribute('data-delete-product');
      const product = cachedProducts.find((p) => String(p.id) === String(productId));
      if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
      }

      const confirmed = await showConfirmDialog({
        title: 'Eliminar producto',
        message: `¿Estás seguro de que deseas eliminar "${product.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmClass: 'btn-danger',
      });

      if (!confirmed) return;

      try {
        const loadingToast = showToast('Eliminando producto...', 'info', 0);
        await deleteProductService(productId);
        await new Promise((resolve) => setTimeout(resolve, 800));
        loadingToast.classList.remove('show');
        setTimeout(() => loadingToast.remove(), 300);
        showToast('Producto eliminado correctamente', 'success');
        loadSearchResults(currentQuery, currentPage, promosMode);
      } catch (error) {
        showToast(`Error al eliminar: ${error.message}`, 'error');
      }
    };
  });
}

/**
 * Carga los resultados de búsqueda
 */
async function loadSearchResults(query, page = 0, promosOnly = false) {
  const loadingEl = document.getElementById('admin-search-loading');
  const contentEl = document.getElementById('admin-search-content');
  const emptyEl = document.getElementById('admin-search-empty');
  const tableBody = document.querySelector('#admin-search-table tbody');
  const cardsContainer = document.getElementById('admin-search-cards');
  const titleEl = document.getElementById('admin-search-title');
  const subtitleEl = document.querySelector('.admin-section-subtitle');

  if (!loadingEl || !contentEl) return;

  // Mostrar loading
  loadingEl.style.display = 'block';
  contentEl.style.display = 'none';
  if (emptyEl) emptyEl.style.display = 'none';

  currentQuery = query;
  currentPage = page;

  // Actualizar título según el modo
  if (titleEl) {
    titleEl.innerHTML = promosOnly
      ? '<i class="fas fa-tags me-2"></i>Productos con promoción'
      : '<i class="fas fa-search me-2"></i>Resultados de búsqueda';
  }
  if (subtitleEl) {
    subtitleEl.innerHTML = promosOnly
      ? `Mostrando productos con promoción que coinciden con: <strong id="admin-search-query">${query}</strong>`
      : `Mostrando resultados para: <strong id="admin-search-query">${query}</strong>`;
  }

  try {
    const offset = page * PAGE_SIZE;
    let products = [];
    let total = 0;

    if (promosOnly) {
      // Buscar productos con promociones activas
      const params = new URLSearchParams({
        limit: 100, // Obtener más para filtrar
        offset: 0,
      });
      const fetchPromise = fetchJSON(`./api/public/promociones?${params.toString()}`);
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 250));
      const [data] = await Promise.all([fetchPromise, delayPromise]);

      // Filtrar por el query de búsqueda
      const allProducts = data?.data?.products || [];
      const queryLower = query.toLowerCase();
      const filtered = allProducts.filter(p =>
        p.name?.toLowerCase().includes(queryLower) ||
        p.public_code?.toLowerCase().includes(queryLower) ||
        p.winery_distillery?.toLowerCase().includes(queryLower) ||
        p.varietal?.toLowerCase().includes(queryLower)
      );

      // Paginar los resultados filtrados
      total = filtered.length;
      products = filtered.slice(offset, offset + PAGE_SIZE);
    } else {
      // Búsqueda normal de productos
      const params = new URLSearchParams({
        search: query,
        limit: PAGE_SIZE,
        offset: offset,
      });
      const fetchPromise = fetchJSON(`./api/public/productos?${params.toString()}`);
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 250));
      const [data] = await Promise.all([fetchPromise, delayPromise]);

      products = data?.data?.products || [];
      total = data?.data?.total || 0;
    }

    totalProducts = total;
    cachedProducts = products;

    if (tableBody) tableBody.innerHTML = renderRows(products);
    if (cardsContainer) cardsContainer.innerHTML = renderCards(products);

    attachActionListeners();
    updatePagination(page, totalProducts);

    // Ocultar loading, mostrar contenido
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
  } catch (err) {
    console.error('Error en búsqueda admin:', err);
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error al buscar: ${err.message}</td></tr>`;
    }
    showToast(`Error: ${err.message}`, 'error');
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
  }
}

// Variable para guardar si estamos en modo promociones
let promosMode = false;

/**
 * Inicializa la vista de búsqueda admin
 */
export function initAdminSearchView(_container) {
  const params = getHashParams();
  const query = params.query || '';
  promosMode = params.promos === '1';

  const loadingEl = document.getElementById('admin-search-loading');
  const contentEl = document.getElementById('admin-search-content');
  const emptyEl = document.getElementById('admin-search-empty');
  const prevBtn = document.getElementById('admin-search-prev');
  const nextBtn = document.getElementById('admin-search-next');

  // Si no hay query, mostrar estado vacío
  if (!query) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  // Event listeners de paginación
  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentPage > 0) {
        currentPage--;
        loadSearchResults(currentQuery, currentPage, promosMode);
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      const totalPages = Math.ceil(totalProducts / PAGE_SIZE) || 1;
      if (currentPage < totalPages - 1) {
        currentPage++;
        loadSearchResults(currentQuery, currentPage, promosMode);
      }
    };
  }

  // Cargar resultados
  loadSearchResults(query, 0, promosMode);
}