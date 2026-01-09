<?php
/**
 * Navegación para administradores
 */
header('Content-Type: text/html; charset=utf-8');
?>
<!-- MOBILE BOTTOM NAV -->
<nav class="bottom-nav d-md-none">
  <a href="#admin" class="bottom-nav-item" data-link="#admin-metrics" aria-label="Métricas">
    <i class="fas fa-tachometer-alt"></i>
    <span>Métricas</span>
  </a>
  <a href="#admin-products" class="bottom-nav-item" data-link="#admin-products" aria-label="Productos">
    <i class="fas fa-boxes"></i>
    <span>Productos</span>
  </a>
  <!-- Enlace central flotante para QR admin -->
  <a href="#admin-scan" class="bottom-nav-item bottom-nav-scan" data-link="#admin-scan" aria-label="Escanear QR" title="Escanear QR">
    <i class="fas fa-qrcode"></i>
  </a>
  <a href="#admin-promotions" class="bottom-nav-item" data-link="#admin-promotions" aria-label="Promociones">
    <i class="fas fa-tag"></i>
    <span>Promociones</span>
  </a>
  <!-- Dropdown más opciones -->
  <div class="dropdown bottom-nav-item dropup">
    <a href="#" role="button" id="admin-dropdown-trigger" data-bs-toggle="dropdown" aria-expanded="false" class="d-flex flex-column align-items-center">
      <i class="fas fa-ellipsis-h"></i>
      <span>Más</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="admin-dropdown-trigger">
      <li><a class="dropdown-item" href="#" id="btn-new-product-mobile">
        <i class="fas fa-plus-circle me-2"></i>Nuevo Producto
      </a></li>
      <li><a class="dropdown-item" href="#">
        <i class="fas fa-user me-2"></i>Perfil
      </a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="#" id="logout-btn-mobile">
        <i class="fas fa-sign-out-alt me-2"></i>Salir
      </a></li>
    </ul>
  </div>
</nav>

<!-- DESKTOP SIDEBAR NAV -->
<nav class="sidebar-nav d-none d-md-flex">
  <a href="#admin-metrics" class="sidebar-nav-item" data-link="#admin-metrics" title="Métricas" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-tachometer-alt"></i>
    <span>Métricas</span>
  </a>
  <a href="#" id="btn-new-product-desktop" class="sidebar-nav-item" title="Nuevo producto" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-plus-circle"></i>
    <span>Nuevo Producto</span>
  </a>
  <a href="#admin-products" class="sidebar-nav-item" data-link="#admin-products" title="Productos" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-boxes"></i>
    <span>Productos</span>
  </a>
  <a href="#admin-promotions" class="sidebar-nav-item" data-link="#admin-promotions" title="Promociones" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-tag"></i>
    <span>Promociones</span>
  </a>
  <div class="sidebar-divider"></div>
  <a href="#" id="logout-btn-desktop" class="sidebar-nav-item mt-auto" title="Cerrar sesión" data-bs-toggle="tooltip" data-bs-placement="right" style="color: var(--sidebar-link-color, #7a003c);">
    <i class="fas fa-sign-out-alt" style="color: var(--sidebar-link-icon, #7a003c);"></i>
    <span>Salir</span>
  </a>
</nav>
