// public/js/views/adminProductCard.js
// Ficha de producto para administración (edición)

import { escapeHtml } from '../core/utils.js';

/**
 * Renderiza la ficha editable de producto para admin
 * @param {Object} product - Datos del producto
 * @param {Function} onEdit - Callback al hacer clic en Editar
 * @returns {string} HTML
 */
export function renderAdminProductCard(product, onEdit) {
  return `
    <div class="admin-product-card-wrapper overflow-auto">
      <div class="admin-product-card">
        <button type="button" class="modal-close" data-close-modal aria-label="Cerrar">&times;</button>
        <form id="admin-edit-product-form">
        <div class="row g-3">
          <div class="col-md-6">
            <label for="edit-public-code" class="form-label fw-semibold">Código público</label>
            <input type="text" class="form-control" id="edit-public-code" name="public_code" value="${escapeHtml(product.public_code)}" readonly>
          </div>
          <div class="col-md-6">
            <label for="edit-name" class="form-label fw-semibold">Nombre <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="edit-name" name="name" value="${escapeHtml(product.name)}" required>
          </div>
        </div>

        <div class="row g-3 mt-2">
          <div class="col-md-6">
            <label for="edit-winery" class="form-label fw-semibold">Bodega/Destilería <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="edit-winery" name="winery_distillery" value="${escapeHtml(product.winery_distillery)}" required>
          </div>
          <div class="col-md-6">
            <label for="edit-drink-type" class="form-label fw-semibold">Tipo de bebida <span class="text-danger">*</span></label>
            <select class="form-select" id="edit-drink-type" name="drink_type" required>
              <option value="vino" ${product.drink_type === 'vino' ? 'selected' : ''}>Vino</option>
              <option value="espumante" ${product.drink_type === 'espumante' ? 'selected' : ''}>Espumante</option>
              <option value="whisky" ${product.drink_type === 'whisky' ? 'selected' : ''}>Whisky</option>
              <option value="gin" ${product.drink_type === 'gin' ? 'selected' : ''}>Gin</option>
              <option value="cerveza" ${product.drink_type === 'cerveza' ? 'selected' : ''}>Cerveza</option>
              <option value="licor" ${product.drink_type === 'licor' ? 'selected' : ''}>Licor</option>
            </select>
          </div>
        </div>

        <div class="row g-3 mt-2">
          <div class="col-md-6">
            <label for="edit-varietal" class="form-label fw-semibold">Varietal</label>
            <input type="text" class="form-control" id="edit-varietal" name="varietal" value="${escapeHtml(product.varietal || '')}">
          </div>
          <div class="col-md-6">
            <label for="edit-origin" class="form-label fw-semibold">Origen</label>
            <input type="text" class="form-control" id="edit-origin" name="origin" value="${escapeHtml(product.origin || '')}">
          </div>
        </div>

        <div class="row g-3 mt-2">
          <div class="col-md-4">
            <label for="edit-vintage" class="form-label fw-semibold">Año de cosecha</label>
            <input type="number" class="form-control" id="edit-vintage" name="vintage_year" value="${escapeHtml(product.vintage_year || '')}" min="1900" max="2100">
          </div>
          <div class="col-md-4">
            <label for="edit-price" class="form-label fw-semibold">Precio base <span class="text-danger">*</span></label>
            <div class="input-group">
              <span class="input-group-text">$</span>
              <input type="number" class="form-control" id="edit-price" name="base_price" step="0.01" value="${escapeHtml(product.base_price)}" required min="0">
            </div>
          </div>
          <div class="col-md-4">
            <label for="edit-stock" class="form-label fw-semibold">Stock visible</label>
            <input type="number" class="form-control" id="edit-stock" name="visible_stock" value="${escapeHtml(product.visible_stock || '')}" min="0">
          </div>
        </div>

        <div class="row g-3 mt-2">
          <div class="col-12">
            <label for="edit-description" class="form-label fw-semibold">Descripción corta</label>
            <textarea class="form-control" id="edit-description" name="short_description" rows="3" maxlength="200">${escapeHtml(product.short_description || '')}</textarea>
            <div class="form-text">Máximo 200 caracteres</div>
          </div>
        </div>

        <div class="d-flex gap-2 justify-content-end mt-4">
          <button type="button" class="btn-modal btn-modal-secondary" data-dismiss-modal>Cancelar</button>
          <button type="submit" class="btn-modal btn-modal-primary">
            <i class="bi bi-check-circle me-1"></i>
            Guardar cambios
          </button>
        </div>
      </form>
      </div>
    </div>
  `;
}
