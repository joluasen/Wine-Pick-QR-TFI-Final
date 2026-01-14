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

  // Configurar manejo de imagen
  const imageInput = document.querySelector('#edit-product-image');
  const selectImageBtn = document.querySelector('#select-new-image-btn');
  const imageDisplay = document.querySelector('#edit-image-display');
  const currentProductImage = document.querySelector('#current-product-image');

  let uploadedImageUrl = null;
  let hasOriginalImage = product.image_url && product.image_url !== '0';
  const originalImageUrl = hasOriginalImage ? product.image_url : null;

  if (selectImageBtn && imageInput) {
    selectImageBtn.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showStatus('Solo se permiten imágenes JPG, PNG o WebP', 'error');
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showStatus('La imagen no debe superar 5MB', 'error');
        return;
      }

      // Preview instantáneo de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        imageDisplay.innerHTML = `<img src="${e.target.result}" alt="Preview" class="product-image-edit">`;
      };
      reader.readAsDataURL(file);

      // Subir imagen al servidor
      showStatus('Subiendo imagen...', 'info');
      selectImageBtn.disabled = true;
      selectImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Subiendo...';

      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('./api/admin/upload/product-image', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al subir la imagen');
        }

        uploadedImageUrl = data.data.url;

        // Actualizar la imagen en el display con la URL del servidor
        imageDisplay.innerHTML = `<img src="${uploadedImageUrl}" alt="Nueva imagen" class="product-image-edit">`;

        showStatus('Imagen cambiada. Recuerda guardar los cambios.', 'success');

      } catch (error) {
        showStatus(`Error al subir imagen: ${error.message}`, 'error');

        // Restaurar imagen original o placeholder
        if (currentProductImage) {
          imageDisplay.innerHTML = currentProductImage.outerHTML;
        } else {
          imageDisplay.innerHTML = `
            <div class="product-image-placeholder-edit">
              <i class="fas fa-image fa-4x text-muted"></i>
              <p class="text-muted mt-3">Sin imagen</p>
            </div>
          `;
        }
        uploadedImageUrl = null;
      } finally {
        selectImageBtn.disabled = false;
        selectImageBtn.innerHTML = '<i class="fas fa-camera me-2"></i>Cambiar imagen';
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

  // Mostrar diálogo para decidir qué hacer con la imagen anterior
  function showImageReplaceDialog() {
    return new Promise((resolve) => {
      const dialogHTML = `
        <div class="custom-dialog-overlay" id="image-replace-dialog">
          <div class="custom-dialog">
            <div class="custom-dialog-header">
              <h4 class="custom-dialog-title">¿Qué hacer con la imagen anterior?</h4>
            </div>
            <div class="custom-dialog-body">
              <p>Has seleccionado una nueva imagen. ¿Qué deseas hacer con la imagen anterior?</p>
            </div>
            <div class="custom-dialog-actions">
              <button type="button" class="btn-dialog btn-dialog-secondary" data-action="cancel">
                <i class="fas fa-times me-1"></i>Cancelar
              </button>
              <button type="button" class="btn-dialog btn-dialog-warning" data-action="keep">
                <i class="fas fa-save me-1"></i>Conservar
              </button>
              <button type="button" class="btn-dialog btn-dialog-danger" data-action="delete">
                <i class="fas fa-trash me-1"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      `;

      // Insertar el diálogo en el DOM
      document.body.insertAdjacentHTML('beforeend', dialogHTML);
      const dialog = document.getElementById('image-replace-dialog');

      // Manejar clics en los botones
      dialog.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (action) {
          dialog.remove();
          resolve(action); // 'cancel', 'keep', 'delete'
        }
      });
    });
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

    // Si se subió una nueva imagen y había una imagen original, preguntar qué hacer
    if (uploadedImageUrl && hasOriginalImage) {
      const userDecision = await showImageReplaceDialog();

      if (userDecision === 'cancel') {
        return; // El usuario canceló
      }

      payload.image_url = uploadedImageUrl;

      if (userDecision === 'delete') {
        payload.delete_old_image = 'true';
      } else {
        payload.delete_old_image = 'false';
      }
    } else if (uploadedImageUrl) {
      // Nueva imagen pero no había una anterior
      payload.image_url = uploadedImageUrl;
    }

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
