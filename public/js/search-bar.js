/**
 * public/js/search-bar.js
 * Maneja la interacción de las barras de búsqueda (Mobile y Desktop).
 * Sincroniza los inputs y delega la búsqueda al router.
 */

(function (window, document) {
  "use strict";

  const SEARCH_CONFIG = [
    { formId: "searchFormMobile", inputId: "searchInputMobile" },
    { formId: "searchFormDesktop", inputId: "searchInputDesktop" },
  ];

  /**
   * Sincroniza el texto entre todos los buscadores.
   */
  function syncInputs(value) {
    SEARCH_CONFIG.forEach((config) => {
      const input = document.getElementById(config.inputId);
      if (input && input.value !== value) {
        input.value = value;
      }
    });
  }

  /**
   * Maneja el envío del formulario de búsqueda
   */
  function handleSearchSubmit(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const input = form.querySelector("input[type='search']");
    const query = input ? input.value.trim() : "";

    // Sincronizar con otro input
    syncInputs(query);

    if (query.length === 0) {
      console.warn("Búsqueda vacía");
      return;
    }

    // Navegar a la vista de búsqueda con el parámetro
    window.location.hash = `#search?q=${encodeURIComponent(query)}`;

    // Quitar foco para esconder teclado en móvil
    if (input) input.blur();
  }

  // Inicialización al cargar el DOM
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Search Bar Logic Loaded");

    SEARCH_CONFIG.forEach((config) => {
      const form = document.getElementById(config.formId);
      if (form) {
        form.addEventListener("submit", handleSearchSubmit);
      }
    });
  });
})(window, document);
