// public/js/views/adminView.js
/**
 * Controlador de la vista 'admin'
 *
 * - Verifica autenticación (requiere sesión admin)
 * - Envía POST /api/admin/productos para crear producto
 * - Muestra estados de carga, éxito y error
 * - Permite cerrar sesión
 */
let lastQrData = null;

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

async function logoutAndRedirect(statusEl) {
  try {
    await fetch('./api/admin/logout', { method: 'POST' });
  } catch (err) {
    // Ignorar error de red en logout
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

  // Botón de logout dinámico para no tocar la vista
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
}
