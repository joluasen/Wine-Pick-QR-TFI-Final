// public/js/views/loginView.js
/**
 * Vista de login de administrador
 */

import { setStatus, fetchJSON } from '../core/utils.js';

/**
 * Maneja el proceso de login
 */
async function handleLogin(username, password, statusEl, onSuccess) {
  if (!username || !password) {
    setStatus(statusEl, 'Ingresá usuario y contraseña.', 'error');
    return;
  }
  
  setStatus(statusEl, 'Autenticando...', 'info');
  
  try {
    const data = await fetchJSON('./api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    setStatus(statusEl, 'Login exitoso. Redirigiendo...', 'success');
    
    setTimeout(() => {
      if (onSuccess) onSuccess();
      window.location.hash = '#admin';
    }, 400);
    
  } catch (err) {
    if (err.status === 401) {
      setStatus(statusEl, 'Credenciales inválidas', 'error');
    } else {
      setStatus(statusEl, `Error: ${err.message}`, 'error');
    }
  }
}

/**
 * Inicializa la vista de login (página completa)
 */
export function initLoginView(container) {
  const form = container.querySelector('#login-form');
  const statusEl = container.querySelector('#login-status');
  const userInput = container.querySelector('#login-username');
  const passInput = container.querySelector('#login-password');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = userInput?.value?.trim() || '';
    const password = passInput?.value || '';
    
    await handleLogin(username, password, statusEl);
  });
}

/**
 * Inicializa el modal de login (Bootstrap modal)
 * Se llama desde app.js para el modal global
 */
export function initLoginModal() {
  const modalForm = document.getElementById('login-form-modal');
  if (!modalForm) return;
  
  const statusEl = document.getElementById('login-status-modal');
  const userInput = document.getElementById('login-username-modal');
  const passInput = document.getElementById('login-password-modal');
  const modalEl = document.getElementById('loginModal');
  
  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = userInput?.value?.trim() || '';
    const password = passInput?.value || '';
    
    await handleLogin(username, password, statusEl, () => {
      // Cerrar modal al éxito
      if (modalEl && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
    });
  });
}
