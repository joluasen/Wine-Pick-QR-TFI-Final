// public/js/views/qrView.js
/**
 * Controlador de la vista 'qr'
 *
 * Responsabilidad:
 * - Permitir escaneo de QR con cámara usando html5-qrcode
 * - Permitir al usuario ingresar un código manualmente y consultar la API
 * - Mostrar estados de carga, error y resultado (ficha del producto)
 */

let html5QrCode = null;

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
  list.classList.add('product-card');
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
  const startScanBtn = container.querySelector('#start-scan-btn');
  const stopScanBtn = container.querySelector('#stop-scan-btn');
  const qrReaderEl = container.querySelector('#qr-reader');

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

  // Manejar envío de formulario manual
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const code = codeInput?.value?.trim();
      submitLookup(code);
    });
  }

  // Inicializar escáner QR
  if (startScanBtn && stopScanBtn && qrReaderEl) {
    startScanBtn.addEventListener('click', async () => {
      try {
        if (!html5QrCode) {
          html5QrCode = new Html5Qrcode("qr-reader");
        }

        qrReaderEl.style.display = 'block';
        startScanBtn.style.display = 'none';
        stopScanBtn.style.display = 'inline-block';

        await html5QrCode.start(
          { facingMode: "environment" }, // Cámara trasera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // QR detectado exitosamente
            console.log('QR detectado:', decodedText);
            
            // Extraer el código del QR (puede ser una URL completa o solo el código)
            let code = decodedText;
            const match = decodedText.match(/code=([^&]+)/);
            if (match) {
              code = decodeURIComponent(match[1]);
            }

            // Detener el escáner
            html5QrCode.stop().then(() => {
              qrReaderEl.style.display = 'none';
              startScanBtn.style.display = 'inline-block';
              stopScanBtn.style.display = 'none';
              
              // Llenar el input y hacer la búsqueda
              if (codeInput) {
                codeInput.value = code;
              }
              submitLookup(code);
            });
          },
          (errorMessage) => {
            // Error de escaneo (normal mientras busca QR)
            // No mostrar estos errores al usuario
          }
        );

        setStatus(statusEl, 'Escáner activado. Enfoca un código QR.', 'info');
      } catch (err) {
        setStatus(statusEl, `Error al iniciar cámara: ${err}`, 'error');
        qrReaderEl.style.display = 'none';
        startScanBtn.style.display = 'inline-block';
        stopScanBtn.style.display = 'none';
      }
    });

    stopScanBtn.addEventListener('click', () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          qrReaderEl.style.display = 'none';
          startScanBtn.style.display = 'inline-block';
          stopScanBtn.style.display = 'none';
          setStatus(statusEl, 'Escáner detenido.', 'info');
        }).catch(err => {
          console.error('Error al detener escáner:', err);
        });
      }
    });
  }

  // Auto-buscar si viene código en hash
  const codeFromHash = getCodeFromHash();
  if (codeFromHash && codeInput) {
    codeInput.value = codeFromHash;
    submitLookup(codeFromHash);
  }
}
