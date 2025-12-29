/**
 * Toast.js
 * Componente reutilizable para mostrar notificaciones toast
 */

let toastContainer = null;

/**
 * Inicializa el contenedor de toasts
 */
function initToastContainer() {
  if (toastContainer) return toastContainer;

  toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  return toastContainer;
}

/**
 * Muestra un mensaje toast
 * @param {string} message - Mensaje a mostrar
 * @param {('success'|'error'|'info'|'warning')} type - Tipo de mensaje
 * @param {number} duration - Duración en ms (default: 3500)
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = initToastContainer();

  const iconMap = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    info: 'bi-info-circle-fill',
    warning: 'bi-exclamation-triangle-fill'
  };

  const bgMap = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-primary',
    warning: 'bg-warning'
  };

  const icon = iconMap[type] || iconMap.info;
  const bg = bgMap[type] || bgMap.info;

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white ${bg} border-0 show`;
  toast.role = 'alert';
  toast.ariaLive = 'assertive';
  toast.ariaAtomic = 'true';

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi ${icon} me-2"></i>${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>
  `;

  container.appendChild(toast);

  // Auto-remover después de la duración especificada
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, duration);

  return toast;
}
