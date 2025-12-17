<?php
// views/partials/nav-public.php
header('Content-Type: text/html; charset=utf-8');
?>
<!-- public/views/partials/nav-public.php -->
<!-- Navegación para usuarios públicos -->

<!-- MOBILE BOTTOM NAV -->
<nav class="bottom-nav d-md-none">
  <a href="#home" class="bottom-nav-item active" data-link="#home" aria-label="Inicio">
    <i class="fas fa-home"></i>
    <span>Inicio</span>
  </a>
  
  <a href="#search" class="bottom-nav-item" data-link="#search" aria-label="Búsqueda">
    <i class="fas fa-search"></i>
    <span>Buscar</span>
  </a>

  <!-- Botón central flotante para QR -->
  <a href="#scan" class="bottom-nav-scan" data-link="#scan" aria-label="Escanear QR" title="Escanear QR">
    <i class="fas fa-qrcode"></i>
  </a>

  <a href="#promos" class="bottom-nav-item" data-link="#promos" aria-label="Promociones">
    <i class="fas fa-tag"></i>
    <span>Promos</span>
  </a>

  <a href="#" class="bottom-nav-item" data-bs-toggle="modal" data-bs-target="#loginModal" aria-label="Ingresar">
    <i class="fas fa-user"></i>
    <span>Ingresar</span>
  </a>
</nav>

<!-- DESKTOP SIDEBAR NAV -->
<nav class="sidebar-nav d-none d-md-flex">
  <a href="#home" class="sidebar-nav-item active" data-link="#home" title="Inicio" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-home"></i>
    <span>Inicio</span>
  </a>

  <a href="#search" class="sidebar-nav-item" data-link="#search" title="Buscar Vinos" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-search"></i>
    <span>Buscar Vinos</span>
  </a>

  <a href="#promos" class="sidebar-nav-item" data-link="#promos" title="Promociones" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-tag"></i>
    <span>Promociones</span>
  </a>

  <div class="sidebar-divider"></div>

  <div class="sidebar-divider"></div>

  <a href="#" class="sidebar-nav-item" data-bs-toggle="modal" data-bs-target="#loginModal" title="Ingresar" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-user"></i>
    <span>Ingresar</span>
  </a>
</nav>
