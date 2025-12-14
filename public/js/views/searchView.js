// public/js/views/searchView.js
/**
 * Controlador de la vista 'search'
 *
 * Responsabilidades:
 * - Gestionar formulario de búsqueda por texto libre
 *   - Busca en nombre, bodega, descripción, varietal, origen
 * - Consultar API (GET /api/public/productos?search=...)
 * - Renderizar resultados como tarjetas interactivas
 *   - Mostrar información básica (nombre, bodega, tipo, precio)
 *   - Mostrar promoción vigente si existe con badge y validez
 *   - Efectos hover (elevación y sombra)
 * - Navegar a ficha de producto al clickear tarjeta
 * - Gestionar estados: vacío, carga, sin resultados, error, éxito
 * - Indicadores visuales de carga y cantidad de resultados
 */

let initialized = false; // Flag para evitar inicialización múltiple

function setStatus(el, message, type = 'info') {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

/**
 * Renderizar grid de tarjetas con resultados de búsqueda
 * @param {HTMLElement} resultEl - Contenedor para insertar resultados
 * @param {Array} products - Array de productos desde API
 */
function renderSearchResults(resultEl, products) {
  if (!resultEl) return;
  
  const container = document.createElement('div');
  container.className = 'search-results-grid';
  
  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.style.cursor = 'pointer';
    
    // Renderizar precio con o sin promoción
    let priceHtml = '';
    let promoValidityHtml = '';
    if (product.promotion) {
      const basePrice = parseFloat(product.base_price);
      let finalPrice = basePrice;
      
      if (product.promotion.type === 'porcentaje') {
        const discount = parseFloat(product.promotion.value);
        finalPrice = basePrice * (1 - discount / 100);
        priceHtml = `<p><strong>Precio:</strong> <span style="text-decoration: line-through; color: #999;">$${basePrice.toFixed(2)}</span> <span style="color: #d4af37; font-weight: bold;">$${finalPrice.toFixed(2)}</span> <span style="color: #d4af37; font-size: 0.85em;">(${discount}% OFF)</span></p>`;
      } else if (product.promotion.type === 'precio_fijo') {
        finalPrice = parseFloat(product.promotion.value);
        const savings = basePrice - finalPrice;
        priceHtml = `<p><strong>Precio:</strong> <span style="text-decoration: line-through; color: #999;">$${basePrice.toFixed(2)}</span> <span style="color: #d4af37; font-weight: bold;">$${finalPrice.toFixed(2)}</span> <span style="color: #d4af37; font-size: 0.85em;">(Ahorrás $${savings.toFixed(2)})</span></p>`;
      } else if (product.promotion.type === '2x1') {
        finalPrice = basePrice / 2;
        priceHtml = `<p><strong>Precio:</strong> <span style="text-decoration: line-through; color: #999;">$${basePrice.toFixed(2)}</span> <span style="color: #d4af37; font-weight: bold;">$${finalPrice.toFixed(2)} c/u</span> <span style="color: #d4af37; font-size: 0.85em;">(2x1: pagás 1, llevás 2)</span></p>`;
      } else if (product.promotion.type === '3x2') {
        finalPrice = basePrice * 2 / 3;
        priceHtml = `<p><strong>Precio:</strong> <span style="text-decoration: line-through; color: #999;">$${basePrice.toFixed(2)}</span> <span style="color: #d4af37; font-weight: bold;">$${finalPrice.toFixed(2)} c/u</span> <span style="color: #d4af37; font-size: 0.85em;">(3x2: pagás 2, llevás 3)</span></p>`;
      } else if (product.promotion.type === 'nxm') {
        priceHtml = `<p><strong>Precio:</strong> <span style="color: #d4af37; font-weight: bold;">$${basePrice.toFixed(2)} c/u</span> <span style="color: #d4af37; font-size: 0.85em;">(Combo especial - Consultá condiciones)</span></p>`;
      }
      
      // Agregar fechas de validez
      const startDate = product.promotion.start_at ? new Date(product.promotion.start_at).toLocaleDateString('es-AR') : '';
      const endDate = product.promotion.end_at ? new Date(product.promotion.end_at).toLocaleDateString('es-AR') : 'Sin vencimiento';
      promoValidityHtml = `<p style="font-size: 0.8em; color: #d4af37; margin-top: 0.25rem;">⏰ Válido hasta: ${endDate}</p>`;
    } else {
      priceHtml = `<p><strong>Precio:</strong> $${product.base_price ?? '—'}</p>`;
    }
    
    // Renderizar tarjeta con información del producto
    card.innerHTML = `
      <h4>${product.name || 'Producto'}</h4>
      <p><strong>Bodega:</strong> ${product.winery_distillery || '—'}</p>
      <p><strong>Tipo:</strong> ${product.drink_type || '—'}${product.varietal ? ' · ' + product.varietal : ''}</p>
      ${priceHtml}
      ${promoValidityHtml}
      <p><small>Código: ${product.public_code}</small></p>
    `;
    
    // Navegar a ficha de producto al clickear
    card.addEventListener('click', () => {
      window.location.hash = `#qr?code=${encodeURIComponent(product.public_code)}`;
    });
    
    // Efectos visuales de interacción (elevación y sombra)
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

/**
 * Inicializar vista de búsqueda de productos
 * @param {HTMLElement} container - Contenedor de la vista
 */
export function initSearchView(container) {
  if (initialized) return; // Evitar inicialización múltiple

  const form = container.querySelector('#search-form');
  const searchInput = container.querySelector('#search-input');
  const statusEl = container.querySelector('#search-status');
  const resultsEl = container.querySelector('#search-results');
  
  // Manejador del envío del formulario de búsqueda
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const query = searchInput?.value?.trim() || '';

      // Validación
      if (query.length === 0) {
        setStatus(statusEl, 'Ingresá un texto de búsqueda.', 'error');
        if (resultsEl) resultsEl.innerHTML = '';
        return;
      }

      // Mostrar indicador de carga
      setStatus(statusEl, 'Buscando productos...', 'info');
      if (resultsEl) resultsEl.innerHTML = '';

      try {
        const res = await fetch(`./api/public/productos?search=${encodeURIComponent(query)}`, {
          headers: { Accept: 'application/json' },
        });

        const json = await res.json().catch(() => null);

        // Error de validación o sin parámetro
        if (!res.ok || !json?.ok) {
          const msg = json?.error?.message || 'Error en la búsqueda';
          setStatus(statusEl, `${msg}`, 'error');
          if (resultsEl) resultsEl.innerHTML = '';
          return;
        }

        const products = json.data?.products || [];
        if (products.length === 0) {
          setStatus(statusEl, `No se encontraron productos para "${query}".`, 'info');
          if (resultsEl) {
            resultsEl.innerHTML = '<p style="text-align: center; color: var(--text-light);">Intenta con otras palabras clave.</p>';
          }
          return;
        }

        setStatus(statusEl, `Se encontraron ${products.length} producto(s).`, 'success');
        renderSearchResults(resultsEl, products);
      } catch (err) {
        setStatus(statusEl, `Error de conexión: ${err.message}`, 'error');
        if (resultsEl) resultsEl.innerHTML = '';
      }
    });
  }

  initialized = true; // Marcar inicialización completada
}
