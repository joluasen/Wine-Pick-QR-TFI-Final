
/**
 * search-bar.js
 *
 * Lógica unificada y profesional para el buscador del header (desktop y mobile).
 * Incluye autocompletado, accesibilidad, UX robusta y soporte para usuarios admin y públicos.
 *
 * Funcionalidades principales:
 * - Autocompletado de productos con sugerencias dinámicas
 * - Detección de usuario administrador
 * - Sincronización con el hash de la URL
 * - UX accesible y responsiva
 */

import { fetchJSON, escapeHtml, getHashParams, registerMetric } from './core/utils.js';
import { showToast } from './admin/components/Toast.js';

// Cache simple para saber si el usuario es admin
let isAdminUser = null;

/**
 * Verifica si el usuario actual es administrador.
 * Utiliza cache para evitar múltiples requests.
 * @returns {Promise<boolean>}
 */
async function checkAdmin() {
  if (isAdminUser !== null) return isAdminUser;
  try {
    const res = await fetch('./api/admin/me', { credentials: 'same-origin' });
    isAdminUser = res.ok;
  } catch {
    isAdminUser = false;
  }
  return isAdminUser;
}

const AUTOCOMPLETE_LIMIT = 5;
let debounceTimeout = null;

function getSelectedField(params = {}) {
  const allowed = ['varietal', 'origin', 'winery_distillery'];
  if (params.field && allowed.includes(params.field)) return params.field;
  if (params.varietal === '1') return 'varietal';
  if (params.origin === '1') return 'origin';
  if (params.winery_distillery === '1') return 'winery_distillery';
  return null;
}

async function fetchPromotionMatches(query) {
  const params = new URLSearchParams({ search: query, limit: 50, offset: 0 });
  const url = `./api/admin/promociones?${params.toString()}`;
  const data = await fetchJSON(url);
  return data?.data?.promotions || [];
}

/**
 * Inicializa el buscador unificado en todos los headers (desktop y mobile).
 * Configura autocompletado, listeners y sincronización con la URL.
 */
