<?php
// views/qr-modal.php
header('Content-Type: text/html; charset=utf-8');
?>
<!-- Modal de escáner QR reutilizable -->
<div id="qr-modal" class="modal" style="display: none;">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <button class="modal-close" aria-label="Cerrar">&times;</button>
    <div id="qr-modal-body">
      <div style="font-size:1.5rem;color:#b30000;text-align:center;margin-bottom:1rem;">¡Hola, modal QR!</div>
      <div id="qr-reader"></div>
      <div id="qr-status" aria-live="polite"></div>
      <div id="qr-manual-input" style="margin-top:1rem;">
        <form id="qr-form">
          <input id="qr-code" name="qr_code" type="text" placeholder="Ingresá el código manualmente" required>
          <button type="submit" class="btn-primary">Buscar</button>
        </form>
      </div>
    </div>
  </div>
</div>
