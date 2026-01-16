<!-- Vista de métricas administrativas -->
<section data-view="admin-metrics" class="metrics-view">
  <!-- Header con título y selector de período -->
  <div class="metrics-header">
    <div>
      <h2 class="admin-section-title"><i class="fas fa-chart-line me-2"></i>Métricas y Análisis</h2>
      <p class="admin-section-subtitle">Seguimiento de consultas y comportamiento de usuarios</p>
    </div>
    <div class="metrics-controls">
      <label class="metrics-label">Período:</label>
      <div class="period-buttons">
        <button class="period-btn" data-period="7">7 días</button>
        <button class="period-btn active" data-period="30">30 días</button>
        <button class="period-btn" data-period="90">90 días</button>
      </div>
    </div>
  </div>

  <!-- Estado de carga -->
  <div id="metrics-loading" class="metrics-loading-container">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="mt-3 text-muted">Cargando métricas...</p>
  </div>

  <!-- Contenido de métricas -->
  <div id="metrics-content" class="metrics-content-container" style="display: none;">

    <!-- KPIs Principales (3 columnas) -->
    <div class="metrics-kpis">
      <div class="kpi-card">
        <div class="kpi-icon qr">
          <i class="fas fa-qrcode"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Consultas QR</span>
          <span class="kpi-value" id="total-qr">0</span>
          <span class="kpi-percent" id="percent-qr-display">0%</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon search">
          <i class="fas fa-search"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Búsquedas</span>
          <span class="kpi-value" id="total-search">0</span>
          <span class="kpi-percent" id="percent-search-display">0%</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon total">
          <i class="fas fa-chart-bar"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Total Consultas</span>
          <span class="kpi-value" id="total-consultas">0</span>
          <span class="kpi-percent" id="daily-avg-display">0 diarias</span>
        </div>
      </div>
    </div>

    <!-- Gráfico diario (Chart.js) -->
    <div class="metrics-section">
      <div class="section-header">
        <h3><i class="fas fa-chart-area me-2"></i>Consultas diarias</h3>
        <span class="section-subtitle">Evolución de QR y Búsqueda por día</span>
      </div>
      <div class="daily-chart-card">
        <canvas id="daily-chart-canvas"></canvas>
      </div>
    </div>

    <!-- Dos columnas: Top Productos -->
    <div class="metrics-grid-1">
      <!-- Top 5 Productos -->
      <div class="metrics-section">
        <div class="section-header">
          <h3><i class="fas fa-star me-2"></i>Productos más consultados</h3>
        </div>
        <div id="top-products-chart" class="top-products-list"></div>
      </div>

    </div>

  </div>

  <!-- Error state -->
  <div id="metrics-error" style="display: none;">
    <div class="error-alert">
      <i class="fas fa-exclamation-circle"></i>
      <div>
        <h4>Error al cargar métricas</h4>
        <p id="metrics-error-message">No se pudieron cargar los datos. Intenta de nuevo.</p>
      </div>
      <button class="btn btn-sm btn-outline-primary" id="metrics-retry">
        <i class="fas fa-redo me-1"></i>Reintentar
      </button>
    </div>
  </div>

</section>
