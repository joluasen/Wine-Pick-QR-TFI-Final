/**
 * authService.js
 * Servicio de autenticación - centraliza todas las operaciones de auth
 */

/**
 * Verifica si el usuario está autenticado
 * @returns {Promise<boolean>}
 */
export async function checkAuth() {
  try {
    const response = await fetch('./api/admin/me', {
      headers: { Accept: 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Cierra la sesión del usuario
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await fetch('./api/admin/logout', { method: 'POST' });
  } catch {
    // Ignorar errores de red
  }
}

/**
 * Redirige al usuario al login
 */
export function redirectToLogin() {
  window.location.hash = '#login';
}

/**
 * Redirige al usuario al home
 */
export function redirectToHome() {
  window.location.hash = '#home';
}
