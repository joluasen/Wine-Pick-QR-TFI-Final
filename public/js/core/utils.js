
/**
 * utils.js
 *
 * Utilidades compartidas para toda la aplicación Wine Pick QR.
 *
 * Centraliza funciones comunes para evitar duplicación y facilitar el mantenimiento.
 *
 * Principales responsabilidades:
 * - Obtener rutas y parámetros
 * - Formatear precios y fechas
 * - Registrar métricas y manejar estado
 * - Funciones de debounce, fetch seguro y escape HTML
 */

/**
 * Obtiene la URL base del proyecto de forma dinámica
 * Funciona en cualquier entorno (local, producción, subdirectorio)
 */
export function getBasePath() {
  const path = window.location.pathname;
  
  // Buscar segmentos conocidos del proyecto
  const segments = ['/Wine-Pick-QR-TFI/', '/public/'];
  
  for (const segment of segments) {
    const idx = path.indexOf(segment);
    if (idx !== -1) {
      return path.substring(0, idx + segment.length);
    }
  }
  
  // Fallback: usar la raíz relativa
  return './';
}

/**
 * Muestra un mensaje de estado en un elemento
 * @param {HTMLElement|string} el - Elemento o selector
 * @param {string} message - Mensaje a mostrar
 * @param {('info'|'success'|'error')} type - Tipo de mensaje
 */
export function setStatus(el, message, type = 'info') {
  const element = typeof el === 'string' ? document.querySelector(el) : el;
  if (!element) return;
  
  element.textContent = message;
  element.dataset.type = type;
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
}

/**
 * Registra una métrica de consulta de producto
 * @param {number} productId - ID del producto consultado
 * @param {('QR'|'BUSQUEDA')} channel - Canal por el que se consultó
 * @returns {Promise<void>}
 */
export async function registerMetric(productId, channel) {
  // Validación básica
  if (!productId || typeof productId !== 'number' || productId <= 0) {
    console.warn('registerMetric: productId inválido:', productId);
    return;
  }

  if (!['QR', 'BUSQUEDA'].includes(channel)) {
    console.warn('registerMetric: canal inválido:', channel);
    return;
  }

  try {
    const response = await fetch('./api/public/metricas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        channel: channel,
      }),
    });

    // No validamos respuesta - es fire-and-forget
    // Si falla, no queremos afectar la experiencia del usuario
    if (!response.ok) {
      console.warn('registerMetric: respuesta no OK', response.status);
    }
  } catch (error) {
    // Silenciosamente fallar - no afectar UX
    console.warn('registerMetric: error al registrar métrica', error);
  }
}

/**
 * Calcula el precio final considerando promociones
 * @param {Object} product - Producto con base_price y promotion opcional
 * @returns {Object} { final, type, savings, discount, hasPromo }
 */
export function calculatePromoPrice(product) {
  const basePrice = parseFloat(product.base_price) || 0;
  const promo = product.promotion;
  
  if (!promo) {
    return { final: basePrice, type: null, hasPromo: false };
  }

  const type = promo.type || promo.promotion_type;
  const value = parseFloat(promo.value ?? promo.parameter_value) || 0;

  switch (type) {
    case 'porcentaje':
      return {
        final: basePrice * (1 - value / 100),
        type,
        discount: value,
        savings: basePrice * (value / 100),
        hasPromo: true
      };
    case 'precio_fijo':
      return {
        final: value,
        type,
        savings: basePrice - value,
        hasPromo: true
      };
    case '2x1':
      return {
        final: basePrice / 2,
        type,
        unitPrice: basePrice,
        hasPromo: true
      };
    case '3x2':
      return {
        final: (basePrice * 2) / 3,
        type,
        totalFor3: basePrice * 2,
        hasPromo: true
      };
    case 'nxm':
      return {
        final: basePrice,
        type,
        customText: promo.text || promo.visible_text,
        hasPromo: true
      };
    default:
      return { final: basePrice, type: null, hasPromo: false };
  }
}

/**
 * Formatea un precio en pesos argentinos con HTML
 * @param {number} amount - Monto a formatear
 * @returns {string} HTML con formato de precio
 */
export function formatPrice(amount) {
  const n = Number(amount) || 0;
  const intPart = Math.floor(n);
  const decPart = (n % 1).toFixed(2).slice(1);
  
  return `<span class="price-symbol">$</span><span class="price-int">${intPart.toLocaleString('es-AR')}</span><span class="price-dec">${decPart}</span>`;
}

/**
 * Formatea una fecha para mostrar en español
 * @param {string} dateStr - Fecha en formato ISO
 * @returns {string} Fecha formateada o 'Sin vencimiento'
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Sin vencimiento';
  
  try {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Sin vencimiento';
  }
}

/**
 * Extrae parámetros del hash de la URL
 * @returns {Object} Objeto con los parámetros
 */
export function getHashParams() {
  const hash = window.location.hash || '';
  const params = {};
  
  if (hash.includes('?')) {
    const paramString = hash.split('?')[1];
    paramString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        // Reemplazar + por espacio antes de decodificar (URLSearchParams genera + para espacios)
        // decodeURIComponent no decodifica + en contexto de hash (solo en form-urlencoded)
        params[key] = decodeURIComponent((value || '').replace(/\+/g, ' '));
      }
    });
  }
  
  return params;
}

/**
 * Construye un hash con parámetros
 * @param {string} base - Hash base (ej: '#search')
 * @param {Object} params - Parámetros a incluir
 * @returns {string} Hash completo
 */
export function buildHash(base, params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  
  if (entries.length === 0) return base;
  
  const queryString = entries
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  
  return `${base}?${queryString}`;
}

/**
 * Debounce para limitar llamadas a funciones
 * @param {Function} fn - Función a ejecutar
 * @param {number} delay - Delay en ms
 * @returns {Function} Función con debounce
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Realiza una petición fetch con manejo de errores estándar
 * @param {string} url - URL de la petición
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Object>} Respuesta parseada
 */
export async function fetchJSON(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'same-origin'
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    const error = new Error(data?.error?.message || `Error HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  if (data && !data.ok) {
    throw new Error(data.error?.message || 'Error en la respuesta');
  }
  
  return data;
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} str - String a escapar
 * @returns {string} String escapado
 */
export function escapeHtml(str) {
  if (!str) return '';
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
