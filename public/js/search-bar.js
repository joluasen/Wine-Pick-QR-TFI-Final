// search-bar.js
// Lógica unificada y profesional para el buscador header (desktop y mobile)
// Autocompletado, accesibilidad, UX robusta

import { fetchJSON, escapeHtml } from './core/utils.js';

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

    // Crear dropdown simple
    let dropdown = newForm.querySelector('#search-autocomplete');
    if (!dropdown) {
      dropdown = document.createElement('ul');
      dropdown.id = 'search-autocomplete';
      dropdown.style.position = 'absolute';
      dropdown.style.top = '100%';
      dropdown.style.left = '0';
      dropdown.style.width = '100%';
      dropdown.style.background = '#fff';
      dropdown.style.borderRadius = '2em';
      dropdown.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
      dropdown.style.marginTop = '0.5em';
      dropdown.style.padding = '0.75em 0.5em';
      dropdown.style.zIndex = '1000';
      dropdown.style.listStyle = 'none';
      dropdown.style.border = 'none';
      dropdown.style.display = 'none';
      newInput.parentNode.appendChild(dropdown);
    }

    function clearDropdown() {
      dropdown.innerHTML = '';
      dropdown.style.display = 'none';
    }

    async function fetchSuggestions(query) {
      // console.log('[search-bar] fetchSuggestions called with:', query);
      if (!query || query.length < 2) {
        clearDropdown();
        return;
      }
      try {
        const data = await fetchJSON('./api/public/productos/buscar', {
          method: 'POST',
          body: JSON.stringify({ search: query, limit: AUTOCOMPLETE_LIMIT })
        });
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
        li.style.padding = '0.5em 1.2em';
        li.style.fontSize = '1.05em';
        li.style.color = '#4B1C2F';
        li.style.background = 'none';
        li.style.borderRadius = '1em';
        li.style.cursor = 'pointer';
        li.style.transition = 'background 0.15s';
        li.style.marginBottom = '0.15em';
        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          newInput.value = item.name;
          clearDropdown();
          newForm.dispatchEvent(new Event('submit'));
        });
        dropdown.appendChild(li);
      });
      dropdown.style.display = 'block';
    }

    newInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      // console.log('[search-bar] input event, query:', query);
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => fetchSuggestions(query), 250);
    });

    newInput.addEventListener('blur', () => {
      setTimeout(clearDropdown, 100);
    });

    newForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = newInput.value.trim();
      if (query) {
        window.location.hash = `#search?query=${encodeURIComponent(query)}`;
        newInput.blur();
        clearDropdown();
      }
    });
  });
}

export { initUnifiedSearchBar };