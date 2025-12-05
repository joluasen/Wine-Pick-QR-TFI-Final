// public/js/views/qrView.js
/**
 * Controlador de la vista 'qr'
 *
 * Responsabilidad:
 * - Permitir al usuario ingresar un código (o futuro escaneo) y consultar la API.
 * - Mostrar estados de carga, error y resultado (ficha del producto).
 * - Recibe el contenedor DOM (la sección cargada) como argumento.
 */
function setStatus(el, message, type = 'info') {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

function getCodeFromHash() {
  const hash = window.location.hash || '';
  const match = hash.match(/code=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function renderProduct(resultEl, product) {
  if (!resultEl) return;
  const {
    name,
    winery_distillery,
    drink_type,
    varietal,
    base_price,
    short_description,
    public_code,
  } = product;

  const list = document.createElement('div');
  list.innerHTML = `
    <h3>${name || 'Producto'}</h3>
    <p><strong>Bodega / marca:</strong> ${winery_distillery || '—'}</p>
    <p><strong>Tipo / varietal:</strong> ${drink_type || '—'}${varietal ? ' · ' + varietal : ''}</p>
    <p><strong>Precio:</strong> $${base_price ?? '—'}</p>
    <p><strong>Código público:</strong> ${public_code || '—'}</p>
    <p><strong>Descripción:</strong> ${short_description || '—'}</p>
  `;

  resultEl.innerHTML = '';
  resultEl.appendChild(list);
}

export function initQrView(container) {
  const form = container.querySelector('#qr-form');
  const codeInput = container.querySelector('#qr-code');
  const statusEl = container.querySelector('#qr-status');
  const resultEl = container.querySelector('#qr-result');

  const submitLookup = async (code) => {
    if (!code) {
      setStatus(statusEl, 'Ingresá un código para consultar.', 'error');
      return;
    }

    setStatus(statusEl, 'Cargando producto...', 'info');
    if (resultEl) resultEl.innerHTML = '';

    try {
      const res = await fetch(`./api/public/productos/${encodeURIComponent(code)}`, {
        headers: { Accept: 'application/json' },
      });

      const json = await res.json().catch(() => null);

      if (res.status === 404) {
        setStatus(statusEl, 'Producto no disponible o código inválido.', 'error');
        return;
      }

      if (!res.ok || !json?.ok) {
        const msg = json?.error?.message || `Error HTTP ${res.status}`;
        setStatus(statusEl, `No se pudo obtener el producto: ${msg}`, 'error');
        return;
      }

      setStatus(statusEl, 'Producto encontrado.', 'success');
      renderProduct(resultEl, json.data);
    } catch (err) {
      setStatus(statusEl, `Error de red al consultar: ${err.message}`, 'error');
    }
  };

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const code = codeInput?.value?.trim();
      submitLookup(code);
    });
  }

  const codeFromHash = getCodeFromHash();
  if (codeFromHash && codeInput) {
    codeInput.value = codeFromHash;
    submitLookup(codeFromHash);
  }
}
