<?php
/**
 * Vista parcial: promotions.php
 * 
 * Propósito: Listado de productos con promociones vigentes.
 * Muestra las ofertas y descuentos activos en la plataforma, con paginación y estado dinámico.
 */
?>

<section data-view="promotions">
  <!--
    Título y descripción de la sección de promociones
    Presenta las ofertas exclusivas disponibles para los usuarios.
  -->
  <h2>Ofertas Exclusivas</h2>
  <p>Aprovechá los mejores descuentos y promociones en vinos y bebidas.</p>

  <!--
    Estado dinámico de la sección
    Muestra mensajes de carga, error o vacío según corresponda.
  -->
  <div id="promos-status" aria-live="polite"></div>

  <!--
    Resultados de promociones
    Aquí se inyectan dinámicamente las tarjetas de productos en promoción.
  -->
  <div id="promos-results"></div>

  <!--
    Paginación de resultados
    Permite navegar entre páginas de promociones si hay muchas ofertas.
  -->
  <div id="promos-pagination" style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;"></div>
</section>
