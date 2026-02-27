
<?php
/**
 * Vista de Promociones para Admin
 * 
 * Este archivo define la interfaz de administración de promociones, permitiendo crear, editar y controlar
 * las promociones del catálogo. Incluye tabla para escritorio, cards para móvil y paginación.
 */
header('Content-Type: text/html; charset=utf-8');
?>

<!--
  Vista de administración de promociones
  Permite gestionar las promociones activas en la app, con soporte para escritorio y móvil.
-->
<div>
  <!--
    Estado de carga inicial
    Se muestra mientras se obtienen las promociones desde el backend.
  -->
  <div id="admin-promos-loading" class="admin-loading text-center py-5" aria-busy="true" aria-label="Cargando promociones">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="mt-3 text-muted">Cargando promociones...</p>
  </div>

  <!--
    Contenido principal de promociones
    Incluye tabla (desktop), cards (móvil) y controles de paginación.
    Se oculta hasta que los datos están listos.
  -->
  <div id="admin-promos-content" style="display: none;">
    <div class="admin-section-card">
      <!--
        Encabezado de la sección de promociones
        Incluye título y subtítulo descriptivo.
      -->
      <div class="admin-section-header mb-3">
        <h2 class="admin-section-title"><i class="fas fa-tags me-2"></i>Gestión de Promociones</h2>
        <p class="admin-section-subtitle">Crea, edita y controla las promociones del catálogo.</p>
      </div>
      <!--
        Tabla de promociones para escritorio
        Muestra las promociones en formato tabular con acciones disponibles.
        Las filas se inyectan dinámicamente por JavaScript.
      -->
      <div class="table-responsive d-none d-md-block admin-table-wrapper">
        <table class="table table-bordered align-middle" id="admin-promos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th class="col-secondary">Tipo</th>
              <th class="col-secondary">Valor</th>
              <th>Texto</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Filas inyectadas dinámicamente por JS -->
          </tbody>
        </table>
      </div>

      <!--
        Cards de promociones para móvil
        Cada card representa una promoción y sus acciones. Se inyectan por JavaScript.
      -->
      <div class="d-md-none" id="admin-promos-cards">
        <!-- Cards inyectadas dinámicamente por JS -->
      </div>

      <!--
        Controles de paginación
        Permiten navegar entre páginas de promociones.
      -->
      <div class="d-flex justify-content-center align-items-center admin-pagination">
        <button class="btn-pagination" id="admin-promos-prev" disabled>Anterior</button>
        <span id="admin-promos-page" class="mx-2"></span>
        <button class="btn-pagination" id="admin-promos-next" disabled>Siguiente</button>
      </div>
    </div>
  </div>
</div>