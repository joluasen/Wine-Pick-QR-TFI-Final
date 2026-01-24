
<?php
/**
 * Vista parcial: Buscador en el header
 * 
 * Este archivo define el formulario de búsqueda que se muestra en el encabezado de la aplicación,
 * tanto en dispositivos móviles como en escritorio. Permite a los usuarios buscar productos
 * y acceder a filtros avanzados mediante un modal.
 * 
 * Estructura:
 * - Formulario de búsqueda con input y botones de acción
 * - Botón para abrir el modal de filtros
 * - Botón para enviar la búsqueda
 */
header('Content-Type: text/html; charset=utf-8');
?>

<!--
  Formulario de búsqueda principal en el header
  Incluye:
    - Input de texto para búsqueda de productos
    - Botón para abrir filtros avanzados (modal)
    - Botón para enviar la búsqueda
  El diseño es responsivo y utiliza clases de Bootstrap para estilos y accesibilidad.
-->
<form id="searchForm" class="search-header-form mb-0" role="search">
  <div class="input-group search-header-input rounded-pill">
    <!-- Icono de búsqueda al inicio del input -->
    <span class="input-group-text border-0">
      <i class="fas fa-search" aria-hidden="true"></i>
    </span>
    <!-- Campo de texto para ingresar el término de búsqueda -->
    <input
      type="search"
      id="searchInput"
      class="form-control border-0"
      placeholder="Buscar productos..."
      required
      autocomplete="off"
      aria-label="Buscar productos"
    >
    <!-- Botón para abrir el modal de filtros de búsqueda -->
    <button 
      type="button" 
      class="btn-filters" 
      data-bs-toggle="modal" 
      data-bs-target="#filtersModal" 
      title="Filtros de búsqueda"
      aria-label="Abrir filtros"
    >
      <i class="fas fa-sliders-h" aria-hidden="true"></i>
    </button>
    <!-- Botón para enviar el formulario de búsqueda -->
    <button type="submit" class="btn-modal btn-modal-primary" aria-label="Buscar">
      <i class="fas fa-search" aria-hidden="true"></i>
    </button>
  </div>
</form>
