import { modalManager } from './modalManager.js';

// Modal QR exclusivo para admin
function showAdminQrModal(onResult) {
  // Crear contenido exclusivo para admin
  const content = `
    <div class="qr-scanner-modal admin">
      <h2 class="qr-title">Escanear Código QR (Admin)</h2>
      <p class="qr-subtitle">Apuntá la cámara al código QR del producto para editarlo.<br><strong>Solo administradores.</strong></p>
      <div id="qr-reader-admin" class="qr-reader"></div>
      <div id="qr-status-admin" class="qr-status" aria-live="polite"></div>
      <div class="qr-manual">
        <p class="qr-manual-label">¿No podés escanear? Ingresá el código manualmente:</p>
        <form id="qr-manual-form-admin" class="qr-manual-form">
          <input
            type="text"
            id="qr-manual-input-admin"
            name="code"
            placeholder="Ej: MALBEC-001"
            required
            autocomplete="off"
          >
          <button type="submit" class="btn-primary">Buscar</button>
        </form>
      </div>
    </div>
  `;
  const modal = modalManager.open('admin-qr-modal', content);
  // Setup del formulario manual
  const form = modal.querySelector('#qr-manual-form-admin');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = form.querySelector('#qr-manual-input-admin')?.value?.trim();
      if (code) {
        modalManager.close();
        const module = await import('../views/adminView.js');
        if (module && typeof module.editProductByCode === 'function') {
          module.editProductByCode(code);
        }
      }
    });
  }
  return modal;
}

// Muestra el escáner QR para admin y al escanear busca el producto y muestra la ficha editable

export async function showAdminQrScanner() {
  // Modal exclusivo admin
  const modal = showAdminQrModal(async (code) => {
    // callback no usado aquí, se maneja abajo
  });
  // Iniciar escáner QR en el contenedor admin
  const statusEl = modal.querySelector('#qr-status-admin');
  let scanner;
  try {
    scanner = new Html5Qrcode('qr-reader-admin');
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        // Detener escáner y cerrar modal
        await scanner.stop();
        scanner.clear();
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
    if (statusEl) {
      statusEl.textContent = 'No se pudo acceder a la cámara. Usá el ingreso manual.';
      statusEl.dataset.type = 'error';
    }
  }
}
