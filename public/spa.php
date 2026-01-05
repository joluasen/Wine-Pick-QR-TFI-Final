<?php

/**
 * spa.php - Shell principal de la aplicación SPA
 */

// Cargar configuración
require_once __DIR__ . '/../config/config.php';

// Normalizar BASE_URL - asegurar que termine con /
$baseUrl = rtrim(BASE_URL, '/') . '/';

// Configuración para JavaScript
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

  <!-- Iconos -->
  <link rel="icon" type="image/png" sizes="192x192" href="<?= $baseUrl ?>assets/icons/icon-192.png">
  <link rel="apple-touch-icon" href="<?= $baseUrl ?>assets/icons/icon-192.png">

  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Font Awesome 6 -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

  <!-- Estilos de la aplicación (todos los originales) -->
  <link rel="stylesheet" href="<?= $baseUrl ?>css/theme.css">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/layout.css?v=2">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/navbar.css">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/components.css?v=2">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/product-modal.css?v=2">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/winepick-search.css?v=2">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/admin.css">
  <link rel="stylesheet" href="<?= $baseUrl ?>css/buttons.css?v=7">

  <!-- Configuración global para JavaScript -->
  <script>
    window.APP_CONFIG = <?= json_encode($appConfig, JSON_UNESCAPED_SLASHES) ?>;
  </script>
</head>

<body class="d-flex flex-column">

  <!-- HEADER -->
  <header class="bg-white border-bottom sticky-top">
    <div class="py-3">
      <div class="container-fluid header-container">
        <div class="d-flex align-items-center justify-content-center gap-4">

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

          <!-- Espaciador (Desktop) -->
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

  <!-- MODAL DE LOGIN -->
  <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header border-0 pb-2 pt-3 px-4 d-flex justify-content-end">
          <button type="button" class="btn-close-custom" data-bs-dismiss="modal" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body px-4 px-md-5 pt-2 pb-4">
          <div class="text-center mb-4">
            <h2 class="h4 fw-bold mb-2" id="loginModalLabel">Acceso Administrador</h2>
            <p class="text-muted small mb-0">Ingresa tus credenciales para gestionar el panel</p>
          </div>

          <form id="login-form-modal">
            <div class="mb-3">
              <label for="login-username-modal" class="form-label small fw-semibold">Usuario</label>
              <input
                id="login-username-modal"
                name="username"
                type="text"
                class="form-control"
                placeholder="admin"
                required
                autocomplete="username">
            </div>

            <div class="mb-4">
              <label for="login-password-modal" class="form-label small fw-semibold">Contraseña</label>
              <input
                id="login-password-modal"
                name="password"
                type="password"
                class="form-control"
                placeholder="••••••••"
                required
                autocomplete="current-password">
            </div>

            <div id="login-status-modal" class="mb-3" aria-live="polite"></div>

            <button type="submit" class="btn-modal btn-modal-primary w-100 py-2 fw-semibold">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>

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
          <!-- Código público -->
          <div class="mb-3">
            <label for="filterPublicCode" class="form-label fw-semibold">Buscar por código público</label>
            <input type="text" class="form-control" id="filterPublicCode" placeholder="Ej: WINE-123-456">
          </div>

          <!-- Checkboxes de filtros -->
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="filterVarietal">
            <label class="form-check-label" for="filterVarietal">Filtrar por varietal</label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="filterOrigin">
            <label class="form-check-label" for="filterOrigin">Filtrar por origen</label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="filterWinery">
            <label class="form-check-label" for="filterWinery">Filtrar por bodega</label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="filterDrinkType">
            <label class="form-check-label" for="filterDrinkType">Filtrar por tipo de bebida</label>
          </div>

          <!-- Filtro de año -->
          <div class="mb-3 mt-3">
            <label for="filterYearInput" class="form-label">Año de cosecha</label>
            <input type="number" class="form-control" id="filterYearInput" min="1900" max="2100" placeholder="Ej: 2020">
          </div>
        </div>
        <div class="modal-footer border-0 pt-0 gap-2">
          <button type="button" class="btn-modal btn-modal-secondary btn-sm" data-bs-dismiss="modal">
            Cancelar
          </button>
          <button type="button" class="btn-modal btn-modal-primary btn-sm" id="applyFiltersBtn" data-bs-dismiss="modal">
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- CONTENEDOR DE MODALES DINÁMICOS -->
  <div id="modal-container"></div>

  <!-- Librerías QR -->
  <script src="<?= $baseUrl ?>js/lib/qrcode.min.js"></script>
  <script src="<?= $baseUrl ?>js/lib/html5-qrcode.min.js"></script>

  <!-- Bootstrap 5.3 JS Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Lógica de filtros -->
  <script>
    document.getElementById('applyFiltersBtn')?.addEventListener('click', function() {
      // Buscar el input visible (desktop o mobile)
      let input = null;
      const desktopInput = document.querySelector('#desktop-search-header #searchInput');
      const mobileInput = document.querySelector('#mobile-search-header #searchInput');
      if (desktopInput && window.getComputedStyle(desktopInput).display !== 'none') {
        input = desktopInput;
      } else if (mobileInput && window.getComputedStyle(mobileInput).display !== 'none') {
        input = mobileInput;
      } else {
        // Fallback: tomar el primero disponible
        input = desktopInput || mobileInput;
      }
      const query = input?.value?.trim() || '';

      const filters = [{
          id: 'filterVarietal',
          param: 'varietal'
        },
        {
          id: 'filterOrigin',
          param: 'origin'
        },
        {
          id: 'filterWinery',
          param: 'winery_distillery'
        },
        {
          id: 'filterDrinkType',
          param: 'drink_type'
        }
      ];

      let hash = '#search?query=' + encodeURIComponent(query);

      filters.forEach(f => {
        const el = document.getElementById(f.id);
        if (el?.checked) {
          hash += `&${f.param}=1`;
        }
      });

      const yearInput = document.getElementById('filterYearInput');
      if (yearInput?.value) {
        hash += `&vintage_year=${encodeURIComponent(yearInput.value)}`;
      }

      const codeInput = document.getElementById('filterPublicCode');
      if (codeInput?.value) {
        hash += `&public_code=${encodeURIComponent(codeInput.value)}`;
      }

      window.location.hash = hash;
    });
  </script>

  <!-- JS principal (ES modules) -->
  <script type="module" src="<?= $baseUrl ?>js/app.js"></script>
</body>

</html>