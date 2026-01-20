/**
 * loginView.js - Manejo del formulario de login
 */

import { fetchJSON } from '../core/utils.js';
import { showToast } from '../admin/components/Toast.js';

// Toggle clase de error para imitar validación de modales de producto/promoción
const toggleInvalid = (input, isInvalid) => {
  if (!input) return;
  input.classList.toggle('is-invalid', Boolean(isInvalid));
};

const attachLiveValidation = (inputs) => {
  inputs.forEach((input) => {
    if (!input) return;
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid') && input.value.trim()) {
        input.classList.remove('is-invalid');
      }
      // Si el input queda vacío, volver a poner is-invalid
      if (!input.value.trim()) {
        input.classList.add('is-invalid');
      }
    });
  });
};

/**
 * Maneja el proceso de login
 */
async function handleLogin(username, password) {
  if (!username || !password) {
    showToast('Usuario y contraseña son requeridos.', 'error');
    return false;
  }

  try {
    const data = await fetchJSON('./api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    showToast('Login exitoso. Redirigiendo...', 'success');

    // Redirigir al panel admin y forzar evento hashchange para SPA móvil
    setTimeout(() => {
      // Usar navigate del router para forzar inicialización aunque el hash no cambie
      import('../core/router.js').then(({ navigate }) => {
        navigate('#admin');
      });
    }, 500);

    return true;
  } catch (err) {
    if (err.status === 401) {
      showToast('Credenciales inválidas', 'error');
    } else {
      showToast(`Error: ${err.message}`, 'error');
    }
    return false;
  }
}

/**
 * Inicializa la vista de login
 */
export function initLoginView(container) {
  const form = document.getElementById('login-form');
  if (!form) return;

  const userInput = document.getElementById('login-username');
  const passInput = document.getElementById('login-password');

  attachLiveValidation([userInput, passInput]);

  const modalEl = document.getElementById('login-modal-page');
  const closeBtn = document.getElementById('login-close-btn');

  // Desactivar scroll del body al abrir el modal
  document.body.style.overflow = 'hidden';

  // OJO: Mostrar/Ocultar contraseña
  const eyeBtn = document.querySelector('.btn-eye[data-eye="login-password"]');
  if (eyeBtn && passInput) {
    eyeBtn.addEventListener('click', () => {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeBtn.querySelector('i').classList.remove('fa-eye');
        eyeBtn.querySelector('i').classList.add('fa-eye-slash');
      } else {
        passInput.type = 'password';
        eyeBtn.querySelector('i').classList.remove('fa-eye-slash');
        eyeBtn.querySelector('i').classList.add('fa-eye');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = userInput?.value?.trim() || '';
    const password = passInput?.value || '';

    const userEmpty = username === '';
    const passEmpty = password === '';

    // Siempre forzar is-invalid si está vacío
    if (userEmpty) userInput.classList.add('is-invalid');
    if (passEmpty) passInput.classList.add('is-invalid');
    if (!userEmpty) userInput.classList.remove('is-invalid');
    if (!passEmpty) passInput.classList.remove('is-invalid');

    if (userEmpty || passEmpty) {
      showToast('Completa usuario y contraseña.', 'error');
      return;
    }

    const success = await handleLogin(username, password);
    if (success) {
      setTimeout(() => {
        window.dispatchEvent(new Event('hashchange'));
      }, 600);
    }
  });

  // Cerrar modal navegando a home
  const closeModal = () => {
    document.body.style.overflow = '';
    window.location.hash = '#home';
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Cerrar al clickear overlay (fuera del contenido)
  // BLOQUEADO: Solo se puede cerrar con la X
  // if (modalEl) {
  //   modalEl.addEventListener('click', (e) => {
  //     if (e.target === modalEl) {
  //       document.body.style.overflow = '';
  //       closeModal();
  //     }
  //   });
  //   // Asegurar que se muestre el modal (modals.css usa display:none por defecto)
  //   modalEl.style.display = 'flex';
  // }
  if (modalEl) {
    modalEl.style.display = 'flex';
  }

  // Auto-focus en el campo de usuario
  if (userInput) {
    userInput.focus();
  }
}

/**
 * Inicializa el modal de login (compatibilidad)
 */
export function initLoginModal() {
  const form = document.getElementById('login-form-modal');
  if (!form) return;

  // Evitar agregar listeners múltiples
  if (form.dataset.initialized === 'true') {
    return;
  }
  form.dataset.initialized = 'true';

  const userInput = document.getElementById('login-username-modal');
  const passInput = document.getElementById('login-password-modal');

  attachLiveValidation([userInput, passInput]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = userInput?.value?.trim() || '';
    const password = passInput?.value || '';

    const userEmpty = username === '';
    const passEmpty = password === '';

    toggleInvalid(userInput, userEmpty);
    toggleInvalid(passInput, passEmpty);

    if (userEmpty || passEmpty) {
      showToast('Completa usuario y contraseña.', 'error');
      return;
    }

    const success = await handleLogin(username, password);
    
    if (success) {
      // Limpiar formulario
      form.reset();
    }
  });

  // Cerrar modal al hacer clic en el botón cancelar
  const modalEl = document.getElementById('loginModal');
  if (modalEl) {
    modalEl.addEventListener('hidden.bs.modal', () => {
      form.reset();
    });
  }
}
