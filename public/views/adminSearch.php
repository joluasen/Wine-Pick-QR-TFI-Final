
<?php
/**
 * Vista parcial: adminSearch.php
 * 
 * Descripción: Vista de resultados de búsqueda en contexto administrador.
 * Permite visualizar los productos encontrados, con soporte para escritorio y móvil.
 */
header('Content-Type: text/html; charset=utf-8');
?>

<section data-view="adminSearch">
  <!--
    Estado de carga inicial
    Se muestra mientras se realiza la búsqueda de productos.
  -->
  <div id="admin-search-loading" class="admin-loading text-center py-5" aria-busy="true" aria-label="Buscando productos">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Buscando...</span>
    </div>
    <p class="mt-3 text-muted">Buscando productos...</p>
  </div>

  <!--
    Contenido de resultados de búsqueda
    Incluye tabla (desktop), cards (móvil) y controles de paginación.
    Se oculta hasta que los datos están listos.
  -->
  <div id="admin-search-content" style="display: none;">
    <div class="admin-section-card">
      <!--
        Encabezado de la sección de resultados
        Muestra el término buscado y el título.
      -->
      <div class="admin-section-header mb-3">
        <h2 class="admin-section-title" id="admin-search-title">
          <i class="fas fa-search me-2"></i>Resultados de búsqueda
        </h2>
        <p class="admin-section-subtitle">Mostrando resultados para: <strong id="admin-search-query"></strong></p>
      </div>

      <!--
        Tabla de resultados para escritorio
        Muestra los productos encontrados en formato tabular.
        Las filas se inyectan dinámicamente por JavaScript.
      -->
      <div class="table-responsive d-none d-md-block admin-table-wrapper">
        <table class="table table-bordered align-middle" id="admin-search-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Bodega</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Filas inyectadas dinámicamente por JS -->
          </tbody>
        </table>
      </div>

      <!--
        Cards de resultados para móvil
        Cada card representa un producto encontrado. Se inyectan por JavaScript.
      -->
      <div class="d-md-none" id="admin-search-cards">
        <!-- Cards inyectadas dinámicamente por JS -->
      </div>

      <!--
        Controles de paginación
        Permiten navegar entre páginas de resultados.
      -->
      <div class="d-flex justify-content-center align-items-center admin-pagination">
        <button class="btn-pagination" id="admin-search-prev" disabled>Anterior</button>
        <span id="admin-search-page" class="mx-2"></span>
        <button class="btn-pagination" id="admin-search-next" disabled>Siguiente</button>
      </div>
    </div>
  </div>

  <!--
    Estado vacío
    Se muestra cuando no hay resultados o no se ha realizado una búsqueda.
  -->
  <div id="admin-search-empty" style="display: none;">
    <div class="empty-search text-center py-5">
      <i class="fas fa-search fa-3x text-muted mb-3"></i>
      <h3>Buscar Productos</h3>
      <p class="text-muted">Usá el buscador del header para encontrar productos.</p>
    </div>
  </div>
</section>