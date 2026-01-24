
<!--
  Vista de administración de productos
  Esta sección permite a los administradores gestionar el catálogo de productos de la app:
    - Visualización, edición y creación de productos
    - Tabla para escritorio y cards para móvil
    - Paginación y estado de carga
-->
<div>
  <!--
    Estado de carga inicial
    Se muestra mientras se obtienen los productos desde el backend.
  -->
  <div id="admin-products-loading" class="admin-loading text-center py-5" aria-busy="true" aria-label="Cargando productos">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="mt-3 text-muted">Cargando productos...</p>
  </div>

  <!--
    Contenido principal de productos
    Incluye la tabla de productos (desktop), cards (móvil) y controles de paginación.
    Se oculta hasta que los datos están listos.
  -->
  <div id="admin-products-content" style="display: none;">
    <div class="admin-section-card">
      <!--
        Encabezado de la sección de productos
        Incluye título y subtítulo descriptivo.
      -->
      <div class="admin-section-header mb-3">
        <h2 class="admin-section-title"><i class="fas fa-box-open me-2"></i>Gestión de Productos</h2>
        <p class="admin-section-subtitle">Crea, edita y administra el catálogo disponible en la app.</p>
      </div>
      <!--
        Tabla de productos para escritorio
        Muestra los productos en formato tabular con acciones disponibles.
        Las filas se inyectan dinámicamente por JavaScript.
      -->
      <div class="table-responsive d-none d-md-block admin-table-wrapper">
        <table class="table table-bordered align-middle" id="admin-products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th class="col-secondary">Tipo</th>
              <th class="col-secondary">Bodega</th>
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
        Cards de productos para móvil
        Cada card representa un producto y sus acciones. Se inyectan por JavaScript.
      -->
      <div class="d-md-none" id="admin-products-cards">
        <!-- Cards inyectadas dinámicamente por JS -->
      </div>

      <!--
        Controles de paginación
        Permiten navegar entre páginas de productos.
      -->
      <div class="d-flex justify-content-center align-items-center admin-pagination">
        <button class="btn-pagination" id="admin-products-prev" disabled>Anterior</button>
        <span id="admin-products-page" class="mx-2"></span>
        <button class="btn-pagination" id="admin-products-next" disabled>Siguiente</button>
      </div>
    </div>
  </div>
</div>
