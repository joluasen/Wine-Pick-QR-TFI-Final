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
          
          >
        </div>

        <div class="form-group">
          <label for="login-password" class="form-label">Contraseña</label>
          <div class="input-eye-wrapper" style="position:relative;display:flex;align-items:center;">
            <input
              type="password"
              class="form-control"
              id="login-password"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
          
              style="padding-right:2.5em;width:100%;box-sizing:border-box;"
            >
            <button type="button" class="btn-eye" tabindex="-1" aria-label="Mostrar/Ocultar" data-eye="login-password" style="position:absolute;right:0.5em;top:50%;transform:translateY(-50%);background:transparent;border:none;padding:0;margin:0;height:1.8em;width:2em;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;">
              <i class="fas fa-eye" style="color:#888;font-size:1.1em;"></i>
            </button>
          </div>
        </div>

        <button type="submit" class="btn-modal btn-modal-primary login-btn">Ingresar</button>
      </form>
    </div>
  </div>
</div>
