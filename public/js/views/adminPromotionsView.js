// public/js/views/adminPromotionsView.js
/**
 * Vista de gestión de promociones para admin
 */


import { setStatus, fetchJSON } from '../core/utils.js';

function dateToSQL(dateStr) {
  if (!dateStr) return null;
  return `${dateStr} 00:00:00`;
}

async function loadProducts(selectEl) {
  if (!selectEl) return;
  try {
    const data = await fetchJSON('./api/public/productos?search=.');
    selectEl.innerHTML = '<option value="">-- Selecciona un producto --</option>';
    const products = data?.data?.products || [];
    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.name} ($${product.base_price})`;
      selectEl.appendChild(option);
    });
  } catch (err) {
    console.error('Error cargando productos:', err);
  }
}

function setupPromoForm(container, selectEl) {
  const form = container.querySelector('#promotion-create-form');
  const statusEl = container.querySelector('#promotion-create-status');
  const typeSelect = container.querySelector('#promo_type');
  const valueInput = container.querySelector('#promo_value');
  const valueLabel = container.querySelector('label[for="promo_value"]');
  if (!form) return;
  if (typeSelect && valueInput && valueLabel) {
    const updateLabel = () => {
      const type = typeSelect.value;
      const labels = {
        'porcentaje': 'Porcentaje de descuento (0-100) *',
        'precio_fijo': 'Precio promocional (ARS) *',
        '2x1': 'Valor fijo (usa 1) *',
        '3x2': 'Valor fijo (usa 2) *',
        'nxm': 'M (pagas M de N unidades) *'
      };
      const placeholders = {
        'porcentaje': 'Ej: 15',
        'precio_fijo': 'Ej: 3999.99',
        '2x1': '1',
        '3x2': '2',
        'nxm': 'Ej: 2'
      };
      valueLabel.textContent = labels[type] || 'Valor *';
      valueInput.placeholder = placeholders[type] || '';
      valueInput.step = ['porcentaje', '2x1', '3x2', 'nxm'].includes(type) ? '1' : '0.01';
    };
    typeSelect.addEventListener('change', updateLabel);
    updateLabel();
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = selectEl?.value;
    const type = typeSelect?.value;
    const value = parseFloat(valueInput?.value);
    let text = form.querySelector('#promo_text')?.value?.trim();
    const startDate = form.querySelector('#promo_start')?.value;
    const endDate = form.querySelector('#promo_end')?.value;
    if (!productId || !type || !value || !text || !startDate) {
      setStatus(statusEl, 'Completá todos los campos requeridos.', 'error');
      return;
    }
    if (endDate && endDate < startDate) {
      setStatus(statusEl, 'La fecha de fin debe ser posterior a la de inicio.', 'error');
      return;
    }
    if (!text) {
      const defaults = {
        '2x1': 'Llevate 2 y pagas 1',
        '3x2': 'Llevate 3 y pagas 2',
        'nxm': 'Combo especial'
      };
      text = defaults[type] || 'Promoción';
    }
    const payload = {
      product_id: parseInt(productId),
      promotion_type: type,
      parameter_value: value,
      visible_text: text,
      start_at: dateToSQL(startDate),
      end_at: endDate ? dateToSQL(endDate) : null
    };
    setStatus(statusEl, 'Creando promoción...', 'info');
    try {
      await fetchJSON('./api/admin/promociones', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setStatus(statusEl, 'Promoción creada con éxito.', 'success');
      form.reset();
      await loadProducts(selectEl);
    } catch (err) {
      if (err.status === 401) {
        setStatus(statusEl, 'Sesión expirada. Redirigiendo...', 'error');
        setTimeout(() => { window.location.hash = '#login'; }, 400);
      } else {
        setStatus(statusEl, `Error: ${err.message}`, 'error');
      }
    }
  });
}

export async function initAdminPromotionsView(container) {
  const promoSelect = container.querySelector('#promo_product_id');
  await loadProducts(promoSelect);
  setupPromoForm(container, promoSelect);

  // Tabla de promociones
  const tableBody = container.querySelector('#admin-promos-table tbody');
  const statusEl = container.querySelector('#admin-promos-status');
  const paginationEl = container.querySelector('#admin-promos-pagination');
  const PAGE_SIZE = 10;
  let currentPage = 0;

  async function loadPromos(page = 0) {
    setStatus(statusEl, 'Cargando promociones...', 'info');
    if (tableBody) tableBody.innerHTML = `<tr><td colspan='9'>Cargando...</td></tr>`;
    try {
      const offset = page * PAGE_SIZE;
      const data = await fetchJSON('./api/admin/promociones/listar', {
        method: 'POST',
        body: JSON.stringify({ limit: PAGE_SIZE, offset }),
        headers: { 'Content-Type': 'application/json' }
      });
      const promos = data?.data?.promotions || [];
      if (!promos.length) {
        tableBody.innerHTML = `<tr><td colspan='9'>No hay promociones para mostrar.</td></tr>`;
        setStatus(statusEl, 'No hay promociones.', 'info');
        return;
      }
      tableBody.innerHTML = promos.map(p => `
        <tr>
          <td>${p.id}</td>
          <td>${p.product_name || ''}</td>
          <td>${p.promotion_type}</td>
          <td>${p.parameter_value}</td>
          <td>${p.visible_text}</td>
          <td>${p.start_at ? p.start_at.split(' ')[0] : ''}</td>
          <td>${p.end_at ? p.end_at.split(' ')[0] : ''}</td>
          <td>${p.is_active ? 'Activa' : 'Inactiva'}</td>
          <td>
            <button class="btn btn-sm btn-primary" data-edit-promo="${p.id}">Editar</button>
            <button class="btn btn-sm btn-danger ms-1" data-delete-promo="${p.id}">Borrar</button>
            <button class="btn btn-sm btn-secondary ms-1" data-toggle-promo="${p.id}">${p.is_active ? 'Deshabilitar' : 'Habilitar'}</button>
          </td>
        </tr>
      `).join('');
      setStatus(statusEl, `Mostrando ${promos.length} promociones`, 'success');
      // Paginación básica
      paginationEl.innerHTML = '';
      if (page > 0) {
        const prev = document.createElement('button');
        prev.className = 'btn btn-outline-secondary btn-sm me-2';
        prev.textContent = 'Anterior';
        prev.onclick = () => loadPromos(page - 1);
        paginationEl.appendChild(prev);
      }
      if (promos.length === PAGE_SIZE) {
        const next = document.createElement('button');
        next.className = 'btn btn-outline-secondary btn-sm';
        next.textContent = 'Siguiente';
        next.onclick = () => loadPromos(page + 1);
        paginationEl.appendChild(next);
      }
    } catch (err) {
      setStatus(statusEl, `Error: ${err.message}`, 'error');
      tableBody.innerHTML = `<tr><td colspan='9'>Error al cargar promociones</td></tr>`;
    }
  }

  // Cargar promociones al iniciar
  if (tableBody) loadPromos(0);
}
