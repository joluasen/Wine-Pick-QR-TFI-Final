/**
 * Valida en vivo los campos del modal de perfil (igual que login)
 * Quita is-invalid al escribir si hay valor, la pone si queda vacío
 */
function attachLiveValidationProfile(inputs) {
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
}
/**
 * profileModal.js
 * Gestión del modal de perfil y cambio de contraseña del administrador
 */

import { showToast } from './Toast.js';
import { fetchJSON } from '../../core/utils.js';
import { modalManager } from '../../core/modalManager.js';

/**
 * Valida que la contraseña cumpla con los requisitos de seguridad
 */
function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una minúscula' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una mayúscula' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos un carácter especial' };
  }
  return { valid: true };
}

/**
 * Genera el HTML del modal de perfil usando las clases del proyecto
 */
function generateProfileModalHTML() {
  return `
    <div class="product-modal-wrapper">
      <h2 class="product-modal-title">
        <i class="fas fa-user me-2"></i>Mi Perfil
      </h2>

      <form id="changePasswordForm" class="product-modal-form" novalidate>
        <div class="form-section mb-4">
          <h4 class="form-section-title">Cambiar Contraseña</h4>
          
          <div class="mb-3">
            <label for="currentPassword" class="form-label">Contraseña Actual <span class="text-danger">*</span></label>
            <div class="input-eye-wrapper" style="position:relative;display:flex;align-items:center;">
              <input type="password" class="form-control" id="currentPassword" name="currentPassword" autocomplete="off" style="padding-right:2.5em;width:100%;box-sizing:border-box;" value="">
              <button type="button" class="btn-eye" tabindex="-1" aria-label="Mostrar/Ocultar" data-eye="currentPassword" style="position:absolute;right:0.5em;top:50%;transform:translateY(-50%);background:transparent;border:none;padding:0;margin:0;height:1.8em;width:2em;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;">
                <i class="fas fa-eye" style="color:#888;font-size:1.1em;"></i>
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label for="newPassword" class="form-label">Nueva Contraseña <span class="text-danger">*</span></label>
            <div class="input-eye-wrapper" style="position:relative;display:flex;align-items:center;">
              <input type="password" class="form-control" id="newPassword" name="newPassword" autocomplete="off" style="padding-right:2.5em;width:100%;box-sizing:border-box;" value="">
              <button type="button" class="btn-eye" tabindex="-1" aria-label="Mostrar/Ocultar" data-eye="newPassword" style="position:absolute;right:0.5em;top:50%;transform:translateY(-50%);background:transparent;border:none;padding:0;margin:0;height:1.8em;width:2em;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;">
                <i class="fas fa-eye" style="color:#888;font-size:1.1em;"></i>
              </button>
            </div>
            <small class="form-text text-muted">Mínimo 8 caracteres, incluir mayúsculas, minúsculas y caracteres especiales.</small>
          </div>

          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña <span class="text-danger">*</span></label>
            <div class="input-eye-wrapper" style="position:relative;display:flex;align-items:center;">
              <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" autocomplete="off" style="padding-right:2.5em;width:100%;box-sizing:border-box;" value="">
              <button type="button" class="btn-eye" tabindex="-1" aria-label="Mostrar/Ocultar" data-eye="confirmPassword" style="position:absolute;right:0.5em;top:50%;transform:translateY(-50%);background:transparent;border:none;padding:0;margin:0;height:1.8em;width:2em;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;">
                <i class="fas fa-eye" style="color:#888;font-size:1.1em;"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="d-flex gap-2 justify-content-end">
          <button type="submit" class="btn-modal btn-modal-primary" id="submitChangePassword">
            <i class="fas fa-save me-1"></i>Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  `;
}

/**
 * Maneja el envío del formulario
 */
