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

  <!-- Botón central para crear -->
  <button type="button" class="bottom-nav-scan" data-link="#admin" aria-label="Crear" title="Crear Producto">
    <i class="fas fa-plus"></i>
  </button>

  <a href="#admin-metrics" class="bottom-nav-item" data-link="#admin-metrics" aria-label="Métricas">
    <i class="fas fa-chart-bar"></i>
    <span>Métricas</span>
  </a>

  <button type="button" class="bottom-nav-item" id="logout-btn-mobile" aria-label="Salir">
    <i class="fas fa-sign-out-alt"></i>
    <span>Salir</span>
  </button>
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

  <a href="#admin-metrics" class="sidebar-nav-item" data-link="#admin-metrics" title="Métricas" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-chart-bar"></i>
    <span>Métricas</span>
  </a>

  <div class="sidebar-divider"></div>

  <button type="button" class="sidebar-nav-item" id="logout-btn" title="Salir" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-sign-out-alt"></i>
    <span>Salir</span>
  </button>
</nav>
