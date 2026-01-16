/**
 * adminMetricsView.js
 * Vista de métricas del panel de administración
 *
 * RESPONSABILIDAD: Controlador de vista de métricas
 * - Renderiza tablas simples con datos de métricas
 * - Actualiza datos según período seleccionado
 */

import { getMetrics } from '../admin/services/metricService.js';
import { showToast } from '../admin/components/Toast.js';

/**
 * Inicializa la vista de métricas
 * @param {HTMLElement} container - Contenedor de la vista
 */
export async function initAdminMetricsView(container) {
  // Referencias a elementos del DOM
  const loadingEl = document.getElementById('metrics-loading');
  const contentEl = document.getElementById('metrics-content');
  const errorEl = document.getElementById('metrics-error');
  const periodSelect = document.getElementById('metrics-period');
  const retryBtn = document.getElementById('metrics-retry');

  // Estado inicial
  let currentPeriod = parseInt(periodSelect?.value || '30', 10);

  /**
   * Muestra el estado de carga
   */
  function showLoading() {
    if (loadingEl) loadingEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
  }

  /**
   * Muestra el contenido
   */
  function showContent() {
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
  }

  /**
   * Muestra el estado de error
   * @param {string} message - Mensaje de error
   */
  function showError(message) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'block';
      const errorMsg = document.getElementById('metrics-error-message');
      if (errorMsg) errorMsg.textContent = message;
    }
  }

  /**
   * Formatea una fecha para mostrar
   * @param {string} dateStr - Fecha en formato YYYY-MM-DD
   * @returns {string} Fecha formateada
   */
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Formatea una fecha completa
   * @param {string} dateStr - Fecha en formato YYYY-MM-DD
   * @returns {string} Fecha formateada
   */
  function formatFullDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Actualiza las tarjetas de resumen
   * @param {Object} summary - Datos de resumen
   */
  function updateSummaryCards(summary) {
    const total = summary.total || 0;
    const qr = summary.qr_count || 0;
    const search = summary.search_count || 0;
    const products = summary.unique_products || 0;

    document.getElementById('total-consultas').textContent = total.toLocaleString('es-AR');
    document.getElementById('consultas-qr').textContent = qr.toLocaleString('es-AR');
    document.getElementById('consultas-busqueda').textContent = search.toLocaleString('es-AR');
    document.getElementById('productos-consultados').textContent = products.toLocaleString('es-AR');

    // Porcentajes
    const percentQr = total > 0 ? Math.round((qr / total) * 100) : 0;
    const percentSearch = total > 0 ? Math.round((search / total) * 100) : 0;

    document.getElementById('percent-qr').textContent = `${percentQr}`;
    document.getElementById('percent-busqueda').textContent = `${percentSearch}`;
  }

  /**
   * Renderiza la tabla de consultas por día
   * @param {Array} dailyData - Datos diarios
   */
  function renderDailyTable(dailyData) {
    const tbody = document.getElementById('daily-table-body');
    if (!tbody) return;

    if (!dailyData || dailyData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">No hay datos para el período seleccionado</td></tr>';
      return;
    }

    tbody.innerHTML = dailyData.map(d => `
      <tr>
        <td>${formatDate(d.date)}</td>
        <td>${d.qr_count || 0}</td>
        <td>${d.search_count || 0}</td>
        <td><strong>${d.total || 0}</strong></td>
      </tr>
    `).join('');
  }

  /**
   * Renderiza la tabla de productos más consultados
   * @param {Array} products - Lista de productos
   */
  function renderTopProductsTable(products) {
    const tbody = document.getElementById('top-products-body');
    if (!tbody) return;

    if (!products || products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No hay productos consultados en este período</td></tr>';
      return;
    }

    tbody.innerHTML = products.map((p, idx) => `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.winery || '-')}</td>
        <td>${p.qr_count}</td>
        <td>${p.search_count}</td>
        <td><strong>${p.total}</strong></td>
      </tr>
    `).join('');
  }

  /**
   * Actualiza el resumen del período
   * @param {Object} data - Datos completos de métricas
   */
  function updatePeriodSummary(data) {
    const avgEl = document.getElementById('promedio-diario');
    const peakEl = document.getElementById('dia-max');
    const topEl = document.getElementById('producto-top');

    if (avgEl) {
      avgEl.textContent = data.average_daily?.toLocaleString('es-AR') || '0';
    }

    if (peakEl) {
      if (data.peak_day) {
        peakEl.textContent = `${formatFullDate(data.peak_day.date)} (${data.peak_day.count})`;
      } else {
        peakEl.textContent = '-';
      }
    }

    if (topEl) {
      if (data.top_product) {
        topEl.textContent = data.top_product.name;
        topEl.title = `${data.top_product.count} consultas`;
      } else {
        topEl.textContent = '-';
        topEl.title = '';
      }
    }
  }

  /**
   * Escapa HTML para prevenir XSS
   * @param {string} str - String a escapar
   * @returns {string}
   */
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Carga y renderiza las métricas
   * @param {number} days - Período en días
   */
  async function loadMetrics(days) {
    showLoading();

    try {
      const data = await getMetrics(days);

      // Actualizar tarjetas de resumen
      updateSummaryCards(data.summary || {});

      // Renderizar tablas
      renderDailyTable(data.daily || []);
      renderTopProductsTable(data.top_products || []);

      // Actualizar resumen del período
      updatePeriodSummary(data);

      showContent();
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      showError(error.message || 'No se pudieron cargar las métricas. Intenta de nuevo.');
      showToast(`Error: ${error.message}`, 'error');
    }
  }

  // Event listeners
  if (periodSelect) {
    periodSelect.addEventListener('change', (e) => {
      currentPeriod = parseInt(e.target.value, 10);
      loadMetrics(currentPeriod);
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      loadMetrics(currentPeriod);
    });
  }

  // Carga inicial
  loadMetrics(currentPeriod);
}
