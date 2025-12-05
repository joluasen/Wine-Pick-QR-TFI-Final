// public/js/views/adminView.js
/**
 * Controlador de la vista 'admin'
 *
 * Responsabilidad:
 * - Gestionar el formulario de acceso de administradores dentro del
 *   contenedor proporcionado.
 * - Este módulo actúa como punto de extensión para integrar autenticación
 *   y navegación hacia el panel administrativo.
 */
let initialized = false;

export function initAdminView(container) {
  if (initialized) return;
  const form = container.querySelector('#product-create-form');
  const messages = container.querySelector('#admin-messages');

  function showMessage(text, type = 'info') {
    if (!messages) return;
    messages.textContent = text;
    messages.className = 'admin-message ' + type;
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      // Recolectar valores
      const data = {
        name: (container.querySelector('#p-name')?.value || '').trim(),
        winery_distillery: (container.querySelector('#p-winery')?.value || '').trim(),
        drink_type: (container.querySelector('#p-type')?.value || '').trim(),
        base_price: Number(container.querySelector('#p-price')?.value || 0),
        public_code: (container.querySelector('#p-code')?.value || '').trim(),
        varietal: (container.querySelector('#p-varietal')?.value || '').trim() || null,
        origin: (container.querySelector('#p-origin')?.value || '').trim() || null,
        vintage_year: container.querySelector('#p-year')?.value ? Number(container.querySelector('#p-year')?.value) : null,
        short_description: (container.querySelector('#p-desc')?.value || '').trim() || null,
        visible_stock: container.querySelector('#p-stock')?.value ? Number(container.querySelector('#p-stock')?.value) : null,
      };

      // Validaciones mínimas en cliente
      if (!data.name) {
        showMessage('El nombre del producto es obligatorio.', 'error');
        return;
      }

      if (!data.public_code) {
        showMessage('El código público (QR) es obligatorio.', 'error');
        return;
      }

      if (!isFinite(data.base_price) || data.base_price <= 0) {
        showMessage('El precio debe ser un número mayor que 0.', 'error');
        return;
      }

      showMessage('Enviando...', 'info');

      fetch('./api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then((r) => r.json())
        .then((json) => {
          if (!json.ok) {
            const msg = json.error?.message || 'Error al crear el producto';
            showMessage(msg, 'error');
            return;
          }

          showMessage('Producto creado correctamente.', 'success');
          // Limpiar formulario
          form.reset();
        })
        .catch((err) => {
          showMessage('Error de red: ' + err.message, 'error');
        });
    });
  }

  initialized = true;
}
