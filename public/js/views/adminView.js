// public/js/views/adminView.js
/**
 * Vista de administración
 * 
 * Gestión de productos y promociones
 */

import { setStatus, fetchJSON, getBasePath } from '../core/utils.js';

let lastQrData = null;

/**
 * Construye el link para el QR
 */
function buildQrLink(code) {
  if (!code) return '';
  const base = window.location.origin + getBasePath();
  return `${base}#search?query=${encodeURIComponent(code)}`;
}

/**
 * Renderiza el código QR
 */
function renderQr(qrRenderEl, qrTextEl) {
  if (!qrRenderEl || !lastQrData || typeof QRCode === 'undefined') return;
  
  const qrValue = lastQrData.link || buildQrLink(lastQrData.code);
  if (!qrValue) return;
  
  qrRenderEl.innerHTML = '';
  
  new QRCode(qrRenderEl, {
    text: qrValue,
    width: 220,
    height: 220,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });
  
  if (qrTextEl) {
    qrTextEl.textContent = `QR generado para ${lastQrData.code}`;
  }
}

/**
 * Cierra sesión y redirige
 */
async function logout(statusEl) {
  try {
    await fetch('./api/admin/logout', { method: 'POST' });
  } catch {
    // Ignorar errores de red
  }
  
  setStatus(statusEl, 'Sesión cerrada. Redirigiendo...', 'info');
  
  setTimeout(() => {
    window.location.hash = '#login';
  }, 300);
}

/**
 * Verifica autenticación
 */
async function checkAuth() {
  try {
    const response = await fetch('./api/admin/me', {
      headers: { Accept: 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Carga productos para el selector de promociones
 */
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

/**
 * Convierte fecha a formato SQL
 */
function dateToSQL(dateStr) {
  if (!dateStr) return null;
  return `${dateStr} 00:00:00`;
}

/**
 * Configura el formulario de productos
 */
function setupProductForm(container) {
  const form = container.querySelector('#product-create-form');
  const statusEl = container.querySelector('#product-create-status');
  const qrCard = container.querySelector('#product-qr-card');
  const qrRenderEl = container.querySelector('#product-qr-render');
  const qrTextEl = container.querySelector('#product-qr-text');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    
    setStatus(statusEl, 'Creando producto...', 'info');
    if (qrCard) qrCard.hidden = true;
    
    try {
      const data = await fetchJSON('./api/admin/productos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setStatus(statusEl, 'Producto creado con éxito.', 'success');
      form.reset();
      
      // Generar QR
      lastQrData = {
        code: data?.data?.public_code,
        link: data?.data?.qr_link
      };
      
      if (qrCard) qrCard.hidden = false;
      renderQr(qrRenderEl, qrTextEl);
      
    } catch (err) {
      if (err.status === 401) {
        setStatus(statusEl, 'Sesión expirada. Redirigiendo...', 'error');
        setTimeout(() => { window.location.hash = '#login'; }, 400);
      } else {
        setStatus(statusEl, `Error: ${err.message}`, 'error');
      }
    }
  });
  
  // Botones de QR
  const downloadBtn = container.querySelector('#qr-download-btn');
  const printBtn = container.querySelector('#qr-print-btn');
  const regenerateBtn = container.querySelector('#qr-regenerate-btn');
  
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const canvas = qrRenderEl?.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `qr-${lastQrData?.code || 'producto'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    });
  }
  
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
  
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => {
      renderQr(qrRenderEl, qrTextEl);
    });
  }
}

/**
 * Configura el formulario de promociones
 */
function setupPromoForm(container, selectEl) {
  const form = container.querySelector('#promotion-create-form');
  const statusEl = container.querySelector('#promotion-create-status');
  const typeSelect = container.querySelector('#promo_type');
  const valueInput = container.querySelector('#promo_value');
  const valueLabel = container.querySelector('label[for="promo_value"]');
  
  if (!form) return;
  
  // Actualizar label según tipo
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
    
    // Texto por defecto para combos
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
      
      // Recargar productos
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

/**
 * Configura los botones de logout
 */
function setupLogout(container, statusEl) {
  const logoutBtns = document.querySelectorAll('#logout-btn, #logout-btn-mobile');
  
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout(statusEl);
    });
  });
}

/**
 * Inicializa la vista de administración
 */
export async function initAdminView(container) {
  const statusEl = container.querySelector('#product-create-status');
  const promoSelect = container.querySelector('#promo_product_id');
  
  // Verificar autenticación
  const isAuth = await checkAuth();
  if (!isAuth) {
    setStatus(statusEl, 'No autenticado. Redirigiendo...', 'error');
    setTimeout(() => { window.location.hash = '#login'; }, 400);
    return;
  }
  
  // Cargar productos para selector
  await loadProducts(promoSelect);
  
  // Configurar formularios
  setupProductForm(container);
  setupPromoForm(container, promoSelect);
  setupLogout(container, statusEl);
}
