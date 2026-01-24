<?php
/**
 * Vista de Promociones para Admin
 */
header('Content-Type: text/html; charset=utf-8');
?>
<!-- Vista de administración de promociones -->
<div>
  <!-- Loading inicial -->
  <div id="admin-promos-loading" class="admin-loading text-center py-5" aria-busy="true" aria-label="Cargando promociones">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="mt-3 text-muted">Cargando promociones...</p>
  </div>

  <!-- Contenido de promociones -->
  <div id="admin-promos-content" style="display: none;">
    <div class="admin-section-card">
      <div class="admin-section-header mb-3">
        <h2 class="admin-section-title"><i class="fas fa-tags me-2"></i>Gestión de Promociones</h2>
        <p class="admin-section-subtitle">Crea, edita y controla las promociones del catálogo.</p>
      </div>
      <!-- Tabla Desktop -->
      <div class="table-responsive d-none d-md-block admin-table-wrapper">
        <table class="table table-bordered align-middle" id="admin-promos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th class="col-secondary">Tipo</th>
              <th class="col-secondary">Valor</th>
              <th>Texto</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Filas inyectadas dinámicamente por JS -->
          </tbody>
        </table>
      </div>

      <!-- Cards Mobile -->
      <div class="d-md-none" id="admin-promos-cards">
        <!-- Cards inyectadas dinámicamente por JS -->
      </div>

      <!-- Paginación -->
      <div class="d-flex justify-content-center align-items-center admin-pagination">
        <button class="btn-pagination" id="admin-promos-prev" disabled>Anterior</button>
        <span id="admin-promos-page" class="mx-2"></span>
        <button class="btn-pagination" id="admin-promos-next" disabled>Siguiente</button>
      </div>
    </div>
  </div>
</div>