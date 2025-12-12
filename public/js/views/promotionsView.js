// public/js/views/promotionsView.js
/**
 * Controlador de la vista 'promotions'
 *
 * Responsabilidades:
 * - Consultar API (GET /api/public/promociones) por promos vigentes.
 * - Renderizar tarjetas de Bootstrap con los datos de la promoción.
 * - Manejar estados: carga, sin resultados, error.
 */

function setStatus(el, message, type = 'info') {
  if (!el) return;

  const alertType = type === 'error' ? 'danger' : type;
  el.innerHTML = `
    <div class="alert alert-${alertType}" role="alert">
      ${message}
    </div>
  `;
}

/**
 * Renderiza las tarjetas de promociones usando componentes de Bootstrap.
 * @param {HTMLElement} resultEl - El elemento contenedor para los resultados.
 * @param {Array<object>} products - La lista de productos con promociones.
 */
function renderPromotions(resultEl, products) {
  if (!resultEl) return;
  resultEl.innerHTML = ''; // Limpiar resultados anteriores

  products.forEach((product) => {
    const promo = product.promotion;
    if (!promo) return; // No debería pasar si la API funciona bien

    const basePrice = parseFloat(product.base_price);
    // El precio final ya viene calculado desde el backend.
    const finalPrice = parseFloat(product.final_price);

    let badgeHTML = '';
    const promoType = promo.promotion_type;
    const promoValue = parseFloat(promo.parameter_value);

    switch (promoType) {
      case 'porcentaje':
        badgeHTML = `<span class="badge bg-success">${promoValue.toFixed(0)}% OFF</span>`;
        break;
      case 'precio_fijo':
        const discount = ((basePrice - finalPrice) / basePrice) * 100;
        badgeHTML = `<span class="badge bg-success">${discount.toFixed(0)}% OFF</span>`;
        break;
      case '2x1':
      case '3x2':
        badgeHTML = `<span class="badge bg-warning text-dark">${promoType.toUpperCase()}</span>`;
        break;
      default:
        badgeHTML = `<span class="badge bg-info">${promo.text || 'Oferta'}</span>`;
        break;
    }

    const endDate = promo.end_at
      ? new Date(promo.end_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'Indefinido';

    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card h-100 shadow-sm product-card-promo" data-product-id="${product.id}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title h6">${product.name}</h5>
          <p class="card-text text-muted small mb-3">${product.winery_distillery}</p>
          
          <div class="mt-auto">
            <p class="card-text small text-decoration-line-through text-muted mb-1">
              Normal: $${basePrice.toFixed(2)}
            </p>
            <div class="d-flex align-items-center gap-2">
              <p class="card-text h4 fw-bold text-primary mb-0">
                $${finalPrice.toFixed(2)}
              </p>
              ${badgeHTML}
            </div>
          </div>
        </div>
        <div class="card-footer text-center">
            <small class="text-muted">Válido hasta: ${endDate}</small>
        </div>
      </div>
    `;
    resultEl.appendChild(col);
  });
}

async function promotionsView(params, viewEl) {
  const statusEl = viewEl.querySelector('#promos-status');
  const resultsEl = viewEl.querySelector('#promos-results');

  if (!statusEl || !resultsEl) {
    console.error('Elementos requeridos no encontrados en promotions.html');
    return;
  }

  setStatus(statusEl, 'Buscando promociones...', 'info');
  resultsEl.innerHTML = '';

  try {
    const response = await fetch('/api/public/promociones');
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }
    const promotions = await response.json();

    if (promotions.length === 0) {
      setStatus(statusEl, 'No hay promociones vigentes en este momento.', 'info');
    } else {
      statusEl.innerHTML = ''; // Limpiar estado si hay resultados
      renderPromotions(resultsEl, promotions);
    }
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    setStatus(statusEl, 'No se pudieron cargar las promociones. Intente de nuevo más tarde.', 'error');
  }
}

export default promotionsView;
