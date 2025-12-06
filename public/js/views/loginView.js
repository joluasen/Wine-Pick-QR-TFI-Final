// public/js/views/loginView.js
/**
 * Controlador de vista de login de administrador.
 */

function setStatus(el, message, type = 'info') {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

export function initLoginView(container) {
  const form = container.querySelector('#login-form');
  const statusEl = container.querySelector('#login-status');
  const userInput = container.querySelector('#login-username');
  const passInput = container.querySelector('#login-password');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = userInput?.value?.trim() || '';
    const password = passInput?.value || '';

    if (!username || !password) {
      setStatus(statusEl, 'Ingresa usuario y contraseña.', 'error');
      return;
    }

    setStatus(statusEl, 'Autenticando...', 'info');

    try {
      const res = await fetch('./api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        const msg = json?.error?.message || 'Credenciales inválidas';
        setStatus(statusEl, msg, 'error');
        return;
      }

      setStatus(statusEl, 'Login exitoso. Redirigiendo...', 'success');
      setTimeout(() => {
        window.location.hash = '#admin';
      }, 400);
    } catch (err) {
      setStatus(statusEl, `Error de conexión: ${err.message}`, 'error');
    }
  });
}
