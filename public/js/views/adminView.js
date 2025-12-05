// public/js/views/adminView.js
/**
 * Controlador de la vista 'admin'
 *
 * Responsabilidad:
 * - Gestionar el formulario de alta de producto para administradores.
 * - Validar datos mínimos y enviar POST /api/admin/productos.
 * - Mostrar estados: en curso, éxito, error de validación o error general.
 * - Generar, descargar e imprimir el QR del producto creado.
 */
let lastQrData = null;

function setStatus(statusEl, message, type = 'info') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function clearForm(form) {
  if (!form) return;
  form.reset();
}

function buildQrLink(code) {
  if (!code) return '';
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
  return `${base}/#qr?code=${encodeURIComponent(code)}`;
}

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

function getQrDataUrl(qrRenderEl) {
  if (!qrRenderEl) return null;
  const canvas = qrRenderEl.querySelector('canvas');
  if (canvas && canvas.toDataURL) {
    return canvas.toDataURL('image/png');
  }
  return null;
}

function downloadQr(qrRenderEl) {
  const dataUrl = getQrDataUrl(qrRenderEl);
  if (!dataUrl || !lastQrData) return;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `qr-${lastQrData.code || 'producto'}.png`;
  link.click();
}

function printQr(qrRenderEl) {
  const dataUrl = getQrDataUrl(qrRenderEl);
  if (!dataUrl || !lastQrData) return;

  const win = window.open('', '_blank', 'width=400,height=480');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><title>Imprimir QR</title><img src="${dataUrl}" style="width:320px;height:320px;display:block;margin:16px auto;" alt="QR" />`);
  win.document.close();
  win.focus();
  win.print();
}

export function initAdminView(container) {
  const form = container.querySelector('#product-create-form');
  const statusEl = container.querySelector('#product-create-status');
  const qrCard = container.querySelector('#product-qr-card');
  const qrTextEl = container.querySelector('#product-qr-text');
  const qrRenderEl = container.querySelector('#product-qr-render');
  const qrDownloadBtn = container.querySelector('#qr-download-btn');
  const qrPrintBtn = container.querySelector('#qr-print-btn');
  const qrRegenerateBtn = container.querySelector('#qr-regenerate-btn');

  if (qrDownloadBtn) {
    qrDownloadBtn.addEventListener('click', () => downloadQr(qrRenderEl));
  }

  if (qrPrintBtn) {
    qrPrintBtn.addEventListener('click', () => printQr(qrRenderEl));
  }

  if (qrRegenerateBtn) {
    qrRegenerateBtn.addEventListener('click', () => renderQr(qrRenderEl, qrTextEl));
  }

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
        lastQrData = {
          code: payload.public_code,
          link: json?.data?.qr_link || buildQrLink(payload.public_code),
        };

        if (qrCard) {
          qrCard.hidden = false;
          renderQr(qrRenderEl, qrTextEl);
        }

        clearForm(form);
      } catch (err) {
        console.error('Error de red al crear producto', err);
        setStatus(statusEl, `Error al crear el producto: ${err.message}`, 'error');
      }
    });
  }
}
