// search-bar.js
// Lógica unificada y profesional para el buscador header (desktop y mobile)
// Autocompletado, accesibilidad, UX robusta

import { fetchJSON, escapeHtml, registerMetric } from './core/utils.js';

// Cache simple para saber si el usuario es admin
let isAdminUser = null;

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

    // Crear dropdown simple fuera del input-group para evitar overflow hidden
    let dropdown = newForm.querySelector('#search-autocomplete');
    if (!dropdown) {
      dropdown = document.createElement('ul');
      dropdown.id = 'search-autocomplete';
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

    function clearDropdown() {
      dropdown.innerHTML = '';
      dropdown.style.display = 'none';
    }

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
        // console.error('[search-bar] fetchSuggestions error:', err);
        clearDropdown();
      }
    }

    function renderSuggestions(items) {
      dropdown.innerHTML = '';
      if (!items.length) {
        clearDropdown();
        return;
      }
      items.slice(0, AUTOCOMPLETE_LIMIT).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
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

    newInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => fetchSuggestions(query), 250);
    });

    newInput.addEventListener('blur', () => {
      setTimeout(clearDropdown, 100);
    });

    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = newInput.value.trim();
      if (!query) return;
      
      try {
        const isAdmin = await checkAdmin();

        // Buscar productos
        const params = new URLSearchParams({ search: query, limit: 100 });
        const url = `./api/public/productos?${params.toString()}`;
        const data = await fetchJSON(url);
        const products = data?.data?.products || [];
        
        // Si hay exactamente 1 resultado, abrir directamente
        if (products.length === 1) {
          const product = products[0];
          const { modalManager } = await import('./core/modalManager.js');

          if (isAdmin) {
            // Admin no registra métricas
            modalManager.showProductAdmin(product);
          } else {
            registerMetric(product.id, 'BUSQUEDA');
            modalManager.showProduct(product, null); // null = no registrar de nuevo
          }
          clearDropdown();
          return;
        }
        
        // Si hay múltiples resultados, ir a vista search (sin registrar aún)
        const target = isAdmin ? '#admin-search' : '#search';
        // Si estamos en la vista de promociones, agregar filtro de promociones
        const currentHash = window.location.hash.split('?')[0];
        const promosFilter = currentHash === '#admin-promotions' ? '&promos=1' : '';
        window.location.hash = `${target}?query=${encodeURIComponent(query)}${promosFilter}`;
        setTimeout(() => {
          newInput.value = query;
        }, 200);
        clearDropdown();
      } catch (err) {
        console.error('Error en búsqueda:', err);
      }
    });

    // Sincronizar el valor del input con el hash al cargar o cambiar la vista
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