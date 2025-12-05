// public/js/views/adminView.js
/**
 * Controlador de la vista 'admin'
 *
 * Responsabilidad:
 * - Gestionar el formulario de alta de producto para administradores.
 * - Validar datos mínimos y enviar POST /api/admin/productos.
 * - Mostrar estados: en curso, éxito, error de validación o error general.
 */
let initialized = false;

function setStatus(statusEl, message, type = 'info') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function clearForm(form) {
  if (!form) return;
  form.reset();
}

export function initAdminView(container) {
  if (initialized) return;

  const form = container.querySelector('#product-create-form');
  const statusEl = container.querySelector('#product-create-status');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      // Normalizar numéricos
      payload.base_price = payload.base_price ? Number(payload.base_price) : 0;
      payload.visible_stock = payload.visible_stock ? Number(payload.visible_stock) : null;
      payload.vintage_year = payload.vintage_year ? Number(payload.vintage_year) : null;

      // Validaciones mínimas en cliente
      if (!payload.name || payload.name.trim() === '') {
        setStatus(statusEl, 'El nombre es obligatorio.', 'error');
        return;
      }
      if (!payload.public_code || payload.public_code.trim() === '') {
        setStatus(statusEl, 'El código público / QR es obligatorio.', 'error');
        return;
      }
      if (!payload.base_price || Number.isNaN(payload.base_price) || payload.base_price <= 0) {
        setStatus(statusEl, 'El precio base debe ser mayor a 0.', 'error');
        return;
      }

      setStatus(statusEl, 'Creando producto...', 'info');

      try {
        const res = await fetch('./api/admin/productos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => null);
        console.log('Alta producto → status', res.status, 'json', json);

        if (!res.ok || !json?.ok) {
          const msg = json?.error?.message || `Error HTTP ${res.status}`;
          setStatus(statusEl, `No se pudo crear el producto: ${msg}`, 'error');
          return;
        }

        setStatus(statusEl, 'Producto creado correctamente.', 'success');
        clearForm(form);
      } catch (err) {
        console.error('Error de red al crear producto', err);
        setStatus(statusEl, `Error al crear el producto: ${err.message}`, 'error');
      }
    });
  }

  initialized = true;
}
