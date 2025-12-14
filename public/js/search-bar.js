/**
 * public/js/search-bar.js
 * Maneja la interacción de las barras de búsqueda (Mobile y Desktop).
 * Sincroniza los inputs y delega la búsqueda al router.
 */

(function (window, document) {
  "use strict";

  const FORM_ID = "searchForm";
  const INPUT_ID = "searchInput";

  /**
   * Sincroniza el texto entre todos los buscadores.
   */
  function syncInputs(value) {
    const input = document.getElementById(INPUT_ID);
    if (input && input.value !== value) {
      input.value = value;
    }
    // Persistir el valor en sessionStorage solo si no hay hash de búsqueda
    if (typeof sessionStorage !== 'undefined') {
      const hash = window.location.hash || '';
      if (!hash.includes('#search?query=')) {
        if (value && value.length > 0) {
          sessionStorage.setItem('lastSearchValue', value);
        } else {
          sessionStorage.removeItem('lastSearchValue');
        }
      }
    }
  }

  /**
   * Maneja el envío del formulario de búsqueda
   */
  function handleSearchSubmit(e) {

    e.preventDefault();

    // Siempre tomar el valor del input visible
    let input = document.getElementById('searchInput');
    if (!input) {
      // fallback: buscar input en el formulario
      const form = e.currentTarget;
      input = form.querySelector("input[type='search']");
    }
    const query = input ? input.value.trim() : "";
    // console.log(`[SearchBar] Submit detectado en: #${form.id} | Valor: '${query}'`);

    // Sincronizar con otro input
    syncInputs(query);


    if (query.length === 0) {
      console.warn("Búsqueda vacía");
      return;
    }
    // Log limpio del valor buscado
    console.log('[BUSQUEDA]', query);

    // Limpiar sessionStorage tras submit exitoso
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('lastSearchValue');
    }
    // Navegar a la vista de buscador con el query en la URL
    window.location.hash = '#search?query=' + encodeURIComponent(query);
    // Log para depuración del hash final
    setTimeout(() => {
      console.log('[HASH FINAL]', window.location.hash);
    }, 0);
    // Quitar foco para esconder teclado en móvil
    if (input) input.blur();
  }

  // Event delegation: escuchar submit a nivel document
  function delegatedSearchSubmit(e) {
    const form = e.target;
    if (form && form.id === FORM_ID) {
      handleSearchSubmit(e);
    }
  }

  document.addEventListener("submit", delegatedSearchSubmit);
  // Fix: Forzar submit al hacer click en la lupa (desktop)
  document.addEventListener("click", function(e) {
    const target = e.target.closest(".btn-winepick");
    if (target) {
      const form = target.closest("form");
      if (form && form.id === FORM_ID) {
        e.preventDefault();
        form.requestSubmit ? form.requestSubmit() : form.submit();
      }
    }
  });
  // Restaurar el valor del input tras reinyección del header
  function restoreSearchInput() {
    // Si el hash tiene query, sincronizar el input con el hash
    const input = document.getElementById(INPUT_ID);
    const hash = window.location.hash || '';
    let query = '';
    if (hash.includes('#search?query=')) {
      const paramString = hash.split('?')[1];
      if (paramString) {
        paramString.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key === 'query') query = decodeURIComponent(value || '');
        });
      }
    } else if (typeof sessionStorage !== 'undefined') {
      // Si no hay hash, usar sessionStorage solo como fallback
      query = sessionStorage.getItem('lastSearchValue') || '';
    }
    if (input && query && input.value !== query) {
      input.value = query;
    }
  }

  // Búsqueda automática solo en desktop (>=768px), con debounce lento. En mobile, solo por botón/Enter.
  let debounceTimer = null;
  document.addEventListener('input', function(e) {
    const input = e.target;
    if (input && input.id === INPUT_ID) {
      // Solo activar búsqueda automática en desktop
      if (window.innerWidth >= 768) {
        const value = input.value.trim();
        clearTimeout(debounceTimer);
        if (value.length >= 3) {
          debounceTimer = setTimeout(() => {
            // Solo actualizar el hash si cambia el valor
            const currentHash = window.location.hash;
            const newHash = '#search?query=' + encodeURIComponent(value);
            if (currentHash !== newHash) {
              window.location.hash = newHash;
            }
          }, 1000);
        }
      }
    }
  });
  // Exponer para que router.js lo llame tras inyectar el header
  window.restoreSearchInput = restoreSearchInput;
  // Llamar al cargar por si el header ya está
  restoreSearchInput();
})(window, document);
