// public/js/views/loginView.js
/**
 * Controlador de vista de login de administrador.
 */

function setStatus(el, message, type = 'info') {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

async function handleLogin(username, password, statusEl, onSuccess) {
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
      if (onSuccess) onSuccess();
      window.location.hash = '#admin';
    }, 400);
  } catch (err) {
    setStatus(statusEl, `Error de conexión: ${err.message}`, 'error');
  }
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
    await handleLogin(username, password, statusEl);
  });
}

// Inicializar modal de login
export function initLoginModal() {
  // console.log('Iniciando login modal...');
  
  const modalForm = document.getElementById('login-form-modal');
  // console.log('Formulario encontrado:', !!modalForm);
  
  if (!modalForm) {
    // console.warn('No se encontró el formulario de login modal');
    return;
  }

  const statusEl = document.getElementById('login-status-modal');
  const userInput = document.getElementById('login-username-modal');
  const passInput = document.getElementById('login-password-modal');
  const loginModalEl = document.getElementById('loginModal');
  const submitBtn = modalForm.querySelector('button[type="submit"]');

  // console.log('Elementos encontrados:', {
  //   statusEl: !!statusEl,
  //   userInput: !!userInput,
  //   passInput: !!passInput,
  //   loginModalEl: !!loginModalEl,
  //   submitBtn: !!submitBtn
  // });

  // Debug: logs en inputs
  // if (userInput) {
  //   userInput.addEventListener('input', (e) => {
  //     console.log('Input usuario:', e.target.value);
  //   });
  // }
  
  // if (passInput) {
  //   passInput.addEventListener('input', (e) => {
  //     console.log('Input contraseña ingresado');
  //   });
  // }

  // Debug: log en click del botón
  // if (submitBtn) {
  //   submitBtn.addEventListener('click', (e) => {
  //     console.log('Botón Ingresar clickeado');
  //   });
  // }

  modalForm.addEventListener('submit', async (event) => {
    // console.log('✓ EVENTO SUBMIT CAPTURADO');
    event.preventDefault();
    
    const username = userInput?.value?.trim() || '';
    const password = passInput?.value || '';
    
    // console.log('Intentando login con usuario:', username);
    
    await handleLogin(username, password, statusEl, () => {
      // console.log('Login exitoso, cerrando modal');
      // Cerrar modal al éxito usando Bootstrap API
      if (loginModalEl && window.bootstrap) {
        try {
          const modal = window.bootstrap.Modal.getInstance(loginModalEl);
          if (modal) {
            modal.hide();
            // console.log('Modal cerrado');
          }
        } catch (err) {
          // console.error('Error cerrando modal:', err);
        }
      }
    });
  });

  // console.log('Login modal inicializado correctamente');
}
