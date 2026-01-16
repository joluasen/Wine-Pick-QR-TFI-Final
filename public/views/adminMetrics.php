<!-- Vista de métricas administrativas -->
<section data-view="admin-metrics">
  <h2>Métricas y Estadísticas</h2>
  
  <!-- Loading inicial -->
  <div id="metrics-loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="mt-3 text-muted">Cargando métricas...</p>
  </div>

  <!-- Contenido de métricas -->
  <div id="metrics-content" style="display: none;">

    <!-- Selector de período -->
    <div class="mb-3">
      <label for="metrics-period" class="form-label">Período:</label>
      <select id="metrics-period" class="form-select" style="max-width: 200px;">
        <option value="7">Últimos 7 días</option>
        <option value="30" selected>Últimos 30 días</option>
        <option value="90">Últimos 90 días</option>
      </select>
    </div>

    <!-- Resumen general -->
    <div class="table-responsive mb-4">
      <table class="table align-middle shadow rounded-4 overflow-hidden" style="background: #fff; border-radius: 1.2rem; font-size: 0.97rem;">
        <thead style="background: #7a003c; color: #fff;">
          <tr>
            <th>Total Consultas</th>
            <th>Consultas QR</th>
            <th>Búsqueda</th>
            <th>Productos Únicos</th>
          </tr>
        </thead>
        <tbody style="background: #fff;">
          <tr>
            <td id="total-consultas">0</td>
            <td><span id="consultas-qr">0</span> <small class="text-muted">(<span id="percent-qr">0</span>%)</small></td>
            <td><span id="consultas-busqueda">0</span> <small class="text-muted">(<span id="percent-busqueda">0</span>%)</small></td>
            <td id="productos-consultados">0</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Consultas por día -->
    <h3 class="h5 mb-3">Consultas por día</h3>
    <div class="table-responsive mb-4">
      <table class="table align-middle shadow rounded-4 overflow-hidden" style="background: #fff; border-radius: 1.2rem; font-size: 0.95rem;">
        <thead style="background: #7a003c; color: #fff;">
          <tr>
            <th>Fecha</th>
            <th>QR</th>
            <th>Búsqueda</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody id="daily-table-body" style="background: #fff;">
          <tr><td colspan="4">Cargando...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Productos más consultados -->
    <h3 class="h5 mb-3">Productos más consultados</h3>
    <div class="table-responsive mb-4">
      <table class="table align-middle shadow rounded-4 overflow-hidden" style="background: #fff; border-radius: 1.2rem; font-size: 0.95rem;">
        <thead style="background: #7a003c; color: #fff;">
          <tr>
            <th style="width: 50px;">#</th>
            <th>Producto</th>
            <th>Bodega</th>
            <th>QR</th>
            <th>Búsqueda</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody id="top-products-body" style="background: #fff;">
          <tr><td colspan="6">Cargando...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Resumen adicional -->
    <div class="table-responsive mb-4">
      <table class="table align-middle shadow rounded-4 overflow-hidden" style="background: #fff; border-radius: 1.2rem; font-size: 0.95rem;">
        <thead style="background: #7a003c; color: #fff;">
          <tr>
            <th>Promedio Diario</th>
            <th>Día Pico</th>
            <th>Producto Más Popular</th>
          </tr>
        </thead>
        <tbody style="background: #fff;">
          <tr>
            <td id="promedio-diario">0</td>
            <td id="dia-max">-</td>
            <td id="producto-top">-</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

  <!-- Error state -->
  <div id="metrics-error" class="text-center py-5" style="display: none;">
    <i class="fas fa-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
    <h3 class="mt-3">Error al cargar métricas</h3>
    <p id="metrics-error-message" class="text-muted">No se pudieron cargar las métricas. Intenta de nuevo.</p>
    <button class="btn btn-primary" id="metrics-retry">
      <i class="fas fa-redo me-2"></i>Reintentar
    </button>
  </div>
  
  <style>
  [data-view="admin-metrics"] table th, 
  [data-view="admin-metrics"] table td {
    vertical-align: middle;
    text-align: center;
    padding: 0.65rem 0.5rem;
  }
  [data-view="admin-metrics"] table tbody tr:hover {
    background: #f8e6ef !important;
  }
  [data-view="admin-metrics"] table th {
    font-weight: 600;
    letter-spacing: 0.03em;
  }
  </style>
</section>
