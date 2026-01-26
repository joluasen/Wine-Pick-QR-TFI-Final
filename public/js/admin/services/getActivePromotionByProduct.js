import { fetchJSON } from '../../core/utils.js';

/**
 * Obtiene la promoción activa de un producto por su ID
 * @param {number} productId - ID del producto
 * @returns {Promise<Object|null>} - Promoción activa o null
 */
export async function getActivePromotionByProduct(productId) {
  const url = `./api/admin/promociones?limit=1&offset=0&product_id=${productId}`;
  const data = await fetchJSON(url);
  const promos = data?.data?.promotions || [];
  return promos.length > 0 ? promos[0] : null;
}
