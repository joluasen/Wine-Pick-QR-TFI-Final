import { modalManager } from './modalManager.js';

// Modal QR exclusivo para admin
function showAdminQrModal() {
  // Crear contenido exclusivo para admin
  const content = `
    <div class="qr-scanner-modal admin">
      <h2 class="qr-title">Escanear Código QR (Admin)</h2>
      <p class="qr-subtitle">Apuntá la cámara al código QR del producto para editarlo.<br><strong>Solo administradores.</strong></p>
      <div id="qr-reader-admin" class="qr-reader"></div>
      <div id="qr-status-admin" class="qr-status" aria-live="polite"></div>
      <div id="qr-retry-container-admin" class="qr-retry-container" style="display: none;">
        <button id="qr-retry-btn-admin" class="btn-modal btn-modal-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          Abrir cámara
        </button>
      </div>
    </div>
  `;
  const modal = modalManager.open('admin-qr-modal', content);
  return modal;
}

// Variable para guardar el scanner y poder detenerlo
let adminScanner = null;

// Función para iniciar el escáner
async function initAdminScanner(modal) {
  const statusEl = modal.querySelector('#qr-status-admin');
  const retryContainer = modal.querySelector('#qr-retry-container-admin');
  const retryBtn = modal.querySelector('#qr-retry-btn-admin');

  // Configurar botón de reintentar
  if (retryBtn) {
    retryBtn.onclick = () => initAdminScanner(modal);
  }

  // Ocultar botón de reintentar al iniciar
  if (retryContainer) {
    retryContainer.style.display = 'none';
  }

  // Verificar que la librería esté disponible
  if (typeof Html5Qrcode === 'undefined') {
    if (statusEl) {
      statusEl.textContent = 'Error: Librería de QR no disponible';
      statusEl.dataset.type = 'error';
    }
    return;
  }

  // Mostrar mensaje de espera de permiso
  if (statusEl) {
    statusEl.textContent = 'Esperando permiso para acceder a la cámara...';
    statusEl.dataset.type = 'info';
  }

  // Probar acceso a la cámara antes de iniciar el escáner
  let testStream = null;
  try {
    testStream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Liberar el stream de prueba inmediatamente
    testStream.getTracks().forEach((track) => track.stop());
  } catch (err) {
    if (statusEl) {
      if (err && err.name === 'NotAllowedError') {
        statusEl.textContent = 'Permiso denegado para usar la cámara.';
      } else if (err && err.name === 'NotFoundError') {
        statusEl.textContent = 'No se encontró ninguna cámara en el dispositivo.';
      } else {
        statusEl.textContent = 'No se pudo acceder a la cámara.';
      }
      statusEl.dataset.type = 'error';
    }
    // Mostrar botón de reintentar
    if (retryContainer) {
      retryContainer.style.display = 'flex';
    }
    return;
  }

  // Si se obtuvo permiso, iniciar el escáner
  try {
    if (statusEl) {
      statusEl.textContent = 'Iniciando cámara...';
      statusEl.dataset.type = 'info';
    }

    adminScanner = new Html5Qrcode('qr-reader-admin');
    await adminScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        // Detener escáner y cerrar modal
        await adminScanner.stop();
        adminScanner.clear();
        adminScanner = null;
        modalManager.close();
        // Mostrar ficha admin
        const module = await import('../views/adminView.js');
        if (module && typeof module.editProductByCode === 'function') {
          module.editProductByCode(decodedText);
        } else {
          window.location.hash = '#admin-products';
          alert('Producto escaneado: ' + decodedText + '. Implementa editProductByCode para edición directa.');
        }
      },
      () => {}
    );
    if (statusEl) {
      statusEl.textContent = 'Escaneando... Enfocá el código QR';
      statusEl.dataset.type = 'info';
    }
  } catch (err) {
    console.error('Error iniciando QR scanner admin:', err);
    if (statusEl) {
      statusEl.textContent = 'No se pudo iniciar la cámara.';
      statusEl.dataset.type = 'error';
    }
    // Mostrar botón de reintentar
    if (retryContainer) {
      retryContainer.style.display = 'flex';
    }
  }
}

// Muestra el escáner QR para admin y al escanear busca el producto y muestra la ficha editable
export async function showAdminQrScanner() {
  // Modal exclusivo admin
  const modal = showAdminQrModal();
  // Iniciar escáner QR
  await initAdminScanner(modal);
}
