// public/js/views/searchView.js
/**
 * Controlador de la vista 'search'
 *
 * Responsabilidad:
 * - Enlazar el formulario de búsqueda y mostrar resultados dentro del
 *   contenedor proporcionado.
 * - Ejecuta una petición GET a `/api/public/productos?search=` y renderiza una
 *   lista simple con nombre y código público del producto.
 */
let initialized = false;

export function initSearchView(container) {
  if (initialized) return;

  const form = container.querySelector('#search-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = container.querySelector('#search-input');
      const query = input?.value?.trim() || '';

      // Validación mínima de entrada
      const results = container.querySelector('#search-results');
      if (query.length === 0) {
        if (results) results.innerHTML = '<p>Ingresá un texto de búsqueda.</p>';
        return;
      }

      // Solicitar al backend de forma simple y renderizar resultados
      fetch(`./api/public/productos?search=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((json) => {
          if (!results) return;
          if (!json.ok) {
            results.innerHTML = `<p>Error: ${json.error?.message || 'Respuesta inválida'}</p>`;
            return;
          }

          const products = json.data?.products || [];
          if (products.length === 0) {
            results.innerHTML = '<p>No se encontraron productos.</p>';
            return;
          }

          const list = document.createElement('ul');
          products.forEach((p) => {
            const li = document.createElement('li');
            li.textContent = `${p.name} — ${p.public_code}`;
            list.appendChild(li);
          });
          results.innerHTML = '';
          results.appendChild(list);
        })
        .catch((err) => {
          if (results) results.innerHTML = `<p>Error al consultar la API: ${err.message}</p>`;
        });
    });
  }

  initialized = true;
}
