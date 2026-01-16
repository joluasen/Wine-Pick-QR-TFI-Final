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
 * @returns {HTMLElement} El elemento toast creado
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
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, duration);
  }

  return toast;
}

/**
 * Muestra una secuencia de toasts con delay entre ellos
 * Útil para operaciones que tienen múltiples fases (ej: "Cargando..." → "Completado")
 * @param {Array<{message: string, type: string, duration?: number, delay?: number}>} sequence
 * @returns {Promise<void>}
 * 
 * Ejemplo:
 * await showToastSequence([
 *   { message: 'Eliminando...', type: 'info', duration: 0, delay: 0 },
 *   { message: 'Producto eliminado', type: 'success', delay: 2000 }
 * ]);
 */
export async function showToastSequence(sequence) {
  for (let i = 0; i < sequence.length; i++) {
    const { message, type = 'info', duration = 3500, delay = 0 } = sequence[i];

    // Esperar el delay (si es mayor a 0)
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Si hay un toast anterior activo, removerlo
    const container = initToastContainer();
    const activeToasts = container.querySelectorAll('.toast.show');
    activeToasts.forEach((toast) => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    });

    // Mostrar el nuevo toast
    showToast(message, type, duration);

    // Si no hay duración (permanente) y no es el último, esperar antes de cambiar
    if (i < sequence.length - 1 && duration === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