function initUnifiedSearchBar() {
  // Buscar todos los formularios de buscador en la página (desktop y mobile)
  const forms = document.querySelectorAll('#desktop-search-header #searchForm, #mobile-search-header #searchForm');
  forms.forEach(form => {
    const input = form.querySelector('#searchInput');
    if (!form || !input) return;

    // Eliminar listeners previos (clonando el nodo)
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    const newInput = newForm.querySelector('#searchInput');

    // Evitar que la validación nativa muestre el tooltip del navegador
    if (input.hasAttribute('required')) input.removeAttribute('required');
    input.setAttribute('aria-required', 'true');

    // Crear dropdown simple fuera del input-group para evitar overflow hidden
    let dropdown = newForm.querySelector('#search-autocomplete');
    if (!dropdown) {
      dropdown = document.createElement('ul');
      dropdown.id = 'search-autocomplete';
      // Estilos para el dropdown de sugerencias
      dropdown.style.position = 'absolute';
      dropdown.style.top = 'calc(100% + 0.5em)';
      dropdown.style.left = '0';
      dropdown.style.right = '0';
      dropdown.style.background = '#fff';
      dropdown.style.border = '1px solid #e0e0e0';
      dropdown.style.borderRadius = '0.5em';
      dropdown.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
      dropdown.style.zIndex = '1050';
      dropdown.style.listStyle = 'none';
      dropdown.style.padding = '0.5em 0';
      dropdown.style.margin = '0';
      dropdown.style.display = 'none';
      dropdown.style.maxHeight = '300px';
      dropdown.style.overflowY = 'auto';
      // Agregar al form (que tiene position relative) en lugar del input-group
      newForm.style.position = 'relative';
      newForm.appendChild(dropdown);
    }

    // Validación custom en submit para evitar el mensaje nativo "Completa este campo"
    newForm.addEventListener('submit', (e) => {
      const query = (newInput.value || '').trim();
      if (!query) {
        e.preventDefault();
        e.stopPropagation();
        showToast('Ingresa un nombre o código de producto', 'warning');
        newInput.focus();
        return;
      }
    });

    /**
     * Limpia y oculta el dropdown de sugerencias.
     */
    function clearDropdown() {
      dropdown.innerHTML = '';
      dropdown.style.display = 'none';
    }

    /**
     * Obtiene sugerencias de productos desde la API pública.
     * @param {string} query
     */
    async function fetchSuggestions(query) {
      if (!query || query.length < 2) {
        clearDropdown();
        return;
      }
      try {
        const params = new URLSearchParams({ search: query, limit: AUTOCOMPLETE_LIMIT });
        const url = `./api/public/productos?${params.toString()}`;
        const data = await fetchJSON(url);
        const suggestions = data?.data?.products || [];
        renderSuggestions(suggestions);
      } catch (err) {
        // Si hay error, limpiar el dropdown
        clearDropdown();
      }
    }

    /**
     * Renderiza las sugerencias en el dropdown.
     * @param {Array} items
     */
    function renderSuggestions(items) {
      dropdown.innerHTML = '';
      if (!items.length) {
        clearDropdown();
        return;
      }
      items.slice(0, AUTOCOMPLETE_LIMIT).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
        // Estilos y UX para cada sugerencia
        li.style.padding = '0.75em 1em';
        li.style.fontSize = '0.95em';
        li.style.color = '#1A1A1A';
        li.style.background = '#fff';
        li.style.cursor = 'pointer';
        li.style.transition = 'background 0.15s ease';
        li.style.borderBottom = '1px solid #f5f5f5';
        li.addEventListener('mouseenter', () => {
          li.style.background = '#f8f9fa';
        });
        li.addEventListener('mouseleave', () => {
          li.style.background = '#fff';
        });
        // Al hacer click en una sugerencia
        li.addEventListener('mousedown', async (e) => {
          e.preventDefault();
          const query = item.name;
          newInput.value = query;
          clearDropdown();

          const isAdmin = await checkAdmin();
          const { modalManager } = await import('./core/modalManager.js');

          if (isAdmin) {
            // Admin no registra métricas
            modalManager.showProductAdmin(item);
            return;
          }

          // Registrar métrica y abrir directamente desde sugerencia
          registerMetric(item.id, 'BUSQUEDA');
          modalManager.showProduct(item, null); // null = no registrar de nuevo
        });
        dropdown.appendChild(li);
      });
      // Quitar border del último item
      const lastLi = dropdown.querySelector('li:last-child');
      if (lastLi) lastLi.style.borderBottom = 'none';

      dropdown.style.display = 'block';
    }

    // Listener para autocompletado en el input
    newInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => fetchSuggestions(query), 250);
    });

    // Ocultar el dropdown al perder foco
    newInput.addEventListener('blur', () => {
      setTimeout(clearDropdown, 100);
    });

    // Listener para el submit del formulario de búsqueda
    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = newInput.value.trim();
      if (!query) return;
      
      try {
        const currentParams = getHashParams();
        const selectedField = getSelectedField(currentParams);
        const drinkType = currentParams.drink_type || '';
        const vintageYear = currentParams.vintage_year || '';
        const isAdmin = await checkAdmin();
        const currentHash = window.location.hash.split('?')[0];

        // Modo admin en vista de promociones: buscar promociones y mostrar acciones de promoción
        if (isAdmin && currentHash === '#admin-promotions') {
          const promotions = await fetchPromotionMatches(query);

          if (promotions.length === 1) {
            const promotion = promotions[0];
            const { modalManager } = await import('./core/modalManager.js');
            modalManager.showEditPromotion(promotion, () => {
              window.location.hash = `#admin-promotions?query=${encodeURIComponent(query)}`;
            });
            clearDropdown();
            return;
          }

          window.location.hash = `#admin-promotions?query=${encodeURIComponent(query)}`;
          setTimeout(() => {
            newInput.value = query;
          }, 200);
          clearDropdown();
          return;
        }

        // Buscar productos
        const params = new URLSearchParams({ search: query, limit: 100 });
        if (selectedField) params.set('field', selectedField);
        if (drinkType) params.set('drink_type', drinkType);
        if (vintageYear) params.set('vintage_year', vintageYear);
        const url = `./api/public/productos?${params.toString()}`;
        const data = await fetchJSON(url);
        const products = data?.data?.products || [];
        
        // Si hay exactamente 1 resultado, abrir directamente solo para público.
        // Para admin, navegar igual a la vista (evita abrir ficha automática).
        if (products.length === 1 && !isAdmin) {
          const product = products[0];
          const { modalManager } = await import('./core/modalManager.js');

          registerMetric(product.id, 'BUSQUEDA');
          modalManager.showProduct(product, null); // null = no registrar de nuevo
          clearDropdown();
          return;
        }
        
        // Si hay múltiples resultados, ir a vista search (sin registrar aún)
        const target = (() => {
          if (!isAdmin) return '#search';
          // Solo promociones se queda en su vista; todo lo demás va a productos
          if (currentHash === '#admin-promotions') return '#admin-promotions';
          return '#admin-products';
        })();
        const hashParams = new URLSearchParams({ query });
        if (selectedField) {
          hashParams.set('field', selectedField);
          if (selectedField === 'varietal') hashParams.set('varietal', '1');
          if (selectedField === 'origin') hashParams.set('origin', '1');
          if (selectedField === 'winery_distillery') hashParams.set('winery_distillery', '1');
        }
        if (drinkType) hashParams.set('drink_type', drinkType);
        if (vintageYear) hashParams.set('vintage_year', vintageYear);

        window.location.hash = `${target}?${hashParams.toString()}`;
        setTimeout(() => {
          newInput.value = query;
        }, 200);
        clearDropdown();
      } catch (err) {
        console.error('Error en búsqueda:', err);
      }
    });

    /**
     * Sincroniza el valor del input con el hash de la URL.
     */
    function syncInputWithHash() {
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const query = params.get('query') || '';
      newInput.value = query;
    }
    syncInputWithHash();
    window.addEventListener('hashchange', syncInputWithHash);
  });
}

export { initUnifiedSearchBar };