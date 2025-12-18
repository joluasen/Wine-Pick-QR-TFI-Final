<?php
/**
 * Vista parcial: home.php
 * Descripción: fragmento HTML que representa la vista de inicio.
 * Muestra los productos más buscados como tarjetas interactivas con paginación.
 */
header('Content-Type: text/html; charset=utf-8');
?>
<section data-view="home">
  <h2>Catálogo Destacado</h2>
  <p>Explorá nuestra selección de vinos y bebidas más consultadas.</p>

  <div id="home-status" aria-live="polite"></div>

  <div id="home-results"></div>

  <div id="home-pagination" style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;"></div>
</section>
