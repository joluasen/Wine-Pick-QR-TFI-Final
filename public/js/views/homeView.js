// public/js/views/homeView.js
/**
 * Controlador de la vista 'home'
 *
 * Responsabilidades:
 * - Consultar API (GET /api/public/mas-buscados) por productos más buscados
 * - Renderizar tarjetas con nombre, bodega, precio y disponibilidad
 * - Manejar paginación (siguiente, anterior)
 * - Manejar estados: carga, sin resultados, error
 */

function setStatus(el, message, type = 'info') {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

function calculatePromoPrice(product) {
  const basePrice = parseFloat(product.base_price);
  const promo = product.promotion;
  if (!promo) return { final: basePrice, type: null };

  const type = promo.type || promo.promotion_type;
  const value = parseFloat(promo.value ?? promo.parameter_value);

  switch (type) {
    case 'porcentaje':
      return { final: basePrice * (1 - value / 100), type };
    case 'precio_fijo':
      return { final: value, type, savings: basePrice - value };
    case '2x1':
      return { final: basePrice / 2, type };
    case '3x2':
      return { final: (basePrice * 2) / 3, type };
    case 'nxm':
      return { final: basePrice, type };
    default:
      return { final: basePrice, type: null };
  }
}

function renderProducts(resultEl, products) {
  if (!resultEl) return;
  const container = document.createElement('div');
  container.className = 'search-results-grid';

  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.style.cursor = 'pointer';

    const basePrice = parseFloat(product.base_price);
    const promoPrice = calculatePromoPrice(product);

    let badge = '';
    let savingsText = '';
    let unitHint = '';
    switch (promoPrice.type) {
      case 'porcentaje':
        badge = `<span class="meli-discount-badge">${parseFloat(product.promotion.value).toFixed(0)}% OFF</span>`;
        savingsText = `<p class="meli-savings">Ahorrás $${(basePrice - promoPrice.final).toFixed(2)}</p>`;
        break;
      case 'precio_fijo':
        badge = `<span class="meli-discount-badge">OFERTA</span>`;
        savingsText = `<p class="meli-savings">Ahorrás $${(basePrice - promoPrice.final).toFixed(2)}</p>`;
        break;
      case '2x1':
        badge = `<span class="meli-discount-badge">2x1</span>`;
        unitHint = `<p class="meli-savings">Precio efectivo: $${promoPrice.final.toFixed(2)} c/u</p>`;
        break;
      case '3x2':
        badge = `<span class="meli-discount-badge">3x2</span>`;
        unitHint = `<p class="meli-savings">Pagás solo 2 unidades</p>`;
        break;
      case 'nxm':
        badge = `<span class="meli-discount-badge">COMBO</span>`;
        unitHint = `<p class="meli-savings">${product.promotion.text || 'Consultá condiciones'}</p>`;
        break;
      default:
        break;
    }

    const priceBlock = (promoPrice.type === 'porcentaje' || promoPrice.type === 'precio_fijo')
      ? `<p><strong>Precio:</strong> <span style="text-decoration: line-through; color: #999;">$${basePrice.toFixed(2)}</span> <span style="color: #d4af37; font-weight: bold;">$${promoPrice.final.toFixed(2)}</span></p>`
      : `<p><strong>Precio:</strong> <span style="color: #d4af37; font-weight: bold;">$${promoPrice.final.toFixed(2)}</span></p>`;

    const stock = product.visible_stock !== null ? `<p><strong>Stock:</strong> ${product.visible_stock} unidades</p>` : '';

    card.innerHTML = `
      <h4>${product.name || 'Producto'}</h4>
      <p><strong>Bodega:</strong> ${product.winery_distillery || '—'}</p>
      ${priceBlock}
      ${stock}
      ${savingsText || unitHint}
      ${badge}
      <p><small>Código: ${product.public_code}</small></p>
    `;

    card.addEventListener('click', () => {
      window.location.hash = `#qr?code=${encodeURIComponent(product.public_code)}`;
    });

    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 4px 12px rgba(74, 14, 26, 0.15)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 1px 3px rgba(74, 14, 26, 0.08)';
    });

    container.appendChild(card);
  });

  resultEl.innerHTML = '';
  resultEl.appendChild(container);
}

