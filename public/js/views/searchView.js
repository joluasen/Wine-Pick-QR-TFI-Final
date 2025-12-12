// public/js/views/searchView.js
/**
 * Controlador de la vista 'search'
 *
 * Responsabilidades:
 * - Gestionar formulario de búsqueda.
 * - Consultar API (GET /api/public/productos?search=...).
 * - Renderizar resultados como tarjetas Bootstrap.
 * - Navegar a la ficha de producto al hacer clic en una tarjeta.
 * - Gestionar estados: carga, sin resultados, error.
 */

function setStatus(el, message, type = 'info') {
  if (!el) return;
  const alertType = type === 'error' ? 'danger' : (type === 'success' ? 'success' : 'info');
  el.innerHTML = `
    <div class="alert alert-${alertType} small p-2 mt-2" role="alert">
      ${message}
    </div>
  `;
}

/**
 * Renderiza las tarjetas de resultados de búsqueda usando Bootstrap.
 * @param {HTMLElement} resultEl - El elemento contenedor para los resultados.
 * @param {Array<object>} products - La lista de productos desde la API.
 */
function renderSearchResults(resultEl, products) {
  if (!resultEl) return;
  resultEl.innerHTML = ''; // Limpiar resultados anteriores

  products.forEach((product) => {
    const finalPrice = parseFloat(product.final_price);
    const basePrice = parseFloat(product.base_price);
    let priceHTML = '';
    let badgeHTML = '';

    if (product.promotion) {
      const promoType = product.promotion.promotion_type;
      const promoValue = parseFloat(product.promotion.parameter_value);

      priceHTML = `
        <p class="card-text small text-decoration-line-through text-muted mb-1">
          $${basePrice.toFixed(2)}
        </p>
        <p class="card-text h5 fw-bold text-primary mb-0">
          $${finalPrice.toFixed(2)}
        </p>
      `;

      if (promoType === 'porcentaje') {
        badgeHTML = `<span class="badge bg-success">${promoValue.toFixed(0)}% OFF</span>`;
      } else if (promoType === 'precio_fijo') {
        const discount = ((basePrice - finalPrice) / basePrice) * 100;
        badgeHTML = `<span class="badge bg-success">${discount.toFixed(0)}% OFF</span>`;
      } else {
        badgeHTML = `<span class="badge bg-warning text-dark">${promoType.toUpperCase()}</span>`;
      }
    } else {
      priceHTML = `
        <p class="card-text h5 fw-bold text-primary mb-0">
          $${finalPrice.toFixed(2)}
        </p>
      `;
    }

    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card h-100 shadow-sm product-card-search" data-product-code="${product.public_code}" style="cursor: pointer;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title h6">${product.name}</h5>
          <p class="card-text text-muted small mb-2">${product.winery_distillery}</p>
          <p class="card-text text-muted small">${product.drink_type} ${product.varietal ? `· ${product.varietal}` : ''}</p>
          
          <div class="mt-auto pt-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>${priceHTML}</div>
              ${badgeHTML}
            </div>
          </div>
        </div>
      </div>
    `;

    col.querySelector('.product-card-search').addEventListener('click', () => {
      window.location.hash = `#qr?code=${encodeURIComponent(product.public_code)}`;
    });

    resultEl.appendChild(col);
  });
}

async function searchView(params, viewEl) {
  const form = viewEl.querySelector('#search-form');
  const input = viewEl.querySelector('#search-input');
  const statusEl = viewEl.querySelector('#search-status');
  const resultsEl = viewEl.querySelector('#search-results');

  if (!form || !input || !statusEl || !resultsEl) {
    console.error('Elementos requeridos no encontrados en search.html');
    return;
  }

  // Evitar añadir listeners múltiples veces
  if (form.dataset.initialized) return;
  form.dataset.initialized = 'true';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query.length < 2) {
      setStatus(statusEl, 'Por favor, ingresa al menos 2 caracteres.', 'warning');
      return;
    }

    setStatus(statusEl, 'Buscando...', 'info');
    resultsEl.innerHTML = '';

    try {
      const response = await fetch(`/api/public/productos?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      const products = await response.json();

      if (products.length === 0) {
        setStatus(statusEl, `No se encontraron resultados para "${query}".`, 'info');
      } else {
        statusEl.innerHTML = ''; // Limpiar mensaje de "buscando"
        renderSearchResults(resultsEl, products);
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setStatus(statusEl, 'Ocurrió un error al realizar la búsqueda.', 'error');
    }
  });
}

export default searchView;
