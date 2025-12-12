// public/js/views/adminView.js
/**
 * Controlador de la vista 'admin'
 *
 * Responsabilidades:
 * - Verificar autenticación (requiere sesión admin válida)
 * - Gestionar alta de productos (POST /api/admin/productos)
 *   - Validación de campos requeridos
 *   - Generación y visualización de código QR
 *   - Manejo de errores y estados de carga
 * - Gestionar alta de promociones (POST /api/admin/promociones)
 *   - Soporte para tipos: porcentaje, precio_fijo, 2x1, 3x2, nxm
 *   - Validación de rango de fechas
 *   - Actualización dinámica del label según tipo seleccionado
 * - Permitir cierre de sesión con redirección a login
 * - Cargar y mantener lista de productos para seleccionar en promos
 */

let lastQrData = null; // Almacena datos del último QR generado

function setStatus(el, message, type = 'info') {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

function buildQrLink(code) {
  if (!code) return '';
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
  return `${base}/#qr?code=${encodeURIComponent(code)}`;
}

/**
 * Renderizar código QR usando librería QRCode.js
 * @param {HTMLElement} qrRenderEl - Contenedor donde dibujar el QR
 * @param {HTMLElement} qrTextEl - Elemento para mostrar texto descriptivo
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
    correctLevel: QRCode.CorrectLevel.M,
  });

  if (qrTextEl) {
    qrTextEl.textContent = `QR generado para ${lastQrData.code}`;
  }
}

/**
 * Cerrar sesión y redirigir al login
 * @param {HTMLElement} statusEl - Elemento donde mostrar confirmación
 */
async function logoutAndRedirect(statusEl) {
  try {
    await fetch('./api/admin/logout', { method: 'POST' });
  } catch (err) {
    // Ignorar error de red en logout (sesión ya se cierra server-side)
  }
  setStatus(statusEl, 'Sesión cerrada. Redirigiendo a login...', 'info');
  setTimeout(() => {
    window.location.hash = '#login';
  }, 300);
}

export async function initAdminView(container) {
  const form = container.querySelector('#product-create-form');
  const statusEl = container.querySelector('#product-create-status');
  const qrCard = container.querySelector('#product-qr-card');
  const qrRenderEl = container.querySelector('#product-qr-render');
  const qrTextEl = container.querySelector('#product-qr-text');

  // Elementos del formulario de promociones
  const promoForm = container.querySelector('#promotion-create-form');
  const promoStatusEl = container.querySelector('#promotion-create-status');
  const promoProductSelect = container.querySelector('#promo_product_id');
  const promoStartInput = container.querySelector('#promo_start');
  const promoEndInput = container.querySelector('#promo_end');

  // Crear botón de logout dinámicamente para mantener vista HTML sin cambios
  let logoutBtn = container.querySelector('#logout-btn');
  if (!logoutBtn) {
    logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.type = 'button';
    logoutBtn.textContent = 'Cerrar sesión';
    logoutBtn.style.marginBottom = '1rem';
    logoutBtn.addEventListener('click', () => logoutAndRedirect(statusEl));
    container.prepend(logoutBtn);
  }

  const checkAuth = async () => {
    try {
      const res = await fetch('./api/admin/me', { headers: { Accept: 'application/json' } });
      return res.ok;
    } catch (err) {
      return false;
    }
  };

  const isAuth = await checkAuth();
  if (!isAuth) {
    setStatus(statusEl, 'No autenticado. Redirigiendo a login...', 'error');
    setTimeout(() => { window.location.hash = '#login'; }, 400);
    return;
  }

  /**
   * Cargar lista de productos desde API y poblar select de promociones
   * Los productos se muestran con nombre y precio base
   */
  const loadProducts = async () => {
    try {
      const res = await fetch('./api/public/productos?search=.', {
        headers: { Accept: 'application/json' },
      });
      const json = await res.json().catch(() => null);

      if (json?.ok && json?.data?.products) {
        promoProductSelect.innerHTML = '<option value="">-- Selecciona un producto --</option>';
        json.data.products.forEach(product => {
          const option = document.createElement('option');
          option.value = product.id;
          option.textContent = `${product.name} ($${product.base_price})`;
          promoProductSelect.appendChild(option);
        });
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  };

  if (promoProductSelect) {
    await loadProducts();
  }

  /**
   * Convertir fecha HTML (YYYY-MM-DD) a formato DateTime SQL (YYYY-MM-DD 00:00:00)
   * @param {string} dateStr - Fecha en formato YYYY-MM-DD
   * @returns {string|null} DateTime con hora 00:00:00 o null si vacío
   */
  const dateToSQL = (dateStr) => {
    if (!dateStr) return null;
    return `${dateStr} 00:00:00`;
  };

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      setStatus(statusEl, 'Creando producto...', 'info');
      if (qrCard) qrCard.hidden = true;

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

        if (res.status === 401) {
          setStatus(statusEl, 'Sesión expirada. Inicia sesión nuevamente.', 'error');
          setTimeout(() => { window.location.hash = '#login'; }, 400);
          return;
        }

        if (!res.ok || !json?.ok) {
          const msg = json?.error?.message || `Error HTTP ${res.status}`;
          setStatus(statusEl, `No se pudo crear el producto: ${msg}`, 'error');
          return;
        }

        // Éxito
        setStatus(statusEl, 'Producto creado con éxito.', 'success');
        form.reset();

        // Guardar QR data y renderizar
        lastQrData = {
          code: json.data?.public_code,
          link: json.data?.qr_link,
        };
        if (qrCard) qrCard.hidden = false;
        renderQr(qrRenderEl, qrTextEl);
      } catch (err) {
        setStatus(statusEl, `Error de red: ${err.message}`, 'error');
      }
    });
  }

  /**
   * Manejador dinámico para cambios de tipo de promoción
   * Actualiza label, placeholder y step del input según tipo seleccionado
   */
  const promoTypeSelect = container.querySelector('#promo_type');
  const promo_value_input = container.querySelector('#promo_value');
  const promo_value_label = container.querySelector('label[for="promo_value"]');

  if (promoTypeSelect && promo_value_input && promo_value_label) {
    // Actualizar UI según tipo de promoción seleccionado
    const updateValueInputLabel = () => {
      const type = promoTypeSelect.value;
      const labelText = {
        'porcentaje': 'Porcentaje de descuento (0-100) *',
        'precio_fijo': 'Precio promocional (ARS) *',
        '2x1': 'Valor fijo (usa 1) *',
        '3x2': 'Valor fijo (usa 2) *',
        'nxm': 'M (pagas M de N unidades) *'
      }[type] || 'Valor / Precio promocional (ARS) *';

      const placeholders = {
        'porcentaje': 'Ej: 15 (para 15% de descuento)',
        'precio_fijo': 'Ej: 3999.99',
        '2x1': 'Ingresa 1 (pagas 1, llevas 2)',
        '3x2': 'Ingresa 2 (pagas 2, llevas 3)',
        'nxm': 'Ej: 2 (pagas 2, N lo aclaras en texto)'
      }[type] || 'Ingresa el valor';

      const stepValue = (type === 'porcentaje' || type === '2x1' || type === '3x2' || type === 'nxm') ? '1' : '0.01';

      promo_value_label.textContent = labelText;
      promo_value_input.placeholder = placeholders;
      promo_value_input.step = stepValue;
    };

    promoTypeSelect.addEventListener('change', updateValueInputLabel);
    updateValueInputLabel(); // Inicializar con el valor por defecto
  }

  /**
   * Manejador del envío del formulario de promociones
   * Valida datos, calcula fechas en formato SQL, y envía a API
   */
  if (promoForm) {
    promoForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const productId = promoProductSelect?.value;
      const type = promoForm.querySelector('#promo_type').value;
      const value = parseFloat(promoForm.querySelector('#promo_value').value);
      let text = promoForm.querySelector('#promo_text').value.trim();
      const startDate = promoForm.querySelector('#promo_start').value; // YYYY-MM-DD
      const endDate = promoForm.querySelector('#promo_end').value; // YYYY-MM-DD

      if (!productId || !type || !value || !text || !startDate) {
        setStatus(promoStatusEl, 'Completa todos los campos requeridos.', 'error');
        return;
      }

      // Validar que fecha fin >= fecha inicio si está presente
      if (endDate && endDate < startDate) {
        setStatus(promoStatusEl, 'La fecha de fin debe ser igual o posterior a la de inicio.', 'error');
        return;
      }

      const startAt = dateToSQL(startDate); // YYYY-MM-DD 00:00:00
      const endAt = endDate ? dateToSQL(endDate) : null;

      // Texto por defecto para combos si el admin no escribe uno
      if (!text) {
        if (type === '2x1') text = 'Llevate 2 y pagas 1';
        else if (type === '3x2') text = 'Llevate 3 y pagas 2';
        else if (type === 'nxm') text = 'Combo NxM';
      }

      const payload = {
        product_id: parseInt(productId),
        promotion_type: type,
        parameter_value: value,
        visible_text: text,
        start_at: startAt,
        end_at: endAt,
      };

      setStatus(promoStatusEl, 'Creando promoción...', 'info');

      try {
        const res = await fetch('./api/admin/promociones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => null);

        if (res.status === 401) {
          setStatus(promoStatusEl, 'Sesión expirada. Inicia sesión nuevamente.', 'error');
          setTimeout(() => { window.location.hash = '#login'; }, 400);
          return;
        }

        if (!res.ok || !json?.ok) {
          const msg = json?.error?.message || `Error HTTP ${res.status}`;
          setStatus(promoStatusEl, `No se pudo crear la promoción: ${msg}`, 'error');
          return;
        }

        setStatus(promoStatusEl, 'Promoción creada con éxito.', 'success');
        promoForm.reset();
        
        // Recargar productos para actualizar el select
        await loadProducts();
      } catch (err) {
        setStatus(promoStatusEl, `Error de red: ${err.message}`, 'error');
      }
    });
  }
}