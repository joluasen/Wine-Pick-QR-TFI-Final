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
  const currentYear = new Date().getFullYear();
  const descriptionLength = (product.short_description || '').length;

  const imageUrl = product.image_url && product.image_url !== '0' ? product.image_url : '';

  return `
    <div class="admin-product-edit-modal">
      <!-- Sección de imagen (igual que el modal público) -->
      <div class="product-image-section-edit">
        <div class="product-image-wrapper-edit" id="edit-image-display">
          ${imageUrl
            ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" class="product-image-edit" id="current-product-image">`
            : `<div class="product-image-placeholder-edit">
                 <i class="fas fa-image fa-4x text-muted"></i>
                 <p class="text-muted mt-3">Sin imagen</p>
               </div>`
          }
        </div>
        <div class="change-image-overlay">
          <input
            type="file"
            id="edit-product-image"
            accept="image/jpeg,image/png,image/webp"
            class="d-none"
          >
          <button type="button" class="btn-change-image" id="select-new-image-btn">
            <i class="fas fa-camera me-2"></i>Cambiar imagen
          </button>
        </div>
      </div>

      <!-- Sección de contenido (formulario) -->
      <div class="product-content-section-edit">
        <div class="modal-header-edit">
          <h3 class="modal-title-edit">
            <i class="fas fa-edit me-2"></i>Editar Producto
          </h3>
          <button type="button" class="btn-close-custom" data-close-modal aria-label="Cerrar">&times;</button>
        </div>

        <form id="admin-edit-product-form" novalidate>
          <!-- Identificación -->
          <div class="form-section mb-4">
            <h4 class="form-section-title">Identificación</h4>
            <div class="row g-3">
              <div class="col-md-6">
                <label for="edit-public-code" class="form-label">Código público</label>
                <input
                  type="text"
                  class="form-control"
                  id="edit-public-code"
                  name="public_code"
                  value="${escapeHtml(product.public_code)}"
                  readonly
                  title="El código no puede modificarse"
                >
                <small class="form-text text-muted">Este código es único e inmutable</small>
              </div>
              <div class="col-md-6">
                <label for="edit-name" class="form-label">Nombre <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  id="edit-name"
                  name="name"
                  value="${escapeHtml(product.name)}"
                  required
                  minlength="3"
                  maxlength="100"
                  placeholder="Ej: Malbec Reserva 2020"
                >
                <div class="invalid-feedback">El nombre debe tener entre 3 y 100 caracteres</div>
              </div>
            </div>
          </div>

          <!-- Información del producto -->
          <div class="form-section mb-4">
            <h4 class="form-section-title">Información del Producto</h4>
            <div class="row g-3">
              <div class="col-md-6">
                <label for="edit-winery" class="form-label">
                  <i class="fas fa-building me-1"></i>Bodega/Destilería <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="edit-winery"
                  name="winery_distillery"
                  value="${escapeHtml(product.winery_distillery)}"
                  required
                  minlength="2"
                  maxlength="100"
                  placeholder="Ej: Bodega Catena Zapata"
                >
                <div class="invalid-feedback">Ingrese el nombre de la bodega o destilería</div>
              </div>
              <div class="col-md-6">
                <label for="edit-drink-type" class="form-label">
                  <i class="fas fa-glass-cheers me-1"></i>Tipo de bebida <span class="text-danger">*</span>
                </label>
                <select class="form-select" id="edit-drink-type" name="drink_type" required>
                  <option value="">Seleccione un tipo</option>
                  <option value="vino" ${product.drink_type === 'vino' ? 'selected' : ''}>Vino</option>
                  <option value="espumante" ${product.drink_type === 'espumante' ? 'selected' : ''}>Espumante</option>
                  <option value="whisky" ${product.drink_type === 'whisky' ? 'selected' : ''}>Whisky</option>
                  <option value="gin" ${product.drink_type === 'gin' ? 'selected' : ''}>Gin</option>
                  <option value="cerveza" ${product.drink_type === 'cerveza' ? 'selected' : ''}>Cerveza</option>
                  <option value="licor" ${product.drink_type === 'licor' ? 'selected' : ''}>Licor</option>
                </select>
                <div class="invalid-feedback">Seleccione el tipo de bebida</div>
              </div>
            </div>

            <div class="row g-3 mt-2">
              <div class="col-md-6">
                <label for="edit-varietal" class="form-label">
                  <i class="fas fa-leaf me-1"></i>Varietal
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="edit-varietal"
                  name="varietal"
                  value="${escapeHtml(product.varietal || '')}"
                  maxlength="50"
                  placeholder="Ej: Malbec, Cabernet Sauvignon"
                >
              </div>
              <div class="col-md-6">
                <label for="edit-origin" class="form-label">
                  <i class="fas fa-map-marker-alt me-1"></i>Origen
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="edit-origin"
                  name="origin"
                  value="${escapeHtml(product.origin || '')}"
                  maxlength="100"
                  placeholder="Ej: Mendoza, Argentina"
                >
              </div>
            </div>
          </div>

          <!-- Precio y stock -->
          <div class="form-section mb-4">
            <h4 class="form-section-title">Precio y Stock</h4>
            <div class="row g-3">
              <div class="col-md-4">
                <label for="edit-vintage" class="form-label">
                  <i class="fas fa-calendar-alt me-1"></i>Año de cosecha
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="edit-vintage"
                  name="vintage_year"
                  value="${escapeHtml(product.vintage_year || '')}"
                  min="1900"
                  max="${currentYear + 1}"
                  placeholder="Ej: ${currentYear - 3}"
                >
                <div class="invalid-feedback">Año debe estar entre 1900 y ${currentYear + 1}</div>
              </div>
              <div class="col-md-4">
                <label for="edit-price" class="form-label">
                  <i class="fas fa-dollar-sign me-1"></i>Precio base <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input
                    type="number"
                    class="form-control"
                    id="edit-price"
                    name="base_price"
                    step="0.01"
                    value="${escapeHtml(product.base_price)}"
                    required
                    min="0.01"
                    max="999999.99"
                    placeholder="0.00"
                  >
                </div>
                <div class="invalid-feedback">Ingrese un precio válido mayor a 0</div>
              </div>
              <div class="col-md-4">
                <label for="edit-stock" class="form-label">
                  <i class="fas fa-boxes me-1"></i>Stock visible
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="edit-stock"
                  name="visible_stock"
                  value="${escapeHtml(product.visible_stock || '')}"
                  min="0"
                  max="99999"
                  placeholder="0"
                >
                <div class="invalid-feedback">Stock debe ser un número positivo</div>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div class="form-section mb-4">
            <h4 class="form-section-title">Descripción</h4>
            <div class="row g-3">
              <div class="col-12">
                <label for="edit-description" class="form-label">
                  <i class="fas fa-align-left me-1"></i>Descripción corta
                </label>
                <textarea
                  class="form-control"
                  id="edit-description"
                  name="short_description"
                  rows="4"
                  maxlength="200"
                  placeholder="Breve descripción del producto (opcional)"
                >${escapeHtml(product.short_description || '')}</textarea>
                <div class="d-flex justify-content-between align-items-center mt-1">
                  <small class="form-text text-muted">Máximo 200 caracteres</small>
                  <small class="form-text" id="char-counter">
                    <span id="char-count">${descriptionLength}</span>/200
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje de estado -->
          <div id="edit-form-status" class="alert d-none mb-3" role="alert"></div>

          <!-- Botones de acción -->
          <div class="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
            <button type="button" class="btn-modal btn-modal-secondary" data-dismiss-modal>
              <i class="fas fa-times me-1"></i>Cancelar
            </button>
            <button type="submit" class="btn-modal btn-modal-primary" id="save-product-btn">
              <i class="fas fa-save me-1"></i>Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
