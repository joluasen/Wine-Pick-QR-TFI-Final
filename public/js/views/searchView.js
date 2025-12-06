// public/js/views/searchView.js
/**
 * Controlador de la vista 'search'
 *
 * Responsabilidad:
 * - Gestionar el formulario de búsqueda de productos
 * - Mostrar indicador de carga durante la consulta
 * - Renderizar resultados como tarjetas clickeables
 * - Manejar estados: carga, sin resultados, error
 * - Permitir ver detalles del producto (redirige a QR con código)
 */
let initialized = false;

function setStatus(el, message, type = 'info') {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

function renderSearchResults(resultEl, products) {
  if (!resultEl) return;
  
  const container = document.createElement('div');
  container.className = 'search-results-grid';
  
  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <h4>${product.name || 'Producto'}</h4>
      <p><strong>Bodega:</strong> ${product.winery_distillery || '—'}</p>
      <p><strong>Tipo:</strong> ${product.drink_type || '—'}${product.varietal ? ' · ' + product.varietal : ''}</p>
      <p><strong>Precio:</strong> $${product.base_price ?? '—'}</p>
      <p><small>Código: ${product.public_code}</small></p>
    `;
    
    // Click para ver detalles
    card.addEventListener('click', () => {
      window.location.hash = `#qr?code=${encodeURIComponent(product.public_code)}`;
    });
    
    // Hover effect
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

export function initSearchView(container) {
  if (initialized) return;

  const form = container.querySelector('#search-form');
  const searchInput = container.querySelector('#search-input');
  const statusEl = container.querySelector('#search-status');
  const resultsEl = container.querySelector('#search-results');
  
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

  initialized = true;
}
