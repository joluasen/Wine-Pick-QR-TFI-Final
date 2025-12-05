// public/js/views/adminView.js

let initialized = false;

export function initAdminView() {
  if (initialized) return;
  console.log('Vista Admin inicializada');

  const form = document.getElementById('admin-login-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const userInput = document.getElementById('admin-user');
      const passInput = document.getElementById('admin-pass');

      const user = userInput?.value?.trim() || '';
      const pass = passInput?.value?.trim() || '';

      // Más adelante se conectará al endpoint de login admin.
      console.log('Intento de login admin:', { user, pass });
    });
  }

  initialized = true;
}
