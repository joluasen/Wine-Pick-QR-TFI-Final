<?php
/**
 * Navegación para administradores
 */
header('Content-Type: text/html; charset=utf-8');
?>
<!-- MOBILE BOTTOM NAV -->
<nav class="bottom-nav d-md-none">
  <a href="#admin" class="bottom-nav-item" data-link="#admin" aria-label="Panel">
    <i class="fas fa-tachometer-alt"></i>
    <span>Panel</span>
  </a>
  <a href="#admin-products" class="bottom-nav-item" data-link="#admin-products" aria-label="Productos">
    <i class="fas fa-boxes"></i>
    <span>Productos</span>
  </a>
  <!-- Botón central flotante para Promociones -->
  <a href="#admin-promotions" class="bottom-nav-scan" data-link="#admin-promotions" aria-label="Promociones" title="Promociones">
    <i class="fas fa-tag"></i>
  </a>
  <a href="#admin-metrics" class="bottom-nav-item" data-link="#admin-metrics" aria-label="Métricas">
    <i class="fas fa-chart-bar"></i>
    <span>Métricas</span>
  </a>
  <!-- Menú más (solo ícono, estilo flotante) -->
  <div class="bottom-nav-item dropdown" style="padding:0;">
    <a href="#" class="dropdown-toggle more-icon-btn" id="adminMoreMenu" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Más opciones">
      <i class="fas fa-ellipsis-h"></i>
    </a>
    <ul class="dropdown-menu dropdown-menu-end shadow rounded-4 py-3 px-2" aria-labelledby="adminMoreMenu" style="min-width: 160px; background: #fff9f6; border: 1px solid #e5e5e5;">
      <li class="mb-2"><a class="dropdown-item d-flex align-items-center gap-2 rounded-3" href="#scan" data-link="#scan"><i class="fas fa-qrcode"></i><span>QR</span></a></li>
      <li><hr class="dropdown-divider"></li>
      <li class="mt-2"><a class="dropdown-item d-flex align-items-center gap-2 rounded-3" href="#" id="logout-btn-mobile"><i class="fas fa-sign-out-alt"></i><span>Salir</span></a></li>
    </ul>
  </div>
</nav>

<!-- DESKTOP SIDEBAR NAV -->
<nav class="sidebar-nav d-none d-md-flex">
  <a href="#admin" class="sidebar-nav-item" data-link="#admin" title="Panel Principal" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-tachometer-alt"></i>
    <span>Panel</span>
  </a>
  <a href="#admin-products" class="sidebar-nav-item" data-link="#admin-products" title="Productos" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-boxes"></i>
    <span>Productos</span>
  </a>
  <a href="#admin-promotions" class="sidebar-nav-item" data-link="#admin-promotions" title="Promociones" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-tag"></i>
    <span>Promociones</span>
  </a>
  <a href="#admin-metrics" class="sidebar-nav-item" data-link="#admin-metrics" title="Métricas" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-chart-bar"></i>
    <span>Métricas</span>
  </a>
  <div class="sidebar-divider"></div>
  <a href="#" id="logout-btn-desktop" class="sidebar-nav-item mt-auto" title="Cerrar sesión" data-bs-toggle="tooltip" data-bs-placement="right" style="color: var(--sidebar-link-color, #7a003c);">
    <i class="fas fa-sign-out-alt" style="color: var(--sidebar-link-icon, #7a003c);"></i>
    <span>Salir</span>
  </a>
</nav>
