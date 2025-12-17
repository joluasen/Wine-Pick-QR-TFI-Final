<?php
// views/product-modal.php
header('Content-Type: text/html; charset=utf-8');
?>
<!-- Modal de ficha de producto reutilizable -->
<div id="product-modal" class="modal" style="display: none;">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <button class="modal-close" aria-label="Cerrar">&times;</button>
    <div id="modal-product-card"></div>
  </div>
</div>
