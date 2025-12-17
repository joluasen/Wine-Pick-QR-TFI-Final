// utils para cargar y mostrar el modal de producto reutilizable

/**
 * Carga el HTML del modal de producto si no está presente y lo inserta en el body.
 * @returns {Promise<HTMLElement>} El elemento modal cargado.
 */
export async function ensureProductModal() {
  let modal = document.getElementById('product-modal');
  if (!modal) {
    // Buscar el segmento del proyecto en la ruta
    const projectSegment = '/Wine-Pick-QR-TFI/';
    const idx = window.location.pathname.indexOf(projectSegment);
    let base = '/';
    if (idx !== -1) {
      base = window.location.pathname.substring(0, idx + projectSegment.length);
    }
    // Cargar el modal desde product-modal.php
    const res = await fetch(`${base}views/product-modal.php`);
    const html = await res.text();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    document.body.appendChild(temp.firstElementChild);
    modal = document.getElementById('product-modal');
  }
  return modal;
}

/**
 * Muestra el modal de producto con los datos del producto.
 * @param {Object} product - Objeto producto completo
 */
export async function showProductModal(product) {
  const modal = await ensureProductModal();
  const cardContainer = modal.querySelector('#modal-product-card');
  if (cardContainer) {
    cardContainer.innerHTML = renderProductCard(product);
  }
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  // Cerrar modal
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    };
  }
  // Cerrar al hacer click fuera del contenido
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };
}

/**
 * Renderiza la ficha del producto para el modal.
 * @param {Object} product
 * @returns {string} HTML
 */
function renderProductCard(product) {
  // Estructura visual tipo Mercado Libre, igual a la ficha QR
  const basePrice = parseFloat(product.base_price);
  const promo = product.promotion;
  let finalPrice = basePrice;
  let badge = '';
  let savingsText = '';
  let unitHint = '';
  if (promo) {
    const type = promo.type || promo.promotion_type;
    const value = parseFloat(promo.value ?? promo.parameter_value);
    switch (type) {
      case 'porcentaje':
        finalPrice = basePrice * (1 - value / 100);
        badge = `<span class="meli-discount-badge">${value.toFixed(0)}% OFF</span>`;
        savingsText = `<p class="meli-savings">Ahorrás $${(basePrice - finalPrice).toFixed(2)}</p>`;
        break;
      case 'precio_fijo':
        finalPrice = value;
        badge = `<span class="meli-discount-badge">OFERTA</span>`;
        savingsText = `<p class="meli-savings">Ahorrás $${(basePrice - finalPrice).toFixed(2)}</p>`;
        break;
      case '2x1':
        finalPrice = basePrice / 2;
        badge = `<span class="meli-discount-badge">2x1</span>`;
        unitHint = `<p class="meli-savings">Precio efectivo: $${finalPrice.toFixed(2)} c/u</p>`;
        break;
      case '3x2':
        finalPrice = (basePrice * 2) / 3;
        badge = `<span class="meli-discount-badge">3x2</span>`;
        unitHint = `<p class="meli-savings">Pagás solo 2 unidades</p>`;
        break;
      case 'nxm':
        badge = `<span class="meli-discount-badge">COMBO</span>`;
        unitHint = `<p class="meli-savings">${promo.text || 'Consultá condiciones'}</p>`;
        break;
      default:
        break;
    }
  }
  const imageUrl = product.image_url || '';
  return `
    <div class="product-card-modal">
      <div class="product-left">
        <div class="product-image-container">
          ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
          <div class="product-image-placeholder" style="${imageUrl ? 'display: none;' : 'display: flex;'}">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Producto</span>
          </div>
        </div>
        <div style="margin-top:1rem;">
          <span class="meli-condition">${product.drink_type || ''}${product.varietal ? ' | ' + product.varietal : ''}</span>
          <span class="meli-title" style="display:block;font-size:1.2rem;font-weight:600;">${product.name || 'Producto'}</span>
        </div>
        <div style="margin-top:0.5rem;">
          <span class="meli-spec-label">Bodega:</span>
          <span class="meli-spec-value">${product.winery_distillery || '—'}</span>
        </div>
        ${product.origin ? `<div><span class="meli-spec-label">Origen:</span> <span class="meli-spec-value">${product.origin}</span></div>` : ''}
        ${product.vintage_year ? `<div><span class="meli-spec-label">Cosecha:</span> <span class="meli-spec-value">${product.vintage_year}</span></div>` : ''}
        <div><span class="meli-spec-label">Código:</span> <span class="meli-spec-value">${product.public_code}</span></div>
      </div>
      <div class="product-right">
        <div style="margin-bottom:0.5rem;">${badge}</div>
        <div class="meli-price-section">
          ${(promo && (promo.type === 'porcentaje' || promo.type === 'precio_fijo')) ? `<p class="meli-price-original">$${basePrice.toFixed(2)}</p>` : ''}
          <div class="meli-price-main" style="font-size:2.2rem;">
            <span class="meli-price-symbol">$</span>
            <span class="meli-price-int">${Math.floor(finalPrice)}</span>
            <span class="meli-price-dec">${(finalPrice % 1).toFixed(2).slice(1)}</span>
          </div>
          ${savingsText || unitHint}
        </div>
        ${product.short_description ? `<div class="meli-description"><h2 class="meli-section-title">Descripción</h2><p class="meli-desc-text">${product.short_description}</p></div>` : ''}
      </div>
    </div>
  `;
}
