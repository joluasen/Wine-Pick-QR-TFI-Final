<?php

/**
 * spa.php - Shell principal de la aplicación SPA (Single Page Application)
 *
 * Punto de entrada de la interfaz de usuario. Genera el HTML base con:
 * - Meta tags y configuración del navegador
 * - Carga de recursos (CSS, JS, bibliotecas)
 * - Estructura DOM para la aplicación React/Vue
 * - Configuración global pasada a JavaScript
 * - Service Worker para PWA
 */

// Cargar configuración del proyecto
require_once __DIR__ . '/../config/config.php';

// Normalizar BASE_URL para asegurar que termina con /
$baseUrl = rtrim(BASE_URL, '/') . '/';

/**
 * Configuración global de la aplicación
 * Se pasa a JavaScript a través de window.APP_CONFIG
 * @var array
 */
$appConfig = [
  'baseUrl' => $baseUrl,
  'apiUrl' => $baseUrl . 'api/',
  'appName' => 'WINE-PICK-QR',
  'version' => '1.0.0'
];
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title><?= $appConfig['appName'] ?></title>

  <!-- Meta tags -->
  <meta name="description" content="Catálogo de vinos y bebidas con búsqueda por código QR">
  <meta name="theme-color" content="#4A0E1A">

  <!-- Manifest PWA -->
  <link rel="manifest" href="<?= $baseUrl ?>manifest.json">

  <!-- iOS PWA Meta Tags -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="<?= $appConfig['appName'] ?>">

  <!-- Iconos -->
  <link rel="icon" type="image/png" sizes="192x192" href="<?= $baseUrl ?>assets/icons/icon-192.png">
  <link rel="apple-touch-icon" href="<?= $baseUrl ?>assets/icons/icon-192.png">

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Font Awesome 6 -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

  <!-- Chart.js para gráficos de líneas -->
  <script src="https://unpkg.com/chart.js@4.4.1/dist/chart.umd.js"></script>

  <!-- Estilos de la aplicación (todos los originales) -->
  <link rel="stylesheet" href="<?= $baseUrl ?>css/theme.css">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/layout.css?v=2">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/navbar.css">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/components.css?v=2">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/modals.css">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/winepick-search.css?v=2">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/admin.css">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/buttons.css?v=7">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/confirm-dialog.css">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/qr-display.css">

  <!-- Configuración global para JavaScript -->
  <script>
    window.APP_CONFIG = <?= json_encode($appConfig, JSON_UNESCAPED_SLASHES) ?>;
  </script>
</head>

