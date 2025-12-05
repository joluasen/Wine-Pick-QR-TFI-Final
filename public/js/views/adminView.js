// public/js/views/adminView.js
/**
 * Controlador de la vista 'admin'
 *
 * Responsabilidad:
 * - Gestionar el formulario de acceso de administradores dentro del
 *   contenedor proporcionado.
 * - Este módulo actúa como punto de extensión para integrar autenticación
 *   y navegación hacia el panel administrativo.
 */
let initialized = false;

export function initAdminView(container) {
  if (initialized) return;

  const form = container.querySelector('#admin-login-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const userInput = container.querySelector('#admin-user');
      const passInput = container.querySelector('#admin-pass');

      const user = userInput?.value?.trim() || '';
      const pass = passInput?.value?.trim() || '';

      // Hook: aquí se puede invocar el endpoint de autenticación del backend.
      console.log('Intento de login admin:', { user, pass });
    });
  }

  initialized = true;
}
