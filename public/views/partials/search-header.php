<?php
/**
 * Buscador para el header (mobile y desktop)
 */
header('Content-Type: text/html; charset=utf-8');
?>
<form id="searchForm" class="search-header-form mb-0" role="search">
  <div class="input-group search-header-input rounded-pill">
    <span class="input-group-text border-0">
      <i class="fas fa-search" aria-hidden="true"></i>
    </span>
    <input
      type="search"
      id="searchInput"
      class="form-control border-0"
      placeholder="Buscar productos..."
      required
      autocomplete="off"
      aria-label="Buscar productos"
    >
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
    <button type="submit" class="btn btn-winepick" aria-label="Buscar">
      <i class="fas fa-search" aria-hidden="true"></i>
    </button>
  </div>
</form>
