
<?php
/**
 * Vista parcial: Navegación para usuarios públicos
 * 
 * Este archivo define la barra de navegación utilizada por los usuarios no autenticados (públicos),
 * tanto en dispositivos móviles (bottom nav) como en escritorio (sidebar).
 * Proporciona accesos rápidos a las principales secciones públicas: inicio, búsqueda, promociones, escaneo QR e ingreso.
 * 
 * Estructura:
 * - Navegación inferior móvil (bottom-nav)
 * - Navegación lateral escritorio (sidebar-nav)
 * 
 * Se utilizan iconos de FontAwesome y clases de Bootstrap para estilos y comportamiento responsive.
 */
?>

<!--
  NAV INFERIOR PARA MÓVIL
  Barra de navegación fija en la parte inferior para usuarios públicos en dispositivos móviles.
  Incluye accesos directos a las secciones principales de la app.
-->
<nav class="bottom-nav d-md-none">
  <!-- Enlace a la página de inicio -->
  <a href="#home" class="bottom-nav-item" data-link="#home" aria-label="Inicio">
    <i class="fas fa-home"></i>
    <span>Inicio</span>
  </a>
  <!-- Enlace a la búsqueda de vinos -->
  <a href="#search" class="bottom-nav-item" data-link="#search" aria-label="Búsqueda">
    <i class="fas fa-search"></i>
    <span>Buscar</span>
  </a>
  <!-- Enlace central flotante para escanear QR -->
  <a href="#scan" class="bottom-nav-item bottom-nav-scan" data-link="#scan" aria-label="Escanear QR" title="Escanear QR">
    <i class="fas fa-qrcode"></i>
  </a>
  <!-- Enlace a promociones activas -->
  <a href="#promotions" class="bottom-nav-item" data-link="#promotions" aria-label="Promociones">
    <i class="fas fa-tag"></i>
    <span>Promos</span>
  </a>
  <!-- Enlace para iniciar sesión -->
  <a href="#login" class="bottom-nav-item" data-link="#login" aria-label="Ingresar">
    <i class="fas fa-sign-in-alt"></i>
    <span>Ingresar</span>
  </a>
</nav>

<!--
  NAV LATERAL PARA ESCRITORIO
  Barra lateral fija para usuarios públicos en pantallas grandes.
  Proporciona los mismos accesos que la versión móvil, optimizados para escritorio.
-->
<nav class="sidebar-nav d-none d-md-flex">
  <!-- Enlace a la página de inicio -->
  <a href="#home" class="sidebar-nav-item" data-link="#home" title="Inicio" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-home"></i>
    <span>Inicio</span>
  </a>
  <!-- Enlace a la búsqueda de vinos -->
  <a href="#search" class="sidebar-nav-item" data-link="#search" title="Buscar Vinos" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-search"></i>
    <span>Buscar</span>
  </a>
  <!-- Enlace a promociones activas -->
  <a href="#promotions" class="sidebar-nav-item" data-link="#promotions" title="Promociones" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-tag"></i>
    <span>Promos</span>
  </a>
  <!-- Divisor visual para separar secciones -->
  <div class="sidebar-divider"></div>
  <!-- Enlace para iniciar sesión -->
  <a href="#login" class="sidebar-nav-item" data-link="#login" title="Ingresar" data-bs-toggle="tooltip" data-bs-placement="right">
    <i class="fas fa-sign-in-alt"></i>
    <span>Ingresar</span>
  </a>
</nav>