function loadPage(container, page = 0) {
  const statusEl = container.querySelector('#home-status');
  const resultEl = container.querySelector('#home-results');
  const paginationEl = container.querySelector('#home-pagination');
  const pageSize = 10;
  const offset = page * pageSize;

  setStatus(statusEl, 'Cargando productos más buscados...', 'info');
  if (resultEl) resultEl.innerHTML = '';
  if (paginationEl) paginationEl.innerHTML = '';

  fetch(`./api/public/mas-buscados?limit=${pageSize}&offset=${offset}`, { headers: { Accept: 'application/json' } })
    .then((res) => res.json().then((json) => ({ ok: res.ok, status: res.status, json })))
    .then(({ ok, status, json }) => {
      if (!ok || !json?.ok) {
        const msg = json?.error?.message || `Error HTTP ${status}`;
        setStatus(statusEl, `No se pudo obtener los productos: ${msg}`, 'error');
        return;
      }

      const products = json.data?.products || [];
      if (products.length === 0 && page === 0) {
        setStatus(statusEl, 'No hay productos para mostrar aún.', 'info');
        if (resultEl) resultEl.innerHTML = '<p style="text-align:center;color:var(--text-light);">Vuelve más tarde cuando comience a crecer nuestro catálogo.</p>';
        return;
      }

      if (products.length === 0) {
        setStatus(statusEl, 'No hay más productos.', 'info');
        if (resultEl) resultEl.innerHTML = '<p style="text-align:center;color:var(--text-light);">Has llegado al final de la lista.</p>';
        renderPaginationControls(container, page, false);
        return;
      }

      const totalShown = (page + 1) * pageSize;
      setStatus(statusEl, `Mostrando productos ${page * pageSize + 1} al ${totalShown}.`, 'success');
      renderProducts(resultEl, products);
      renderPaginationControls(container, page, products.length === pageSize);
    })
    .catch((err) => {
      setStatus(statusEl, `Error de conexión: ${err.message}`, 'error');
      if (resultEl) resultEl.innerHTML = '';
    });
}

function renderPaginationControls(container, currentPage, hasMore) {
  const paginationEl = container.querySelector('#home-pagination');
  if (!paginationEl) return;

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '0.5rem';
  controls.style.justifyContent = 'center';
  controls.style.alignItems = 'center';

  if (currentPage > 0) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Anterior';
    prevBtn.style.padding = '0.75rem 1.5rem';
    prevBtn.style.backgroundColor = 'var(--primary)';
    prevBtn.style.color = 'var(--text-inverse)';
    prevBtn.style.border = 'none';
    prevBtn.style.borderRadius = '4px';
    prevBtn.style.cursor = 'pointer';
    prevBtn.style.fontSize = '0.95rem';
    prevBtn.style.fontWeight = '600';
    prevBtn.addEventListener('click', () => loadPage(container, currentPage - 1));
    prevBtn.addEventListener('mouseenter', () => {
      prevBtn.style.backgroundColor = 'var(--primary-dark, #6d0a1a)';
    });
    prevBtn.addEventListener('mouseleave', () => {
      prevBtn.style.backgroundColor = 'var(--primary)';
    });
    controls.appendChild(prevBtn);
  }

  const pageIndicator = document.createElement('span');
  pageIndicator.textContent = `Página ${currentPage + 1}`;
  pageIndicator.style.color = 'var(--text-light)';
  pageIndicator.style.fontSize = '0.9rem';
  pageIndicator.style.fontWeight = '500';
  controls.appendChild(pageIndicator);

  if (hasMore) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Siguiente →';
    nextBtn.style.padding = '0.75rem 1.5rem';
    nextBtn.style.backgroundColor = 'var(--primary)';
    nextBtn.style.color = 'var(--text-inverse)';
    nextBtn.style.border = 'none';
    nextBtn.style.borderRadius = '4px';
    nextBtn.style.cursor = 'pointer';
    nextBtn.style.fontSize = '0.95rem';
    nextBtn.style.fontWeight = '600';
    nextBtn.addEventListener('click', () => loadPage(container, currentPage + 1));
    nextBtn.addEventListener('mouseenter', () => {
      nextBtn.style.backgroundColor = 'var(--primary-dark, #6d0a1a)';
    });
    nextBtn.addEventListener('mouseleave', () => {
      nextBtn.style.backgroundColor = 'var(--primary)';
    });
    controls.appendChild(nextBtn);
  }

  paginationEl.innerHTML = '';
  paginationEl.appendChild(controls);
}

export function initHomeView(container) {
  loadPage(container, 0);
}
