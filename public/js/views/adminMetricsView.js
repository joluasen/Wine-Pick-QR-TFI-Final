/**
 * adminMetricsView.js - REFACTORIZADO 100%
 * Vista de métricas con gráficos informativos
 */

import { getMetrics } from '../admin/services/metricService.js';
import { showToast } from '../admin/components/Toast.js';

export async function initAdminMetricsView(container) {
  // Referencias del DOM
  const loadingEl = document.getElementById('metrics-loading');
  const contentEl = document.getElementById('metrics-content');
  const errorEl = document.getElementById('metrics-error');
  const periodButtons = document.querySelectorAll('.period-btn');
  const retryBtn = document.getElementById('metrics-retry');

  let currentPeriod = 30;
  let dailyChartInstance = null;

  // Funciones de estado
  function showLoading() {
    loadingEl.style.display = 'block';
    contentEl.style.display = 'none';
    errorEl.style.display = 'none';
  }

  function showContent() {
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
    errorEl.style.display = 'none';
  }

  function showError(message) {
    loadingEl.style.display = 'none';
    contentEl.style.display = 'none';
    errorEl.style.display = 'block';
    const errorMsg = document.getElementById('metrics-error-message');
    if (errorMsg) errorMsg.textContent = message;
  }

  // Formateadores
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Renderizar KPIs principales
  function renderKPIs(summary, averageDaily = null, periodDays = null) {
    const total = summary.total || 0;
    const qr = summary.qr_count || 0;
    const search = summary.search_count || 0;
    // Promedio diario: usar el valor del backend si está disponible;
    // como fallback, dividir por el período seleccionado si se pasó, o por 30.
    const computedDaily = (() => {
      if (typeof averageDaily === 'number') return averageDaily;
      const divisor = periodDays && periodDays > 0 ? periodDays : 30;
      return total > 0 ? (total / divisor) : 0;
    })();

    document.getElementById('total-qr').textContent = qr.toLocaleString('es-AR');
    document.getElementById('total-search').textContent = search.toLocaleString('es-AR');
    document.getElementById('total-consultas').textContent = total.toLocaleString('es-AR');

    // Porcentajes
    const percentQR = total > 0 ? Math.round((qr / total) * 100) : 0;
    const percentSearch = total > 0 ? Math.round((search / total) * 100) : 0;

    document.getElementById('percent-qr-display').textContent = `${percentQR}%`;
    document.getElementById('percent-search-display').textContent = `${percentSearch}%`;
    document.getElementById('daily-avg-display').textContent = `${Math.round(computedDaily)} diarias`;
  }

  // (Se elimina stub obsoleto de renderDailyChart)

  // Gráfico de distribución QR vs Búsqueda
  function renderDistributionChart(summary) {
    const container = document.getElementById('distribution-chart');
    if (!container) return;

    const qr = summary.qr_count || 0;
    const search = summary.search_count || 0;
    const total = qr + search;

    if (total === 0) {
      container.innerHTML = '<p style="text-align:center;padding:1rem;color:#999;">Sin datos</p>';
      return;
    }

    const qrPercent = (qr / total) * 100;
    const searchPercent = (search / total) * 100;

    container.innerHTML = `
      <div class="distribution-bars">
        <div class="distribution-bar-item">
          <span class="distribution-label"><i class="fas fa-qrcode" style="color:#4A0E1A;"></i> QR</span>
          <div class="distribution-bar-track">
            <div class="distribution-bar-fill" style="width: ${qrPercent}%">${Math.round(qrPercent)}%</div>
          </div>
          <span class="distribution-percent">${qr}</span>
        </div>
        <div class="distribution-bar-item">
          <span class="distribution-label"><i class="fas fa-search" style="color:#6B0F2A;"></i> Búsqueda</span>
          <div class="distribution-bar-track">
            <div class="distribution-bar-fill" style="width: ${searchPercent}%; background: linear-gradient(90deg, #8B1F3A 0%, #A52740 100%);">${Math.round(searchPercent)}%</div>
          </div>
          <span class="distribution-percent">${search}</span>
        </div>
      </div>
    `;
  }

  // Top 5 productos con gráfico
  function renderTopProductsChart(products) {
    const container = document.getElementById('top-products-chart');
    if (!container) return;

    // Crear 5 items, rellenar con vacíos si hay menos de 5
    const topFive = products && products.length > 0 ? products.slice(0, 5) : [];
    const filledArray = Array(5).fill(null).map((_, idx) => topFive[idx] || null);

    container.innerHTML = filledArray.map((p, idx) => {
      if (!p) {
        return `
          <div class="top-product-item empty">
            <div class="top-product-rank">${idx + 1}</div>
            <div class="top-product-info">
              <div class="top-product-name">-</div>
              <div class="top-product-winery">-</div>
            </div>
            <div class="top-product-value">
              <div class="top-product-count">-</div>
              <div class="top-product-detail">-</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="top-product-item">
          <div class="top-product-rank">${idx + 1}</div>
          <div class="top-product-info">
            <div class="top-product-name">${escapeHtml(p.name || '-').substring(0, 35)}</div>
            <div class="top-product-winery">${escapeHtml(p.winery || 'Sin bodega').substring(0, 30)}</div>
          </div>
          <div class="top-product-value">
            <div class="top-product-count">${p.total || 0}</div>
            <div class="top-product-detail">QR: ${p.qr_count || 0} | Búsqueda: ${p.search_count || 0}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Gráfico diario (Chart.js)
  function renderDailyChart(dailyData) {
    const canvas = document.getElementById('daily-chart-canvas');
    if (!canvas || !window.Chart) return;

    const labels = (dailyData || []).map(d => {
      const date = new Date((d.date || '') + 'T00:00:00');
      return isNaN(date) ? '-' : date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    });

    const qrSeries = (dailyData || []).map(d => d.qr ?? d.qr_count ?? 0);
    const searchSeries = (dailyData || []).map(d => d.search ?? d.search_count ?? 0);
    const maxVal = Math.max(0, ...qrSeries, ...searchSeries);

    // Ajustar ancho del canvas y tamaño visual según número de días
    const dayCount = labels.length || 1;
    let pixelsPerDay, pointRadius, borderWidth;
    
    if (dayCount <= 7) {
      pixelsPerDay = 50;
      pointRadius = 5;
      borderWidth = 3;
    } else if (dayCount <= 30) {
      pixelsPerDay = 40;
      pointRadius = 4;
      borderWidth = 2.5;
    } else {
      pixelsPerDay = 30;
      pointRadius = 3;
      borderWidth = 2;
    }
    
    const canvasWidth = Math.max(600, dayCount * pixelsPerDay);
    canvas.style.width = canvasWidth + 'px';

    const ctx = canvas.getContext('2d');
    if (dailyChartInstance) {
      try { dailyChartInstance.destroy(); } catch (_) {}
    }

    dailyChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Consultas QR',
            data: qrSeries,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.4)',
            borderWidth: borderWidth,
            fill: true,
            pointRadius: pointRadius,
            pointBackgroundColor: '#2563EB',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: Math.max(5, pointRadius + 2),
            tension: 0.4,
          },
          {
            label: 'Búsquedas',
            data: searchSeries,
            borderColor: '#DC2626',
            backgroundColor: 'rgba(220, 38, 38, 0.4)',
            borderWidth: borderWidth,
            fill: true,
            pointRadius: pointRadius,
            pointBackgroundColor: '#DC2626',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: Math.max(5, pointRadius + 2),
            tension: 0.4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            stacked: false,
            ticks: { maxTicksLimit: Math.min(labels.length, 12) }
          },
          y: {
            stacked: false,
            beginAtZero: true,
            suggestedMax: Math.max(5, Math.ceil(maxVal + 2)),
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { 
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1
          }
        }
      }
    });
  }

  // Tabla detallada de productos
  function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    if (!products || products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos para mostrar</td></tr>';
      return;
    }

    tbody.innerHTML = products.map((p, idx) => `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td>${escapeHtml(p.name || '-')}</td>
        <td>${escapeHtml(p.winery || '-')}</td>
        <td class="text-center">${p.qr_count || 0}</td>
        <td class="text-center">${p.search_count || 0}</td>
        <td class="text-center"><strong>${p.total || 0}</strong></td>
      </tr>
    `).join('');
  }

  // Cargar todos los datos
  async function loadMetrics(days) {
    showLoading();
    
    // Tiempo mínimo de espera para el spinner (250ms)
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 250));
    
    try {
      const dataPromise = getMetrics(days);
      
      // Esperar tanto los datos como el tiempo mínimo
      const [data] = await Promise.all([dataPromise, minLoadingTime]);

      // Renderizar todas las vistas
      renderKPIs(data.summary || {}, data.average_daily ?? null, data.period_days ?? null);
      renderDailyChart(data.daily || []);
      renderTopProductsChart(data.top_products || []);

      showContent();
    } catch (error) {
      await minLoadingTime; // Asegurar tiempo mínimo incluso con error
      console.error('Error loading metrics:', error);
      showError(error.message || 'No se pudieron cargar las métricas.');
      showToast(`Error: ${error.message}`, 'error');
    }
  }

  // Event listeners
  periodButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      periodButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentPeriod = parseInt(e.target.dataset.period, 10);
      loadMetrics(currentPeriod);
    });
  });

  if (retryBtn) {
    retryBtn.addEventListener('click', () => loadMetrics(currentPeriod));
  }

  // Carga inicial
  loadMetrics(currentPeriod);
}
