// Devuelve la base del proyecto hasta /public/
function getBasePath() {
  const path = window.location.pathname;
  const idx = path.indexOf('/public/');
  if (idx !== -1) {
    return path.substring(0, idx + 8); // incluye '/public/'
  }
  // Fallback profesional: usar origin + ruta absoluta del proyecto
  return window.location.origin + '/proyectos/Wine-Pick-QR-TFI/public/';
}
// utils para cargar y mostrar el modal de escáner QR reutilizable

export async function ensureQrModal() {
  let modal = document.getElementById('qr-modal');
  if (!modal) {
    const basePath = getBasePath();
    const url = basePath + 'views/qr-modal.php';
    const res = await fetch(url);
    const html = await res.text();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    document.body.appendChild(temp.firstElementChild);
    modal = document.getElementById('qr-modal');
  }
  return modal;
}

export async function showQrModal() {
  const modal = await ensureQrModal();
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  // Inicialización del lector QR (Html5Qrcode)
  let html5QrCode = null;
  const qrReaderEl = modal.querySelector('#qr-reader');
  const statusEl = modal.querySelector('#qr-status');
  const form = modal.querySelector('#qr-form');
  const codeInput = modal.querySelector('#qr-code');

  function setStatus(message, type = 'info') {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.type = type;
  }

  async function startScanner() {
    if (!window.Html5Qrcode || !qrReaderEl) {
      setStatus('No se pudo cargar el lector QR', 'error');
      return;
    }
    setStatus('Iniciando cámara...');
    html5QrCode = new Html5Qrcode(qrReaderEl.id);
    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setStatus('Código detectado: ' + decodedText, 'success');
          // Aquí puedes manejar el código detectado (ej: buscar producto)
          stopScanner();
          closeModal();
        },
        (err) => {
          // Ignorar errores de escaneo
        }
      );
      setStatus('Escanea un código QR');
    } catch (err) {
      setStatus('No se pudo acceder a la cámara', 'error');
    }
  }

  async function stopScanner() {
    if (html5QrCode) {
      try { await html5QrCode.stop(); } catch {}
      try { await html5QrCode.clear(); } catch {}
      html5QrCode = null;
    }
    if (qrReaderEl) qrReaderEl.innerHTML = '';
  }

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    stopScanner();
  }

  // Botón de cerrar
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Formulario manual
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const code = codeInput.value.trim();
      if (!code) {
        setStatus('Ingresá un código.', 'error');
        return;
      }
      setStatus('Buscando producto para: ' + code, 'info');
      // Aquí puedes manejar el código manual (ej: buscar producto)
      closeModal();
    };
  }

  // Iniciar el escáner al abrir el modal
  startScanner();
}
