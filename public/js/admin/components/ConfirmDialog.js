/**
 * ConfirmDialog.js
 * Componente reutilizable de diálogo de confirmación
 * Reemplaza el alert/confirm nativo del navegador con estilo personalizado
 */

/**
 * Muestra un diálogo de confirmación personalizado
 * @param {Object} options - Opciones del diálogo
 * @param {string} options.title - Título del diálogo
 * @param {string} options.message - Mensaje del diálogo
 * @param {string} options.confirmText - Texto del botón confirmar (default: "Eliminar")
 * @param {string} options.cancelText - Texto del botón cancelar (default: "Cancelar")
 * @param {string} options.confirmClass - Clase del botón (default: "btn-danger")
 * @returns {Promise<boolean>} true si confirma, false si cancela
 */
export function showConfirmDialog(options = {}) {
  return new Promise((resolve) => {
    const {
      title = "Confirmar",
      message = "¿Estás seguro?",
      confirmText = "Eliminar",
      cancelText = "Cancelar",
      confirmClass = "btn-danger",
    } = options;

    // Crear overlay
    const overlay = document.createElement("div");
    overlay.className = "confirm-dialog-overlay";
    overlay.innerHTML = `
      <div class="confirm-dialog-content">
        <div class="confirm-dialog-header">
          <h5 class="confirm-dialog-title">${title}</h5>
        </div>
        
        <div class="confirm-dialog-body">
          <p>${message}</p>
        </div>
        
        <div class="confirm-dialog-footer">
          <button class="btn btn-sm btn-outline-secondary confirm-dialog-cancel">
            ${cancelText}
          </button>
          <button class="btn btn-sm ${confirmClass} confirm-dialog-confirm">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Función para cerrar el diálogo
    const closeDialog = (result) => {
      overlay.classList.add("closing");
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 300);
    };

    // Eventos
    const confirmBtn = overlay.querySelector(".confirm-dialog-confirm");
    const cancelBtn = overlay.querySelector(".confirm-dialog-cancel");

    confirmBtn.addEventListener("click", () => closeDialog(true));
    cancelBtn.addEventListener("click", () => closeDialog(false));

    // Cerrar con Escape
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", handleEscape);
        closeDialog(false);
      }
    };
    document.addEventListener("keydown", handleEscape);

    // Hacer focus en el botón cancelar por defecto
    setTimeout(() => cancelBtn.focus(), 100);

    // Cerrar al hacer click fuera del diálogo
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeDialog(false);
      }
    });
  });
}
