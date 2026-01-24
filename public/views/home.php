
<?php
/**
 * Vista parcial: home.php
 * 
 * Descripción: fragmento HTML que representa la vista de inicio pública.
 * Muestra los productos más buscados como tarjetas interactivas, con paginación y estado dinámico.
 */
header('Content-Type: text/html; charset=utf-8');
?>

<section data-view="home">
  <!--
    Título y descripción de la sección de inicio
    Presenta el catálogo destacado de productos más consultados.
  -->
  <h2>Catálogo Destacado</h2>
  <p>Explorá nuestra selección de vinos y bebidas más consultadas.</p>

  <!--
    Estado dinámico de la sección
    Muestra mensajes de carga, error o vacío según corresponda.
  -->
  <div id="home-status" aria-live="polite"></div>

  <!--
    Resultados de productos destacados
    Aquí se inyectan dinámicamente las tarjetas de productos más buscados.
  -->
  <div id="home-results"></div>

  <!--
    Paginación de resultados
    Permite navegar entre páginas del catálogo destacado.
  -->
  <div id="home-pagination" style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;"></div>
</section>
