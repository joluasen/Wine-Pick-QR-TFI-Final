/**
 * ProductFormHandler.js
 * Componente para manejar formularios de productos (crear/editar)
 */

import { setStatus, getBasePath } from '../../core/utils.js';
import { createProduct, updateProduct } from '../services/productService.js';
import { redirectToLogin } from '../services/authService.js';

/**
 * Construye el link para el QR
 * @param {string} code - Código público
 * @returns {string}
 */
function buildQrLink(code) {
  if (!code) return '';
  const base = window.location.origin + getBasePath();
  return `${base}#search?query=${encodeURIComponent(code)}`;
}

/**
 * Renderiza el código QR
 * @param {HTMLElement} qrRenderEl - Elemento para renderizar
 * @param {HTMLElement} qrTextEl - Elemento para el texto
 * @param {Object} qrData - { code, link }
 */
function renderQr(qrRenderEl, qrTextEl, qrData) {
  if (!qrRenderEl || !qrData || typeof QRCode === 'undefined') return;

  const qrValue = qrData.link || buildQrLink(qrData.code);
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
    qrTextEl.textContent = `QR generado para ${qrData.code}`;
  }
}

/**
 * Configura el formulario de creación de productos
 * @param {HTMLElement} container - Contenedor del formulario
 * @param {Function} onSuccess - Callback opcional cuando se crea exitosamente
 */
export function setupProductCreateForm(container, onSuccess = null) {
  const form = container.querySelector('#product-create-form');
  const statusEl = container.querySelector('#product-create-status');
  const qrCard = container.querySelector('#product-qr-card');
  const qrRenderEl = container.querySelector('#product-qr-render');
  const qrTextEl = container.querySelector('#product-qr-text');

  if (!form) return;

  let lastQrData = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    setStatus(statusEl, 'Creando producto...', 'info');
    if (qrCard) qrCard.hidden = true;

    try {
      const data = await createProduct(payload);

      setStatus(statusEl, 'Producto creado con éxito.', 'success');
      form.reset();

      // Generar QR
      lastQrData = {
        code: data?.data?.public_code,
        link: data?.data?.qr_link
      };

      if (qrCard) qrCard.hidden = false;
      renderQr(qrRenderEl, qrTextEl, lastQrData);

      if (onSuccess) onSuccess(data);

    } catch (err) {
      if (err.status === 401) {
        setStatus(statusEl, 'Sesión expirada. Redirigiendo...', 'error');
        setTimeout(redirectToLogin, 400);
      } else {
        setStatus(statusEl, `Error: ${err.message}`, 'error');
      }
    }
  });

  // Botones de QR
  setupQrButtons(container, qrRenderEl, () => lastQrData);
}

/**
 * Configura el formulario de edición de productos
 * @param {HTMLFormElement} form - Formulario de edición
 * @param {Object} product - Producto a editar
 * @param {Function} onSuccess - Callback cuando se actualiza exitosamente
 */
export function setupProductEditForm(form, product, onSuccess = null) {
  if (!form) return;

  // Referencias a elementos del formulario
  const statusEl = form.querySelector('#edit-form-status');
  const submitBtn = form.querySelector('#save-product-btn');
  const descriptionTextarea = form.querySelector('#edit-description');
  const charCountSpan = form.querySelector('#char-count');

  // Configurar contador de caracteres
  if (descriptionTextarea && charCountSpan) {
    descriptionTextarea.addEventListener('input', () => {
      const length = descriptionTextarea.value.length;
      charCountSpan.textContent = length;

      // Cambiar color cuando se acerca al límite
      const counterEl = charCountSpan.parentElement;
      if (length > 180) {
        counterEl.classList.add('text-warning');
        counterEl.classList.remove('text-muted');
      } else if (length === 200) {
        counterEl.classList.add('text-danger');
        counterEl.classList.remove('text-warning', 'text-muted');
      } else {
        counterEl.classList.add('text-muted');
        counterEl.classList.remove('text-warning', 'text-danger');
      }
    });
  }

  // Mostrar mensaje de estado
  function showStatus(message, type) {
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `alert mb-3`;

    switch(type) {
      case 'success':
        statusEl.classList.add('alert-success');
        break;
      case 'error':
        statusEl.classList.add('alert-danger');
        break;
      case 'info':
        statusEl.classList.add('alert-info');
        break;
    }

    statusEl.classList.remove('d-none');
  }

  // Ocultar mensaje de estado
  function hideStatus() {
    if (statusEl) {
      statusEl.classList.add('d-none');
    }
  }

  // Manejar envío del formulario
  form.onsubmit = async (e) => {
    e.preventDefault();

    // Validación HTML5
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      showStatus('Por favor, complete todos los campos requeridos correctamente', 'error');
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // Deshabilitar botón de envío
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Guardando...';
    }

    hideStatus();

    try {
      await updateProduct(product.id, payload);

      showStatus('Producto actualizado con éxito', 'success');
      form.classList.remove('was-validated');

      // Esperar un momento antes de cerrar
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 800);

    } catch (err) {
      if (err.status === 401) {
        showStatus('Sesión expirada. Redirigiendo al login...', 'error');
        setTimeout(redirectToLogin, 1500);
      } else {
        showStatus(`Error al actualizar: ${err.message}`, 'error');
      }

      // Rehabilitar botón
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Guardar cambios';
      }
    }
  };

  // Limpiar validación al escribir
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.checkValidity()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
      } else {
        input.classList.remove('is-valid');
      }
    });
  });
}

/**
 * Configura los botones de QR (descargar, imprimir, regenerar)
 * @param {HTMLElement} container - Contenedor
 * @param {HTMLElement} qrRenderEl - Elemento del QR
 * @param {Function} getQrData - Función que retorna los datos del QR
 */
function setupQrButtons(container, qrRenderEl, getQrData) {
  const downloadBtn = container.querySelector('#qr-download-btn');
  const printBtn = container.querySelector('#qr-print-btn');
  const regenerateBtn = container.querySelector('#qr-regenerate-btn');
  const qrTextEl = container.querySelector('#product-qr-text');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const canvas = qrRenderEl?.querySelector('canvas');
      if (canvas) {
        const qrData = getQrData();
        const link = document.createElement('a');
        link.download = `qr-${qrData?.code || 'producto'}.png`;
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
      const qrData = getQrData();
      if (qrData) {
        renderQr(qrRenderEl, qrTextEl, qrData);
      }
    });
  }
}
