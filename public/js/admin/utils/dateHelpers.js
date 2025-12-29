/**
 * dateHelpers.js
 * Utilidades para manejo de fechas en formato SQL
 */

/**
 * Convierte una fecha de input[type="date"] a formato SQL datetime
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {string|null}
 */
export function dateToSQL(dateStr) {
  if (!dateStr) return null;
  return `${dateStr} 00:00:00`;
}

/**
 * Convierte una fecha SQL a formato YYYY-MM-DD para input[type="date"]
 * @param {string} sqlDate - Fecha en formato SQL
 * @returns {string}
 */
export function sqlToInputDate(sqlDate) {
  if (!sqlDate) return '';
  return sqlDate.split(' ')[0];
}
