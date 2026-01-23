<?php
/**
 * Vista parcial: adminSearch.php
 * Descripción: Vista de resultados de búsqueda en contexto administrador
 */
header('Content-Type: text/html; charset=utf-8');
?>
<section data-view="adminSearch">
  <!-- Loading inicial -->
  <div id="admin-search-loading" class="admin-loading text-center py-5" aria-busy="true" aria-label="Buscando productos">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Buscando...</span>
    </div>
    <p class="mt-3 text-muted">Buscando productos...</p>
  </div>

  <!-- Contenido de resultados -->
  <div id="admin-search-content" style="display: none;">
    <div class="admin-section-card">
      <div class="admin-section-header mb-3">
        <h2 class="admin-section-title" id="admin-search-title">
          <i class="fas fa-search me-2"></i>Resultados de búsqueda
        </h2>
        <p class="admin-section-subtitle">Mostrando resultados para: <strong id="admin-search-query"></strong></p>
      </div>

      <!-- Tabla Desktop -->
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

      <!-- Cards Mobile -->
      <div class="d-md-none" id="admin-search-cards">
        <!-- Cards inyectadas dinámicamente por JS -->
      </div>

      <!-- Paginación -->
      <div class="d-flex justify-content-center align-items-center admin-pagination">
        <button class="btn-pagination" id="admin-search-prev" disabled>Anterior</button>
        <span id="admin-search-page" class="mx-2"></span>
        <button class="btn-pagination" id="admin-search-next" disabled>Siguiente</button>
      </div>
    </div>
  </div>

  <!-- Estado vacío -->
  <div id="admin-search-empty" style="display: none;">
    <div class="empty-search text-center py-5">
      <i class="fas fa-search fa-3x text-muted mb-3"></i>
      <h3>Buscar Productos</h3>
      <p class="text-muted">Usá el buscador del header para encontrar productos.</p>
    </div>
  </div>
</section>