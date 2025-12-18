<?php
/**
 * Vista parcial: promotions.php
 * Propósito: Listado de productos con promociones vigentes.
 */
header('Content-Type: text/html; charset=utf-8');
?>
<section data-view="promotions">
  <h2>Ofertas Exclusivas</h2>
  <p>Aprovechá los mejores descuentos y promociones en vinos y bebidas.</p>

  <div id="promos-status" aria-live="polite"></div>

  <div id="promos-results"></div>

  <div id="promos-pagination" style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;"></div>
</section>
