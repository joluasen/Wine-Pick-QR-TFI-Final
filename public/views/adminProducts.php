<!-- Vista de administración de productos -->
<div>
  <!-- Loading inicial -->
  <div id="admin-products-loading" class="admin-loading text-center py-5" aria-busy="true" aria-label="Cargando productos">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="mt-3 text-muted">Cargando productos...</p>
  </div>

  <!-- Contenido de productos -->
  <div id="admin-products-content" style="display: none;">
    <div class="admin-section-card">
      <div class="admin-section-header mb-3">
        <h2 class="admin-section-title"><i class="fas fa-box-open me-2"></i>Gestión de Productos</h2>
        <p class="admin-section-subtitle">Crea, edita y administra el catálogo disponible en la app.</p>
      </div>
      <!-- Tabla Desktop -->
      <div class="table-responsive d-none d-md-block admin-table-wrapper">
        <table class="table table-bordered align-middle" id="admin-products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Bodega</th>
              <th>Precio</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Filas inyectadas dinámicamente por JS -->
          </tbody>
        </table>
      </div>

      <!-- Cards Mobile -->
      <div class="d-md-none" id="admin-products-cards">
        <!-- Cards inyectadas dinámicamente por JS -->
      </div>

      <!-- Paginación -->
      <div class="d-flex justify-content-center align-items-center admin-pagination">
        <button class="btn-pagination" id="admin-products-prev" disabled>Anterior</button>
        <span id="admin-products-page" class="mx-2"></span>
        <button class="btn-pagination" id="admin-products-next" disabled>Siguiente</button>
      </div>
    </div>
  </div>
</div>
