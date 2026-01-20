<?php
/**
 * Navegación para administradores
 */
header('Content-Type: text/html; charset=utf-8');
?>
<!-- MOBILE BOTTOM NAV -->
<nav class="bottom-nav d-md-none">
  <a href="#admin" class="bottom-nav-item" data-link="#admin-metrics" aria-label="Métricas">
    <i class="fas fa-chart-line"></i>
    <span>Métricas</span>
  </a>
  <!-- Dropdown Productos Mobile -->
  <div class="dropdown bottom-nav-item dropup">
    <a href="#" role="button" id="products-dropdown-mobile" data-bs-toggle="dropdown" aria-expanded="false" class="d-flex flex-column align-items-center">
      <i class="fas fa-boxes"></i>
      <span>Productos</span>
    </a>
    <ul class="dropdown-menu" aria-labelledby="products-dropdown-mobile">
      <li><a class="dropdown-item" href="#" id="btn-new-product-mobile">
        <i class="fas fa-plus-circle me-2"></i>Nuevo Producto
      </a></li>
      <li><a class="dropdown-item" href="#admin-products" data-link="#admin-products">
        <i class="fas fa-list me-2"></i>Lista de Productos
      </a></li>
    </ul>
  </div>
  <!-- Enlace central flotante para QR admin -->
  <a href="#admin-scan" class="bottom-nav-item bottom-nav-scan" data-link="#admin-scan" aria-label="Escanear QR" title="Escanear QR">
    <i class="fas fa-qrcode"></i>
  </a>
  <!-- Dropdown Promociones Mobile -->
  <div class="dropdown bottom-nav-item dropup">
    <a href="#" role="button" id="promotions-dropdown-mobile" data-bs-toggle="dropdown" aria-expanded="false" class="d-flex flex-column align-items-center">
      <i class="fas fa-tag"></i>
      <span>Promociones</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="promotions-dropdown-mobile">
      <li><a class="dropdown-item" href="#" id="btn-new-promo-mobile">
        <i class="fas fa-plus-circle me-2"></i>Nueva Promoción
      </a></li>
      <li><a class="dropdown-item" href="#admin-promotions" data-link="#admin-promotions">
        <i class="fas fa-list me-2"></i>Lista de Promociones
      </a></li>
    </ul>
  </div>
  <!-- Dropdown más opciones -->
  <div class="dropdown bottom-nav-item dropup">
    <a href="#" role="button" id="admin-dropdown-trigger" data-bs-toggle="dropdown" aria-expanded="false" class="d-flex flex-column align-items-center">
      <i class="fas fa-ellipsis-h"></i>
      <span>Más</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="admin-dropdown-trigger">
      <li><a class="dropdown-item" href="#" id="profile-btn-mobile">
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
    <i class="fas fa-chart-line"></i>
    <span>Métricas</span>
  </a>
  <!-- Dropdown Productos Desktop -->
  <div class="dropdown sidebar-dropdown">
    <a href="#" role="button" id="products-dropdown-desktop" class="sidebar-nav-item" data-bs-toggle="dropdown" aria-expanded="false">
      <i class="fas fa-boxes"></i>
      <span>Productos</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="products-dropdown-desktop">
      <li><a class="dropdown-item" href="#" id="btn-new-product-desktop">
        <i class="fas fa-plus-circle me-2"></i>Nuevo Producto
      </a></li>
      <li><a class="dropdown-item" href="#admin-products" data-link="#admin-products">
        <i class="fas fa-list me-2"></i>Lista de Productos
      </a></li>
    </ul>
  </div>
  <!-- Dropdown Promociones Desktop -->
  <div class="dropdown sidebar-dropdown">
    <a href="#" role="button" id="promotions-dropdown-desktop" class="sidebar-nav-item" data-bs-toggle="dropdown" aria-expanded="false">
      <i class="fas fa-tag"></i>
      <span>Promociones</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="promotions-dropdown-desktop">
      <li><a class="dropdown-item" href="#" id="btn-new-promo-desktop">
        <i class="fas fa-plus-circle me-2"></i>Nueva Promoción
      </a></li>
      <li><a class="dropdown-item" href="#admin-promotions" data-link="#admin-promotions">
        <i class="fas fa-list me-2"></i>Lista de Promociones
      </a></li>
    </ul>
  </div>
  <div class="sidebar-divider"></div>
  <a href="#" id="profile-btn-desktop" class="sidebar-nav-item" title="Perfil" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-user"></i>
    <span>Perfil</span>
  </a>
  <a href="#" id="logout-btn-desktop" class="sidebar-nav-item" title="Cerrar sesión" data-bs-toggle="tooltip" data-bs-placement="right" style="color: var(--sidebar-link-color, #7a003c);">
    <i class="fas fa-sign-out-alt" style="color: var(--sidebar-link-icon, #7a003c);"></i>
    <span>Salir</span>
  </a>
</nav>
