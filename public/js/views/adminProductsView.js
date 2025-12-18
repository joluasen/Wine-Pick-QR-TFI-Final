// public/js/views/adminProductsView.js
import { setupLogout } from './adminView.js';

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
      <td><button class="btn btn-sm btn-primary" data-edit-product="${p.id}">Editar</button></td>
    </tr>
  `).join('');
}

export async function initAdminProductsView(container) {
  container.innerHTML = `
    <h2>Gestión de Productos</h2>
    <div id="admin-products-status" class="mb-2"></div>
    <table class="table table-striped" id="admin-products-table">
      <thead>
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
    <div class="d-flex justify-content-between align-items-center mt-2">
      <button class="btn btn-secondary" id="admin-products-prev">Anterior</button>
      <span id="admin-products-page"></span>
      <button class="btn btn-secondary" id="admin-products-next">Siguiente</button>
    </div>
    <div class="mt-3"><button class="btn btn-outline-danger" id="logout-btn">Cerrar sesión</button></div>
  `;

  setupLogout(container);

  let page = 1;
  let limit = 20;
  let total = 0;

  async function loadProducts() {
    const status = container.querySelector('#admin-products-status');
    const tbody = container.querySelector('#admin-products-table tbody');
    status.textContent = '';
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
    } catch (err) {
      status.textContent = 'Error al cargar productos: ' + err.message;
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

  await loadProducts();
}
