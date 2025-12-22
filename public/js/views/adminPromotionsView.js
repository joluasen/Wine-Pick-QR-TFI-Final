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
  container.innerHTML = `
    <div class="table-responsive d-none d-md-block">
      <table class="table table-bordered align-middle shadow" id="admin-promos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Texto</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody><tr><td colspan='9'>Cargando...</td></tr></tbody>
      </table>
    </div>
  <div class="d-flex justify-content-center align-items-center mt-2">
    <button class="btn btn-secondary btn-sm mx-1" id="admin-promos-prev" disabled>Anterior</button>
    <span id="admin-promos-page" class="mx-2"></span>
    <button class="btn btn-secondary btn-sm mx-1" id="admin-promos-next" disabled>Siguiente</button>
  </div>
  `;

  const tableBody = container.querySelector('#admin-promos-table tbody');
  const paginationEl = container.querySelector('#admin-promos-page');
  const prevBtn = container.querySelector('#admin-promos-prev');
  const nextBtn = container.querySelector('#admin-promos-next');
  const PAGE_SIZE = 20;
  let currentPage = 0;
  let totalPromos = 0;

  function updatePagination(page, total) {
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    paginationEl.textContent = `Página ${page + 1} de ${totalPages}`;
    prevBtn.disabled = page <= 0;
    nextBtn.disabled = page >= totalPages - 1;
  }

  async function loadPromos(page = 0) {
    tableBody.innerHTML = `<tr><td colspan='9'>Cargando...</td></tr>`;
    try {
      // Obtener el total de promociones solo la primera vez o cuando sea necesario
      if (page === 0 || totalPromos === 0) {
        const countData = await fetchJSON('./api/admin/promociones/listar', {
          method: 'POST',
          body: JSON.stringify({ count: true }),
          headers: { 'Content-Type': 'application/json' }
        });
        totalPromos = countData?.data?.total || 0;
      }
      const offset = page * PAGE_SIZE;
      const data = await fetchJSON('./api/admin/promociones/listar', {
        method: 'POST',
        body: JSON.stringify({ limit: PAGE_SIZE, offset }),
        headers: { 'Content-Type': 'application/json' }
      });
      const promos = data?.data?.promotions || [];
      let rows = promos.map(p => `
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
            <button class="btn btn-xs btn-primary px-2 py-1" data-edit-promo="${p.id}">Editar</button>
            <button class="btn btn-xs btn-danger ms-1 px-2 py-1" data-delete-promo="${p.id}">Borrar</button>
            <button class="btn btn-xs btn-secondary ms-1 px-2 py-1" data-toggle-promo="${p.id}">${p.is_active ? 'Deshabilitar' : 'Habilitar'}</button>
          </td>
        </tr>
      `);
      // Si hay menos de PAGE_SIZE, rellenar con filas vacías
      for (let i = promos.length; i < PAGE_SIZE; i++) {
        rows.push('<tr>' + '<td>&nbsp;</td>'.repeat(9) + '</tr>');
      }
      // Si no hay promociones en toda la tabla
      if (promos.length === 0 && totalPromos === 0) {
        tableBody.innerHTML = `<tr><td colspan='9'>No hay promociones para mostrar.</td></tr>`;
      } else {
        tableBody.innerHTML = rows.join('');
      }
      updatePagination(page, totalPromos);
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan='9'>Error al cargar promociones</td></tr>`;
      updatePagination(page, totalPromos);
    }
  }

  prevBtn.onclick = () => {
    if (currentPage > 0) {
      currentPage--;
      loadPromos(currentPage);
    }
  };
  nextBtn.onclick = () => {
    const totalPages = Math.ceil(totalPromos / PAGE_SIZE) || 1;
    if (currentPage < totalPages - 1) {
      currentPage++;
      loadPromos(currentPage);
    }
  };

  // Inicializar la vista
  loadPromos(0);
}
