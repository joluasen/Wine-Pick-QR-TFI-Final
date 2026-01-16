/**
 * metricService.js
 * Servicio de métricas - centraliza llamadas a la API de métricas
 */

import { fetchJSON } from '../../core/utils.js';

/**
 * Obtiene las métricas del dashboard para un período específico
 * @param {number} days - Período en días (7, 30, 90)
 * @returns {Promise<Object>} Datos de métricas
 */
export async function getMetrics(days = 30) {
  const params = new URLSearchParams({ days });
  const url = `./api/admin/metrics?${params.toString()}`;
  const response = await fetchJSON(url);
  return response?.data || {};
}
