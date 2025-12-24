// public/js/views/adminProductModalView.js
import { escapeHtml, calculatePromoPrice, formatDate } from '../core/utils.js';

/**
 * Renderiza la ficha de producto igual a la pública, pero con botón Editar para admin (modal)
 * @param {Object} product
 * @param {Function} onEdit
 * @returns {string}
 */
export function renderAdminProductModalView(product, onEdit) {
  const priceData = calculatePromoPrice(product);
  const basePrice = parseFloat(product.base_price);
  const imageUrl = product.image_url || '';
  let badge = '';
  let savingsText = '';
  let originalPrice = '';
  if (priceData.hasPromo) {
    switch (priceData.type) {
      case 'porcentaje':
        badge = `<span class=\"discount-badge\">${priceData.discount}% OFF</span>`;
        originalPrice = `<p class=\"price-original\">$${basePrice.toFixed(2)}</p>`;
        savingsText = `<p class=\"price-savings\">Ahorrás $${priceData.savings.toFixed(2)}</p>`;
        break;
      case 'precio_fijo':
        badge = `<span class=\"discount-badge\">OFERTA</span>`;
        originalPrice = `<p class=\"price-original\">$${basePrice.toFixed(2)}</p>`;
        savingsText = `<p class=\"price-savings\">Ahorrás $${priceData.savings.toFixed(2)}</p>`;
        break;
      case '2x1':
        badge = `<span class=\"discount-badge\">2x1</span>`;
        savingsText = `<p class=\"price-savings\">Precio efectivo: $${priceData.final.toFixed(2)} c/u</p>`;
        break;
      case '3x2':
        badge = `<span class=\"discount-badge\">3x2</span>`;
        savingsText = `<p class=\"price-savings\">Pagás solo 2 unidades</p>`;
        break;
      case 'nxm':
        badge = `<span class=\"discount-badge\">COMBO</span>`;
        savingsText = `<p class=\"price-savings\">${escapeHtml(priceData.customText) || 'Consultá condiciones'}</p>`;
        break;
    }
  }
  const validUntil = product.promotion?.end_at 
    ? `<p class=\"promo-validity\">Válido hasta: ${formatDate(product.promotion.end_at)}</p>` 
    : '';
  return `
    <div class=\"product-card-detail admin\">
      <div class=\"product-image-section\">
        <div class=\"product-image-wrapper\">
          ${imageUrl 
            ? `<img src=\"${escapeHtml(imageUrl)}\" alt=\"${escapeHtml(product.name)}\" class=\"product-image\" onerror=\"this.style.display='none'; this.nextElementSibling.style.display='flex';\">`
            : ''
          }
          <div class=\"product-image-placeholder\" style=\"${imageUrl ? 'display: none;' : 'display: flex;'}\">
            <svg width=\"80\" height=\"80\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\">
              <path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"></path>
              <polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"></polyline>
              <line x1=\"12\" y1=\"22.08\" x2=\"12\" y2=\"12\"></line>
            </svg>
            <span>Sin imagen</span>
          </div>
        </div>
        <div class=\"product-specs\">
          <h3 class=\"specs-title\">Características</h3>
          <dl class=\"specs-list\">
            <div class=\"spec-item\">
              <dt>Bodega</dt>
              <dd>${escapeHtml(product.winery_distillery) || '—'}</dd>
            </div>
            ${product.origin ? `
              <div class=\"spec-item\">
                <dt>Origen</dt>
                <dd>${escapeHtml(product.origin)}</dd>
              </div>
            ` : ''}
            ${product.vintage_year ? `
              <div class=\"spec-item\">
                <dt>Cosecha</dt>
                <dd>${product.vintage_year}</dd>
              </div>
            ` : ''}
            <div class=\"spec-item\">
              <dt>Código</dt>
              <dd>${escapeHtml(product.public_code)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div class=\"product-info-section\">
        <div class=\"product-header\">
          <p class=\"product-category\">${escapeHtml(product.drink_type) || ''}${product.varietal ? ' | ' + escapeHtml(product.varietal) : ''}</p>
          <h1 class=\"product-title\">${escapeHtml(product.name) || 'Producto'}</h1>
        </div>
        <div class=\"product-price-section\">
          ${badge}
          ${originalPrice}
          <div class=\"price-main\">
            <span class=\"price-symbol\">$</span>
            <span class=\"price-int\">${Math.floor(priceData.final)}</span>
            <span class=\"price-dec\">${(priceData.final % 1).toFixed(2).slice(1)}</span>
          </div>
          ${savingsText}
          ${validUntil}
        </div>
        ${product.short_description ? `
          <div class=\"product-description\">
            <h2 class=\"description-title\">Descripción</h2>
            <p>${escapeHtml(product.short_description)}</p>
          </div>
        ` : ''}
        <div class=\"admin-edit-btn-section\">
          <button type=\"button\" class=\"btn-primary\" id=\"admin-edit-product-btn\">Editar</button>
        </div>
      </div>
    </div>
  `;
}
