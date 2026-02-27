
<!--
  Vista de métricas administrativas
  Esta sección muestra el panel de métricas y análisis para administradores, permitiendo visualizar KPIs, gráficos y rankings de productos consultados.
  Estructura general:
    - Header con título y selector de período
    - Estado de carga
    - Contenido de métricas (KPIs, gráficos, rankings)
    - Estado de error
-->
<section data-view="admin-metrics" class="metrics-view">
  <!--
    Encabezado de la vista de métricas
    Incluye el título principal, subtítulo y controles para seleccionar el período de análisis.
  -->
  <div class="metrics-header">
    <div>
      <h2 class="admin-section-title"><i class="fas fa-chart-line me-2"></i>Métricas y Análisis</h2>
      <p class="admin-section-subtitle">Seguimiento de consultas y comportamiento de usuarios</p>
    </div>
    <div class="metrics-controls">
      <label class="metrics-label">Período:</label>
      <div class="period-buttons">
        <!-- Botones para seleccionar el rango de días a analizar -->
        <button class="period-btn" data-period="7">7 días</button>
        <button class="period-btn active" data-period="30">30 días</button>
        <button class="period-btn" data-period="90">90 días</button>
      </div>
    </div>
  </div>

  <!--
    Estado de carga
    Se muestra mientras se obtienen los datos de métricas desde el backend.
  -->
  <div id="metrics-loading" class="metrics-loading-container">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="mt-3 text-muted">Cargando métricas...</p>
  </div>

  <!--
    Contenido principal de métricas
    Incluye KPIs, gráficos y rankings. Se oculta hasta que los datos están listos.
  -->
  <div id="metrics-content" class="metrics-content-container" style="display: none;">

    <!--
      KPIs principales
      Tarjetas con los indicadores clave: Consultas QR, Búsquedas y Total de Consultas.
    -->
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

    <!--
      Gráfico de consultas diarias
      Muestra la evolución diaria de consultas QR y búsquedas usando Chart.js.
    -->
    <div class="metrics-section">
      <div class="section-header">
        <h3><i class="fas fa-chart-area me-2"></i>Consultas diarias</h3>
        <span class="section-subtitle">Evolución de QR y Búsqueda por día</span>
      </div>
      <div class="daily-chart-card">
        <canvas id="daily-chart-canvas"></canvas>
      </div>
    </div>

    <!--
      Ranking de productos más consultados
      Muestra el top 5 de productos con más consultas en el período seleccionado.
    -->
    <div class="metrics-grid-1">
      <div class="metrics-section">
        <div class="section-header">
          <h3><i class="fas fa-star me-2"></i>Productos más consultados</h3>
        </div>
        <div id="top-products-chart" class="top-products-list"></div>
      </div>
    </div>

  </div>

  <!--
    Estado de error
    Se muestra si ocurre un error al cargar las métricas, permitiendo reintentar la operación.
  -->
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
