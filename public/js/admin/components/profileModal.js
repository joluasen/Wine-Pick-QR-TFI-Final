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
              <input type="password" class="form-control" id="currentPassword" name="currentPassword" required autocomplete="off" style="padding-right:2.5em;width:100%;box-sizing:border-box;" value="">
              <button type="button" class="btn-eye" tabindex="-1" aria-label="Mostrar/Ocultar" data-eye="currentPassword" style="position:absolute;right:0.5em;top:50%;transform:translateY(-50%);background:transparent;border:none;padding:0;margin:0;height:1.8em;width:2em;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;">
                <i class="fas fa-eye" style="color:#888;font-size:1.1em;"></i>
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label for="newPassword" class="form-label">Nueva Contraseña <span class="text-danger">*</span></label>
            <div class="input-eye-wrapper" style="position:relative;display:flex;align-items:center;">
              <input type="password" class="form-control" id="newPassword" name="newPassword" required autocomplete="off" style="padding-right:2.5em;width:100%;box-sizing:border-box;" value="">
              <button type="button" class="btn-eye" tabindex="-1" aria-label="Mostrar/Ocultar" data-eye="newPassword" style="position:absolute;right:0.5em;top:50%;transform:translateY(-50%);background:transparent;border:none;padding:0;margin:0;height:1.8em;width:2em;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;">
                <i class="fas fa-eye" style="color:#888;font-size:1.1em;"></i>
              </button>
            </div>
            <small class="form-text text-muted">Mínimo 8 caracteres, incluir mayúsculas, minúsculas y caracteres especiales.</small>
          </div>

          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña <span class="text-danger">*</span></label>
            <div class="input-eye-wrapper" style="position:relative;display:flex;align-items:center;">
              <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required autocomplete="off" style="padding-right:2.5em;width:100%;box-sizing:border-box;" value="">
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

  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast('Todos los campos son requeridos', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('Las contraseñas nuevas no coinciden', 'error');
    return;
  }

  if (currentPassword === newPassword) {
    showToast('La nueva contraseña debe ser diferente a la actual', 'error');
    return;
  }

  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    showToast(validation.message, 'error');
    return;
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

    showToast('Contraseña actualizada correctamente', 'success');
    modalManager.close();
  } catch (error) {
    showToast(error.message || 'Error al cambiar la contraseña', 'error');
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
      }
      
      // Configurar botón de cancelar
      const cancelBtn = document.querySelector('[data-dismiss-modal]');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modalManager.close());
      }

      // Configurar botones de ojo para mostrar/ocultar contraseña
      document.querySelectorAll('.btn-eye').forEach(btn => {
        btn.addEventListener('click', () => {
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
  const profileBtnMobile = document.getElementById('profile-btn-mobile');
  const profileBtnDesktop = document.getElementById('profile-btn-desktop');

  if (profileBtnMobile) {
    profileBtnMobile.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showProfileModal();
    });
  }

  if (profileBtnDesktop) {
    profileBtnDesktop.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showProfileModal();
    });
  }
}