async function handleChangePassword(e) {
  e.preventDefault();

  const form = e.target;
  const currentPassword = form.currentPassword.value.trim();
  const newPassword = form.newPassword.value;
  const confirmPassword = form.confirmPassword.value;

  // Validación visual
  const currentInput = form.currentPassword;
  const newInput = form.newPassword;
  const confirmInput = form.confirmPassword;
  let hasError = false;
  if (!currentPassword) { currentInput.classList.add('is-invalid'); hasError = true; } else { currentInput.classList.remove('is-invalid'); }
  if (!newPassword) { newInput.classList.add('is-invalid'); hasError = true; } else { newInput.classList.remove('is-invalid'); }
  if (!confirmPassword) { confirmInput.classList.add('is-invalid'); hasError = true; } else { confirmInput.classList.remove('is-invalid'); }

  if (hasError) return;

  // Validar que las contraseñas coincidan
  if (newPassword !== confirmPassword) {
    newInput.classList.add('is-invalid');
    confirmInput.classList.add('is-invalid');
    return;
  } else {
    newInput.classList.remove('is-invalid');
    confirmInput.classList.remove('is-invalid');
  }

  // Validar que la nueva contraseña sea diferente a la actual
  if (currentPassword === newPassword) {
    newInput.classList.add('is-invalid');
    return;
  } else {
    newInput.classList.remove('is-invalid');
  }

  // Validar seguridad de la nueva contraseña
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    newInput.classList.add('is-invalid');
    return;
  } else {
    newInput.classList.remove('is-invalid');
  }

  const submitBtn = document.getElementById('submitChangePassword');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Cambiando...';

  try {
    // Usar base URL dinámica
    const { getBasePath } = await import('../../core/utils.js');
    const baseUrl = getBasePath();
    await fetchJSON(baseUrl + 'api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword
      })
    });

    // Éxito visual: limpiar y cerrar
    form.reset();
    modalManager.close();
  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

/**
 * Muestra el modal de perfil
 */
function showProfileModal() {
  const content = generateProfileModalHTML();
  modalManager.open('profile-modal', content, {
    disableClickOutside: true,
    onOpen: () => {
      const form = document.getElementById('changePasswordForm');
      if (form) {
        form.addEventListener('submit', handleChangePassword);
        attachLiveValidationProfile([
          form.currentPassword,
          form.newPassword,
          form.confirmPassword
        ]);
      }
      
      // Configurar botón de cancelar
      const cancelBtn = document.querySelector('[data-dismiss-modal]');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modalManager.close());
      }

      // Configurar botones de ojo para mostrar/ocultar contraseña
      document.querySelectorAll('.btn-eye').forEach(btn => {
        btn.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const inputId = btn.getAttribute('data-eye');
          const input = document.getElementById(inputId);
          if (input) {
            if (input.type === 'password') {
              input.type = 'text';
              btn.querySelector('i').classList.remove('fa-eye');
              btn.querySelector('i').classList.add('fa-eye-slash');
            } else {
              input.type = 'password';
              btn.querySelector('i').classList.remove('fa-eye-slash');
              btn.querySelector('i').classList.add('fa-eye');
            }
          }
        });
      });
    }
  });
}

/**
 * Inicializa el modal de perfil
 */
export function setupProfileModal() {
  function bindProfileEvents() {
    const profileBtnMobile = document.getElementById('profile-btn-mobile');
    const profileBtnDesktop = document.getElementById('profile-btn-desktop');

    if (profileBtnMobile && !profileBtnMobile._profileBound) {
      profileBtnMobile.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showProfileModal();
      });
      profileBtnMobile._profileBound = true;
    }
    if (profileBtnDesktop && !profileBtnDesktop._profileBound) {
      profileBtnDesktop.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showProfileModal();
      });
      profileBtnDesktop._profileBound = true;
    }
  }

  // Intentar bind inmediato
  bindProfileEvents();

  // Observer para reintentar si el nav se renderiza después
  const observer = new MutationObserver(() => {
    bindProfileEvents();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Opcional: desconectar observer tras éxito
  setTimeout(() => observer.disconnect(), 5000);
}
