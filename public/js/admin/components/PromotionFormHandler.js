/**
 * PromotionFormHandler.js
 * Componente para manejar formularios de promociones (crear/editar)
 */

import { setStatus } from '../../core/utils.js';
import { createPromotion } from '../services/promotionService.js';
import { getAllProducts } from '../services/productService.js';
import { dateToSQL } from '../utils/dateHelpers.js';
import { redirectToLogin } from '../services/authService.js';

/**
 * Carga productos en un select
 * @param {HTMLSelectElement} selectEl - Elemento select
 */
export async function loadProductsIntoSelect(selectEl) {
  if (!selectEl) return;

  try {
    const products = await getAllProducts();

    selectEl.innerHTML = '<option value="">-- Selecciona un producto --</option>';

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

/**
 * Configura el formulario de creación de promociones
 * @param {HTMLElement} container - Contenedor del formulario
 * @param {HTMLSelectElement} selectEl - Select de productos
 * @param {Function} onSuccess - Callback opcional cuando se crea exitosamente
 */
export function setupPromotionCreateForm(container, selectEl, onSuccess = null) {
  const form = container.querySelector('#promotion-create-form');
  const statusEl = container.querySelector('#promotion-create-status');
  const typeSelect = container.querySelector('#promo_type');
  const valueInput = container.querySelector('#promo_value');
  const valueLabel = container.querySelector('label[for="promo_value"]');

  if (!form) return;

  // Actualizar label dinámicamente según el tipo
  setupDynamicLabels(typeSelect, valueInput, valueLabel);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = selectEl?.value;
    const type = typeSelect?.value;
    const value = parseFloat(valueInput?.value);
    let text = form.querySelector('#promo_text')?.value?.trim();
    const startDate = form.querySelector('#promo_start')?.value;
    const endDate = form.querySelector('#promo_end')?.value;

    // Validaciones
    if (!productId || !type || !value || !text || !startDate) {
      setStatus(statusEl, 'Completá todos los campos requeridos.', 'error');
      return;
    }

    if (endDate && endDate < startDate) {
      setStatus(statusEl, 'La fecha de fin debe ser posterior a la de inicio.', 'error');
      return;
    }

    // Texto por defecto para combos
    if (!text) {
      const defaults = {
        '2x1': 'Llevas 2 y pagas 1',
        '3x2': 'Llevas 3 y pagas 2',
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
      await createPromotion(payload);

      setStatus(statusEl, 'Promoción creada con éxito.', 'success');
      form.reset();

      // Recargar productos
      await loadProductsIntoSelect(selectEl);

      if (onSuccess) onSuccess();

    } catch (err) {
      if (err.status === 401) {
        setStatus(statusEl, 'Sesión expirada. Redirigiendo...', 'error');
        setTimeout(redirectToLogin, 400);
      } else {
        setStatus(statusEl, `Error: ${err.message}`, 'error');
      }
    }
  });
}

/**
 * Configura labels dinámicos según el tipo de promoción
 * @param {HTMLSelectElement} typeSelect - Select de tipo
 * @param {HTMLInputElement} valueInput - Input de valor
 * @param {HTMLLabelElement} valueLabel - Label del valor
 */
function setupDynamicLabels(typeSelect, valueInput, valueLabel) {
  if (!typeSelect || !valueInput || !valueLabel) return;

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
