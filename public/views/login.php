<?php
/**
 * Vista de Login (modal custom, sin Bootstrap)
 */
?>
<div id="login-modal-overlay" class="modal-overlay"></div>
<div id="login-modal-page" class="modal modal-sm" style="display:flex; align-items:center; justify-content:center; min-height:100vh;">
  <div class="modal-content" style="position:relative; padding:0; margin:auto; min-width:0; width:100%; max-width:400px; background:#fff; border-radius:18px; box-shadow:0 8px 32px rgba(0,0,0,0.22);">
    <button id="login-close-btn" class="modal-close" aria-label="Cerrar">&times;</button>
    <div class="modal-body" style="padding: 2.5rem 1.25rem 2.25rem 1.25rem; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:350px;">
      <div class="text-center mb-3" style="width:100%;">
        <h3 class="fw-bold" style="margin-bottom:4px; letter-spacing:1px;">WINE-PICK-QR</h3>
        <p class="text-muted" style="margin:0; font-size:1.05rem;">Acceso al panel administrativo</p>
      </div>

      <form id="login-form" style="width:100%; max-width:320px; margin:0 auto;">
        <div class="mb-3">
          <label for="login-username" class="form-label fw-semibold">Usuario</label>
          <input
            type="text"
            class="form-control"
            id="login-username"
            placeholder="Ingresa tu usuario"
            autocomplete="username"
            required
            style="font-size:1.08rem;"
          >
        </div>

        <div class="mb-4">
          <label for="login-password" class="form-label fw-semibold">Contraseña</label>
          <input
            type="password"
            class="form-control"
            id="login-password"
            placeholder="Ingresa tu contraseña"
            autocomplete="current-password"
            required
            style="font-size:1.08rem;"
          >
        </div>

        <div style="display:flex; gap:10px; width:100%; justify-content:space-between;">
          <button type="submit" class="btn-modal btn-modal-primary" style="flex:2; min-width:0;">Ingresar</button>
        </div>
      </form>
    </div>
  </div>
</div>
