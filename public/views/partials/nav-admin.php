<?php
/**
 * Vista parcial: Navegación para administradores
 * 
 * Este archivo contiene la barra de navegación utilizada en la interfaz de administración,
 * tanto para dispositivos móviles (bottom nav) como para escritorio (sidebar).
 * Incluye accesos rápidos a métricas, productos, promociones, perfil y cierre de sesión.
 * 
 * Estructura:
 * - Navegación inferior móvil (bottom-nav)
 * - Navegación lateral escritorio (sidebar-nav)
 * 
 * Se utilizan iconos de FontAwesome y clases de Bootstrap para estilos y comportamiento.
 */
header('Content-Type: text/html; charset=utf-8');
?>

<!--
  NAV INFERIOR PARA MÓVIL
  Muestra accesos directos a las principales secciones del panel de administración.
  Cada ítem puede ser un enlace directo o un dropdown para más opciones.
-->
<nav class="bottom-nav d-md-none">
  <!-- Enlace directo a Métricas -->
  <a href="#admin" class="bottom-nav-item" data-link="#admin-metrics" aria-label="Métricas">
    <i class="fas fa-chart-line"></i>
    <span>Métricas</span>
  </a>
  <!-- Dropdown Productos (móvil): permite crear o listar productos -->
  <div class="dropdown bottom-nav-item dropup">
    <a href="#" role="button" id="products-dropdown-mobile" data-bs-toggle="dropdown" aria-expanded="false" class="d-flex flex-column align-items-center">
      <i class="fas fa-boxes"></i>
      <span>Productos</span>
    </a>
    <ul class="dropdown-menu" aria-labelledby="products-dropdown-mobile">
      <li>
        <a class="dropdown-item" href="#" id="btn-new-product-mobile">
          <i class="fas fa-plus-circle me-2"></i>Nuevo Producto
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#admin-products" data-link="#admin-products">
          <i class="fas fa-list me-2"></i>Lista de Productos
        </a>
      </li>
    </ul>
  </div>
  <!-- Enlace central flotante para escanear QR (acceso rápido) -->
  <a href="#admin-scan" class="bottom-nav-item bottom-nav-scan" data-link="#admin-scan" aria-label="Escanear QR" title="Escanear QR">
    <i class="fas fa-qrcode"></i>
  </a>
  <!-- Dropdown Promociones (móvil): permite crear o listar promociones -->
  <div class="dropdown bottom-nav-item dropup">
    <a href="#" role="button" id="promotions-dropdown-mobile" data-bs-toggle="dropdown" aria-expanded="false" class="d-flex flex-column align-items-center">
      <i class="fas fa-tag"></i>
      <span>Promociones</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="promotions-dropdown-mobile">
      <li>
        <a class="dropdown-item" href="#" id="btn-new-promo-mobile">
          <i class="fas fa-plus-circle me-2"></i>Nueva Promoción
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#admin-promotions" data-link="#admin-promotions">
          <i class="fas fa-list me-2"></i>Lista de Promociones
        </a>
      </li>
    </ul>
  </div>
  <!-- Dropdown Más opciones: perfil y cierre de sesión -->
  <div class="dropdown bottom-nav-item dropup">
    <a href="#" role="button" id="admin-dropdown-trigger" data-bs-toggle="dropdown" aria-expanded="false" class="d-flex flex-column align-items-center">
      <i class="fas fa-ellipsis-h"></i>
      <span>Más</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="admin-dropdown-trigger">
      <li>
        <a class="dropdown-item" id="profile-btn-mobile" style="cursor:pointer;">
          <i class="fas fa-user me-2"></i>Perfil
        </a>
      </li>
      <li><hr class="dropdown-divider"></li>
      <li>
        <a class="dropdown-item" href="#" id="logout-btn-mobile">
          <i class="fas fa-sign-out-alt me-2"></i>Salir
        </a>
      </li>
    </ul>
  </div>
</nav>

<!--
  NAV LATERAL PARA ESCRITORIO
  Barra fija a la izquierda con accesos a las mismas secciones que la versión móvil,
  pero optimizada para pantallas grandes. Incluye tooltips y divisores visuales.
-->
<nav class="sidebar-nav d-none d-md-flex">
  <!-- Enlace directo a Métricas -->
  <a href="#admin-metrics" class="sidebar-nav-item" data-link="#admin-metrics" title="Métricas" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-chart-line"></i>
    <span>Métricas</span>
  </a>
  <!-- Dropdown Productos (escritorio): crear o listar productos -->
  <div class="dropdown sidebar-dropdown">
    <a href="#" role="button" id="products-dropdown-desktop" class="sidebar-nav-item" data-bs-toggle="dropdown" aria-expanded="false">
      <i class="fas fa-boxes"></i>
      <span>Productos</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="products-dropdown-desktop">
      <li>
        <a class="dropdown-item" href="#" id="btn-new-product-desktop">
          <i class="fas fa-plus-circle me-2"></i>Nuevo Producto
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#admin-products" data-link="#admin-products">
          <i class="fas fa-list me-2"></i>Lista de Productos
        </a>
      </li>
    </ul>
  </div>
  <!-- Dropdown Promociones (escritorio): crear o listar promociones -->
  <div class="dropdown sidebar-dropdown">
    <a href="#" role="button" id="promotions-dropdown-desktop" class="sidebar-nav-item" data-bs-toggle="dropdown" aria-expanded="false">
      <i class="fas fa-tag"></i>
      <span>Promociones</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="promotions-dropdown-desktop">
      <li>
        <a class="dropdown-item" href="#" id="btn-new-promo-desktop">
          <i class="fas fa-plus-circle me-2"></i>Nueva Promoción
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#admin-promotions" data-link="#admin-promotions">
          <i class="fas fa-list me-2"></i>Lista de Promociones
        </a>
      </li>
    </ul>
  </div>
  <!-- Divisor visual para separar secciones -->
  <div class="sidebar-divider"></div>
  <!-- Enlace a Perfil de usuario -->
  <a href="#" id="profile-btn-desktop" class="sidebar-nav-item" title="Perfil" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-user"></i>
    <span>Perfil</span>
  </a>
  <!-- Enlace para cerrar sesión (destacado en color) -->
  <a href="#" id="logout-btn-desktop" class="sidebar-nav-item" title="Cerrar sesión" data-bs-toggle="tooltip" data-bs-placement="right" style="color: var(--sidebar-link-color, #7a003c);">
    <i class="fas fa-sign-out-alt" style="color: var(--sidebar-link-icon, #7a003c);"></i>
    <span>Salir</span>
  </a>
</nav>