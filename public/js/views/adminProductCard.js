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
    <div class="admin-product-card">
      <h2>Editar producto</h2>
      <form id="admin-edit-product-form">
        <div><label>Código público</label><input name="public_code" value="${escapeHtml(product.public_code)}" readonly></div>
        <div><label>Nombre</label><input name="name" value="${escapeHtml(product.name)}"></div>
        <div><label>Bodega</label><input name="winery_distillery" value="${escapeHtml(product.winery_distillery)}"></div>
        <div><label>Tipo</label><input name="drink_type" value="${escapeHtml(product.drink_type)}"></div>
        <div><label>Varietal</label><input name="varietal" value="${escapeHtml(product.varietal || '')}"></div>
        <div><label>Origen</label><input name="origin" value="${escapeHtml(product.origin || '')}"></div>
        <div><label>Año</label><input name="vintage_year" value="${escapeHtml(product.vintage_year || '')}"></div>
        <div><label>Precio base</label><input name="base_price" type="number" step="0.01" value="${escapeHtml(product.base_price)}"></div>
        <div><label>Stock visible</label><input name="visible_stock" type="number" value="${escapeHtml(product.visible_stock || '')}"></div>
        <div><label>Descripción corta</label><textarea name="short_description">${escapeHtml(product.short_description || '')}</textarea></div>
        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  `;
}
