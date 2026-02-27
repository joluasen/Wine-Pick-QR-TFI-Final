/**
 * Obtiene un producto por ID (admin, ficha completa)
 * @param {number|string} productId
 * @returns {Promise<Object|null>}
 */
export async function getProductById(productId) {
  try {
    // No existe endpoint GET /api/admin/productos/{id}, solo paginado y búsqueda pública
    // Usar búsqueda pública por ID (solo para ficha)
    const url = `./api/public/productos?search=${encodeURIComponent(productId)}`;
    const data = await fetchJSON(url);
    if (data?.data?.products?.length) {
      return data.data.products[0];
    }
    return null;
  } catch (err) {
    return null;
  }
}
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
  try {
    // Usar API directa por código (más eficiente y exacta)
    const response = await fetch(`./api/public/productos/${encodeURIComponent(code)}`);
    const data = await response.json();

    if (data.ok && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error('Error buscando producto por código:', err);
    return null;
  }
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
  return await fetchJSON(`./api/admin/productos/actualizar`, {
    method: 'POST',
    body: JSON.stringify({ id: productId, ...productData })
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