<body class="d-flex flex-column">

  <!-- PAGE LOADER - Spinner inicial mientras carga la aplicación -->
  <div id="page-loader" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column;">
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="mt-3 text-muted" style="font-size: 0.9rem;">Cargando aplicación...</p>
  </div>

  <!-- HEADER -->
  <header class="bg-white border-bottom sticky-top">
    <div class="py-3">
      <div class="container-fluid header-container">
        <div class="d-flex align-items-center justify-content-center gap-2 gap-md-4">

          <!-- Botón Instalar PWA - MOBILE (izquierda, solo visible en mobile) -->
          <button id="pwa-install-btn-mobile" class="btn-table btn-pwa-mobile pwa-btn-hidden" title="Instalar aplicación">
            <i class="fas fa-download"></i>
          </button>

          <!-- Espaciador (Desktop) -->
          <div class="d-none d-md-flex header-spacer"></div>

          <!-- Logo (Desktop) -->
          <div class="d-none d-md-flex align-items-center header-logo">
            <a href="#home" class="text-decoration-none">
              <h1 class="h5 mb-0 fw-bold"><?= $appConfig['appName'] ?></h1>
            </a>
          </div>

          <!-- Buscador MOBILE -->
          <div id="mobile-search-header" class="flex-grow-1 d-md-none">
            <!-- Inyectado dinámicamente -->
          </div>

          <!-- Buscador DESKTOP -->
          <div id="desktop-search-header" class="flex-grow-1 d-none d-md-block header-search">
            <!-- Inyectado dinámicamente -->
          </div>

          <!-- Botón Instalar PWA - DESKTOP (derecha, solo visible en desktop) -->
          <button id="pwa-install-btn" class="btn-table pwa-btn-hidden" title="Instalar aplicación">
            <i class="fas fa-download me-1"></i>
            <span>Instalar App</span>
          </button>
          <div class="d-none d-md-flex header-spacer"></div>
        </div>
      </div>
    </div>
  </header>

  <!-- CONTAINER: Sidebar + Main -->
  <div class="d-flex flex-grow-1 main-container">

    <!-- SIDEBAR (Desktop) -->
    <aside id="sidebar-container" class="d-none d-md-block bg-white border-end sidebar">
      <!-- Inyectado dinámicamente -->
    </aside>

    <!-- MAIN CONTENT -->
    <main id="app-root">
      <!-- Vistas cargadas dinámicamente -->
    </main>
  </div>

  <!-- BOTTOM NAV (Mobile) -->
  <footer id="nav-container" class="d-md-none">
    <!-- Inyectado dinámicamente -->
  </footer>



  <!-- MODAL DE FILTROS -->
  <div class="modal fade" id="filtersModal" tabindex="-1" aria-labelledby="filtersModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title small text-uppercase text-muted" id="filtersModalLabel">
            Filtros de búsqueda
          </h5>
          <button type="button" class="btn-close-custom" data-bs-dismiss="modal" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body pt-2">
          <!-- Tipo de bebida (select) -->
          <div class="mb-3">
            <label for="filterDrinkType" class="form-label fw-semibold">Tipo de bebida</label>
            <select class="filter-select" id="filterDrinkType">
              <option value="">Todos los tipos</option>
              <option value="vino">Vino</option>
              <option value="espumante">Espumante</option>
              <option value="whisky">Whisky</option>
              <option value="gin">Gin</option>
              <option value="licor">Licor</option>
              <option value="cerveza">Cerveza</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <!-- Checkboxes de filtros -->
          <div class="filter-checkbox mb-2">
            <input class="filter-checkbox-input" type="checkbox" id="filterVarietal">
            <label class="filter-checkbox-label" for="filterVarietal">Filtrar por varietal (uva)</label>
          </div>
          <div class="filter-checkbox mb-2">
            <input class="filter-checkbox-input" type="checkbox" id="filterOrigin">
            <label class="filter-checkbox-label" for="filterOrigin">Filtrar por origen</label>
          </div>
          <div class="filter-checkbox mb-2">
            <input class="filter-checkbox-input" type="checkbox" id="filterWinery">
            <label class="filter-checkbox-label" for="filterWinery">Filtrar por bodega/destilería</label>
          </div>

          <!-- Filtro de año -->
          <div class="mb-3 mt-3">
            <label for="filterYearInput" class="form-label">Año de cosecha</label>
            <input type="number" class="form-control" id="filterYearInput" min="1900" max="2100" placeholder="Ej: 2020">
          </div>
        </div>
        <div class="modal-footer border-0 pt-0 gap-2">
          <button type="button" class="btn-modal btn-sm" id="clearFiltersBtn">
            Limpiar filtros
          </button>
          <button type="button" class="btn-modal btn-modal-primary btn-sm" id="applyFiltersBtn" data-bs-dismiss="modal">
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- CONTENEDOR DE MODALES DINÁMICOS -->
  <div id="modal-container">
  </div>

  <!-- Librerías QR -->
  <script src="<?= $baseUrl ?>js/lib/html5-qrcode.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@latest/build/qrcode.min.js"></script>

  <!-- Bootstrap 5.3 JS Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Chart.js para métricas -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <!-- Lógica de filtros -->
  <script>
    const filterCheckboxIds = ['filterVarietal', 'filterOrigin', 'filterWinery'];
    const fieldMap = {
      filterVarietal: 'varietal',
      filterOrigin: 'origin',
      filterWinery: 'winery_distillery'
    };

    const getVisibleSearchInput = () => {
      const desktopInput = document.querySelector('#desktop-search-header #searchInput');
      const mobileInput = document.querySelector('#mobile-search-header #searchInput');
      if (desktopInput && window.getComputedStyle(desktopInput).display !== 'none') return desktopInput;
      if (mobileInput && window.getComputedStyle(mobileInput).display !== 'none') return mobileInput;
      return desktopInput || mobileInput;
    };

    // Forzar selección única entre los filtros de campo
    filterCheckboxIds.forEach((id) => {
      const checkbox = document.getElementById(id);
      checkbox?.addEventListener('change', () => {
        if (!checkbox.checked) return;
        filterCheckboxIds.forEach(otherId => {
          if (otherId === id) return;
          const other = document.getElementById(otherId);
          if (other) other.checked = false;
        });
      });
    });

    document.getElementById('applyFiltersBtn')?.addEventListener('click', function() {
      const input = getVisibleSearchInput();
      const query = input?.value?.trim() || '';

      const currentHash = window.location.hash.split('?')[0];
      const isAdmin = currentHash.startsWith('#admin');
      const target = currentHash === '#admin-promotions'
        ? '#admin-promotions'
        : (isAdmin ? '#admin-products' : '#search');

      const params = new URLSearchParams();
      params.set('query', query);

      const selectedFieldId = filterCheckboxIds.find(id => document.getElementById(id)?.checked);
      if (selectedFieldId) {
        const field = fieldMap[selectedFieldId];
        params.set('field', field);
        params.set(field, '1');
      }

      const drinkTypeSelect = document.getElementById('filterDrinkType');
      if (drinkTypeSelect?.value) {
        params.set('drink_type', drinkTypeSelect.value);
      }

      const yearInput = document.getElementById('filterYearInput');
      if (yearInput?.value) {
        params.set('vintage_year', yearInput.value);
      }

      const queryString = params.toString();
      window.location.hash = queryString ? `${target}?${queryString}` : target;
    });

    // Limpiar filtros
    document.getElementById('clearFiltersBtn')?.addEventListener('click', function() {
      const drinkTypeSelect = document.getElementById('filterDrinkType');
      if (drinkTypeSelect) drinkTypeSelect.value = '';

      filterCheckboxIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
      });

      const yearInput = document.getElementById('filterYearInput');
      if (yearInput) yearInput.value = '';
    });
  </script>

  <!-- Ocultar page loader cuando la página esté lista -->
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      const pageLoader = document.getElementById('page-loader');
      if (pageLoader) {
        // Esperar 500ms antes de ocultar
        setTimeout(() => {
          // Fade out suave
          pageLoader.style.transition = 'opacity 0.3s ease';
          pageLoader.style.opacity = '0';
          setTimeout(() => {
            pageLoader.style.display = 'none';
          }, 300);
        }, 500);
      }
    });
  </script>

  <!-- JS principal (ES modules) -->
  <script type="module" src="<?= $baseUrl ?>js/app.js"></script>
</body>

</html>