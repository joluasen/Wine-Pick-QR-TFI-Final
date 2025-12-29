/**
 * promotionService.js
 * Servicio de promociones - centraliza todas las operaciones CRUD de promociones
 */

import { fetchJSON } from '../../core/utils.js';

/**
 * Obtiene promociones con paginación
 * @param {Object} options - Opciones de consulta
 * @param {number} options.limit - Cantidad por página
 * @param {number} options.offset - Offset para paginación
 * @param {number} [options.productId] - Filtrar por producto
 * @returns {Promise<Object>} { promotions, total }
 */
export async function getPromotions({ limit = 20, offset = 0, productId = null } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (productId) params.append('product_id', productId);

  const url = `./api/admin/promociones?${params.toString()}`;
  const data = await fetchJSON(url);

  return {
    promotions: data?.data?.promotions || [],
    total: data?.data?.total || 0
  };
}

/**
 * Crea una nueva promoción
 * @param {Object} promoData - Datos de la promoción
 * @returns {Promise<Object>}
 */
export async function createPromotion(promoData) {
  return await fetchJSON('./api/admin/promociones', {
    method: 'POST',
    body: JSON.stringify(promoData)
  });
}

/**
 * Actualiza una promoción existente
 * @param {number} promoId - ID de la promoción
 * @param {Object} promoData - Datos actualizados
 * @returns {Promise<Object>}
 */
export async function updatePromotion(promoId, promoData) {
  return await fetchJSON(`./api/admin/promociones/${promoId}`, {
    method: 'PUT',
    body: JSON.stringify(promoData)
  });
}

/**
 * Elimina una promoción
 * @param {number} promoId - ID de la promoción
 * @returns {Promise<Object>}
 */
export async function deletePromotion(promoId) {
  return await fetchJSON(`./api/admin/promociones/${promoId}`, {
    method: 'DELETE'
  });
}

/**
 * Activa o desactiva una promoción
 * @param {number} promoId - ID de la promoción
 * @param {boolean} isActive - Estado deseado
 * @returns {Promise<Object>}
 */
export async function togglePromotionStatus(promoId, isActive) {
  return await updatePromotion(promoId, { is_active: isActive });
}
