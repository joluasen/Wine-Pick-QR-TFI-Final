/**
 * productService.js
 * Servicio de productos - centraliza todas las operaciones CRUD de productos
 */

import { fetchJSON } from '../../core/utils.js';

/**
 * Obtiene productos con paginación
 * @param {Object} options - Opciones de paginación
 * @param {number} options.limit - Cantidad de productos por página
 * @param {number} options.offset - Offset para paginación
 * @returns {Promise<Object>} { products, total, count }
 */
export async function getProducts({ limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit, offset });
  const url = `./api/admin/productos?${params.toString()}`;
  const response = await fetchJSON(url);
  return response?.data || {};
}

/**
 * Obtiene todos los productos (sin paginación) para selectores
 * @returns {Promise<Array>}
 */
export async function getAllProducts() {
  const data = await fetchJSON('./api/public/productos?search=.');
  return data?.data?.products || [];
}

/**
 * Busca un producto por código público
 * @param {string} code - Código público
 * @returns {Promise<Object|null>}
 */
export async function searchProductByCode(code) {
  const data = await fetchJSON('./api/public/productos/buscar', {
    method: 'POST',
    body: JSON.stringify({ search: code, limit: 10 })
  });
  const products = Array.isArray(data?.data?.products) ? data.data.products : [];
  return products.find(p => (p.public_code || '').toUpperCase() === code.toUpperCase()) || null;
}

/**
 * Crea un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise<Object>}
 */
export async function createProduct(productData) {
  return await fetchJSON('./api/admin/productos', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
}

/**
 * Actualiza un producto existente
 * @param {number} productId - ID del producto
 * @param {Object} productData - Datos actualizados
 * @returns {Promise<Object>}
 */
export async function updateProduct(productId, productData) {
  return await fetchJSON(`./api/admin/productos/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
}

/**
 * Elimina un producto
 * @param {number} productId - ID del producto
 * @returns {Promise<Object>}
 */
export async function deleteProduct(productId) {
  return await fetchJSON(`./api/admin/productos/${productId}`, {
    method: 'DELETE'
  });
}
