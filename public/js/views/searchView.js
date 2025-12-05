// public/js/views/searchView.js

let initialized = false;

export function initSearchView() {
  if (initialized) return;
  console.log('Vista Búsqueda inicializada');

  const form = document.getElementById('search-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.getElementById('search-input');
      const query = input?.value?.trim() || '';

      // Por ahora solo mostramos en consola.
      // Más adelante: llamada a la API de búsqueda (HU-C2).
      console.log('Buscar productos con texto:', query);
    });
  }

  initialized = true;
}
