// public/js/views/adminProductsView.js
import { setupLogout } from './adminView.js';
import { modalManager } from '../core/modalManager.js';

async function fetchAdminProducts({ limit = 20, offset = 0 } = {}) {
  const res = await fetch('./api/admin/productos/listar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'same-origin',
    body: JSON.stringify({ limit, offset })
  });
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
}

function renderProductsTable(products) {
  if (!products.length) return `<tr><td colspan='8'>No hay productos para mostrar.</td></tr>`;
  return products.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.public_code}</td>
      <td>${p.name}</td>
      <td>${p.drink_type}</td>
      <td>${p.winery_distillery}</td>
      <td>${p.base_price.toFixed(2)}</td>
      <td>${p.is_active ? 'Sí' : 'No'}</td>
      <td>
        <button class="btn btn-sm btn-primary" data-edit-product="${p.id}">Editar</button>
        <button class="btn btn-sm btn-info ms-1" data-view-product="${p.id}">Ver</button>
        <button class="btn btn-sm btn-success ms-1" data-new-promo="${p.id}">Nueva Promoción</button>
      </td>
    </tr>
  `).join('');
}

export async function initAdminProductsView(container) {
  container.innerHTML = `
    <h2>Gestión de Productos</h2>
    <div class="table-responsive d-none d-md-block">
      <table class="table align-middle shadow" id="admin-products-table" style="background: #fff; font-size: 0.97rem;">
        <thead style="background: #f8f8f8; color: #333;">
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Bodega</th>
            <th>Precio</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody><tr><td colspan='8'>Cargando...</td></tr></tbody>
      </table>
    </div>
    <style>
    #admin-products-table th, #admin-products-table td {
      vertical-align: middle;
      text-align: center;
      padding: 0.45rem 0.4rem;
      border-right: 1px solid #e5e5e5;
    }
    #admin-products-table th:last-child, #admin-products-table td:last-child {
      border-right: none;
    }
    #admin-products-table tbody tr {
      transition: background 0.15s;
    }
    #admin-products-table tbody tr:hover {
      background: #f3f3f3;
    }
    #admin-products-table td {
      border-bottom: 1px solid #e5e5e5;
    }
    #admin-products-table th {
      font-weight: 600;
      letter-spacing: 0.03em;
      font-size: 1rem;
      background: #f8f8f8;
      color: #333;
    }
    #admin-products-table .btn {
      font-size: 0.92rem;
      padding: 0.25rem 0.7rem;
      border-radius: 0.3rem;
      margin: 0 0.1rem 0.1rem 0;
      min-width: 60px;
      box-shadow: none;
    }
    #admin-products-table .btn-primary, #admin-products-table .btn-danger, #admin-products-table .btn-secondary, #admin-products-table .btn-success, #admin-products-table .btn-info {
      font-weight: 500;
    }
    #admin-products-table td:last-child {
      white-space: nowrap;
    }
    </style>
    <div class="d-flex justify-content-between align-items-center mt-2">
      <button class="btn btn-secondary" id="admin-products-prev">Anterior</button>
      <span id="admin-products-page"></span>
      <button class="btn btn-secondary" id="admin-products-next">Siguiente</button>
    </div>
  `;

  setupLogout(container);

  let page = 1;
  let limit = 20;
  let total = 0;

  // Toast container global para mensajes
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = 1080;
    document.body.appendChild(toastContainer);
  }

  function showToast(message, type = 'info') {
    const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-x-circle-fill' : 'bi-info-circle-fill';
    const bg = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-primary';
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${bg} border-0 show`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body"><i class="bi ${icon} me-2"></i>${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, 3500);
  }

  async function loadProducts() {
    const tbody = container.querySelector('#admin-products-table tbody');
    tbody.innerHTML = `<tr><td colspan='8'>Cargando...</td></tr>`;
    try {
      const response = await fetchAdminProducts({ limit, offset: (page - 1) * limit });
      const data = response && response.data ? response.data : {};
      const products = Array.isArray(data.products) ? data.products : [];
      const count = data.count || 0;
      const totalCount = data.total || 0;
      total = totalCount || count || 0;
      tbody.innerHTML = renderProductsTable(products);
      container.querySelector('#admin-products-page').textContent = `Página ${page} (${products.length} de ${total})`;
      // Asignar evento a los botones Ver
      tbody.querySelectorAll('[data-view-product]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-view-product');
          const product = products.find(p => String(p.id) === String(id));
          if (product) modalManager.showProduct(product);
        };
      });
    } catch (err) {
      showToast('Error al cargar productos: ' + err.message, 'error');
      tbody.innerHTML = `<tr><td colspan='8'>Error al cargar productos</td></tr>`;
    }
  }

  container.querySelector('#admin-products-prev').onclick = () => {
    if (page > 1) {
      page--;
      loadProducts();
    }
  };
  container.querySelector('#admin-products-next').onclick = () => {
    if (page * limit < total) {
      page++;
      loadProducts();
    }
  };

  // Modal para crear promoción
  let promoModal = document.getElementById('modal-new-promo');
  if (!promoModal) {
    promoModal = document.createElement('div');
    promoModal.className = 'modal fade';
    promoModal.id = 'modal-new-promo';
    promoModal.tabIndex = -1;
    promoModal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4" style="max-height: 90vh; overflow: hidden;">
          <div class="modal-header" style="background:#7a003c;color:#fff;">
            <h5 class="modal-title">Nueva Promoción</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body" style="overflow-y: auto; max-height: 70vh;">
            <div id="promo-modal-content">Selecciona un producto para crear una promoción.</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(promoModal);
  }
  let promoModalInstance = null;

  // Delegar click en botón Nueva Promoción
  container.addEventListener('click', async function(e) {
    const btn = e.target.closest('[data-new-promo]');
    if (btn) {
      const productId = btn.getAttribute('data-new-promo');
      const productName = btn.closest('tr')?.querySelector('td:nth-child(3)')?.textContent || '';
      const modalContent = promoModal.querySelector('#promo-modal-content');
      // Consultar promociones del producto usando el endpoint correcto
      let activePromo = null;
      try {
        const res = await fetch(`./api/admin/promociones?product_id=${productId}`);
        const data = await res.json();
        if (data?.ok && Array.isArray(data.data?.promotions)) {
          // Buscar si hay alguna promoción activa
          activePromo = data.data.promotions.find(p => p.is_active);
        }
      } catch (err) {
        // Si hay error, continuar sin activePromo
      }
      if (activePromo) {
        modalContent.innerHTML = `
          <div class="p-4 rounded-4 shadow-sm border-0" style="background: #fffbe8; border: 1px solid #f3d6e6;">
            <div class="mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size:1.5rem;"></i>
              <span class="fw-bold" style="font-size:1.2rem;color:#7a003c;">Promoción activa</span>
            </div>
            <div class="mb-2" style="font-size:1.05rem;">
              <span class="fw-semibold">${activePromo.promotion_type.replace('_', ' ').toUpperCase()}</span>
              <span class="mx-2">|</span>
              <span class="fw-semibold">Valor:</span> <span>${activePromo.parameter_value}</span>
              <span class="mx-2">|</span>
              <span class="fw-semibold">Vigencia:</span> <span>${activePromo.start_at ? activePromo.start_at.split(' ')[0] : ''}${activePromo.end_at ? ' al ' + activePromo.end_at.split(' ')[0] : ''}</span>
            </div>
            <div class="mb-3 text-muted" style="font-size:0.97rem;">No puedes crear otra promoción hasta que la actual finalice o sea eliminada.</div>
            <div class="mb-2 fw-semibold" style="color:#7a003c;">¿Qué acción deseas realizar sobre la promoción?</div>
            <div class="d-flex gap-2 justify-content-start align-items-center mt-2">
              <button type="button" class="btn btn-outline-primary btn-xs fw-semibold px-2 py-1" style="font-size:0.92rem;" data-edit-promo="${activePromo.id}"><i class="bi bi-pencil-square me-1"></i>Editar</button>
              <button type="button" class="btn btn-outline-danger btn-xs fw-semibold px-2 py-1" style="font-size:0.92rem;" data-delete-promo="${activePromo.id}"><i class="bi bi-trash me-1"></i>Eliminar</button>
              <button type="button" class="btn btn-outline-secondary btn-xs fw-semibold px-2 py-1" style="font-size:0.92rem;" data-toggle-promo="${activePromo.id}"><i class="bi bi-power me-1"></i>Desactivar</button>
            </div>
          </div>
        `;
      } else {
        modalContent.innerHTML = '';
      }
      // Agregar (o no) el formulario según la lógica de negocio
      modalContent.innerHTML += !activePromo ? `
        <div class='mb-2'><strong>Producto seleccionado:</strong> ${productName} (ID: ${productId})</div>
        <form id="promo-create-form">
          <div class="mb-2">
            <label for="promo_type" class="form-label">Tipo de promoción</label>
            <select id="promo_type" class="form-select" required>
              <option value="">Selecciona tipo</option>
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="precio_fijo">Precio fijo</option>
              <option value="2x1">2x1</option>
              <option value="3x2">3x2</option>
              <option value="nxm">N x M</option>
            </select>
          </div>
          <div class="mb-2">
            <label for="promo_value" class="form-label">Valor</label>
            <input type="number" id="promo_value" class="form-control" required min="0" step="0.01">
          </div>
          <div class="mb-2">
            <label for="promo_text" class="form-label">Texto visible</label>
            <input type="text" id="promo_text" class="form-control" maxlength="100">
          </div>
          <div class="mb-2">
            <label for="promo_start" class="form-label">Inicio</label>
            <input type="date" id="promo_start" class="form-control" required>
          </div>
          <div class="mb-2">
            <label for="promo_end" class="form-label">Fin</label>
            <input type="date" id="promo_end" class="form-control">
          </div>
          <div id="promo-create-status" class="mb-2"></div>
          <button type="submit" class="btn btn-success">Crear promoción</button>
        </form>
      ` : '';
      // Lógica de envío del formulario (solo si no hay promo activa)
      const form = promoModal.querySelector('#promo-create-form');
      if (form) {
        form.onsubmit = async function(ev) {
          ev.preventDefault();
          const statusEl = promoModal.querySelector('#promo-create-status');
          statusEl.textContent = '';
          const type = form.querySelector('#promo_type').value;
          const value = form.querySelector('#promo_value').value;
          const text = form.querySelector('#promo_text').value;
          const start = form.querySelector('#promo_start').value;
          const end = form.querySelector('#promo_end').value;
          if (!type || !value || !start) {
            statusEl.textContent = 'Completa todos los campos obligatorios.';
            statusEl.className = 'text-danger mb-2';
            return;
          }
          const payload = {
            product_id: parseInt(productId),
            promotion_type: type,
            parameter_value: value,
            visible_text: text,
            start_at: start + ' 00:00:00',
            end_at: end ? end + ' 00:00:00' : null
          };
          try {
            const res = await fetch('./api/admin/promociones', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.ok) {
              showToast('Promoción creada con éxito.', 'success');
              setTimeout(() => {
                if (promoModalInstance) promoModalInstance.hide();
              }, 1200);
              form.reset();
            } else {
              statusEl.textContent = data?.error?.message || 'Error al crear promoción.';
              statusEl.className = 'text-danger mb-2';
            }
          } catch (err) {
            statusEl.textContent = 'Error de red o servidor.';
            statusEl.className = 'text-danger mb-2';
          }
        };
      }
      promoModalInstance = new bootstrap.Modal(promoModal);
      promoModalInstance.show();
    }
  });

  loadProducts();
}
