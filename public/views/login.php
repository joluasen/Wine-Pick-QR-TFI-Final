<?php
/**
 * Vista de Login (modal custom, sin Bootstrap)
 */
?>
<div id="login-modal-page" class="modal">
  <div class="modal-content">
    <button id="login-close-btn" class="modal-close" aria-label="Cerrar">&times;</button>
    <div class="modal-body">
      <div class="login-header">
        <h3 class="login-title">WINE-PICK-QR</h3>
        <p class="login-subtitle">Acceso al panel administrativo</p>
      </div>

      <form id="login-form" class="login-form">
        <div class="form-group">
          <label for="login-username" class="form-label">Usuario</label>
          <input
            type="text"
            class="form-control"
            id="login-username"
            placeholder="Ingresa tu usuario"
            autocomplete="username"
            required
          >
        </div>

        <div class="form-group">
          <label for="login-password" class="form-label">Contraseña</label>
          <input
            type="password"
            class="form-control"
            id="login-password"
            placeholder="Ingresa tu contraseña"
            autocomplete="current-password"
            required
          >
        </div>

        <button type="submit" class="btn-modal btn-modal-primary login-btn">Ingresar</button>
      </form>
    </div>
  </div>
</div>
