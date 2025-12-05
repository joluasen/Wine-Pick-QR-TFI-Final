<?php
// public/index.php
declare(strict_types=1);

ini_set('display_errors', '1');
error_reporting(E_ALL);

session_start();

require_once __DIR__ . '/../config/config.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>WINE-PICK-QR</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Manifest PWA -->
    <link rel="manifest" href="./manifest.json">
    <meta name="theme-color" content="#8b0000">

    <!-- Icono base -->
    <link rel="icon" type="image/png" sizes="192x192" href="./assets/icons/icon-192.png">

    <!-- Estilos base -->
    <link rel="stylesheet" href="./css/styles.css">
</head>
<body>
    <header class="app-header">
        <h1 class="app-title">WINE-PICK-QR</h1>
        <nav class="app-nav">
            <button class="nav-btn" data-link="#home">Inicio</button>
            <button class="nav-btn" data-link="#qr">Consulta por QR</button>
            <button class="nav-btn" data-link="#search">Búsqueda</button>
            <button class="nav-btn" data-link="#admin">Admin</button>
        </nav>
    </header>

    <main class="app-main">
        <!-- Vista: Inicio -->
        <section class="view view--active" data-view="home">
            <h2>Inicio</h2>
            <p>Bienvenido a WINE-PICK-QR.</p>
            <p>
                Desde aquí podrás:
            </p>
            <ul>
                <li>Ir a <strong>Consulta por QR</strong> para escanear códigos en góndola.</li>
                <li>Usar la <strong>Búsqueda</strong> para encontrar productos por texto.</li>
                <li>Acceder al <strong>Panel Admin</strong> (para alta de productos y promos).</li>
            </ul>
        </section>

        <!-- Vista: Consulta por QR (esqueleto) -->
        <section class="view" data-view="qr">
            <h2>Consulta por QR</h2>
            <p>Esta vista mostrará la información del producto a partir de un código QR.</p>
            <p>
                Próximamente aquí se integrará la lógica de:
                <br>– Lectura de código (o ingreso manual de código),
                <br>– Llamada a la API de consulta por código.
            </p>
        </section>

        <!-- Vista: Búsqueda de productos (esqueleto) -->
        <section class="view" data-view="search">
            <h2>Búsqueda de productos</h2>
            <p>Buscá vinos o licores por nombre, bodega, tipo, etc.</p>

            <form id="search-form">
                <label for="search-input">Texto de búsqueda:</label>
                <input id="search-input" type="text" name="q" placeholder="Ej: Malbec, bodega, etc.">
                <button type="submit">Buscar</button>
            </form>

            <div id="search-results">
                <!-- Aquí se mostrarán los resultados de búsqueda (HU-C2) -->
                <p class="placeholder">Los resultados aparecerán aquí.</p>
            </div>
        </section>

        <!-- Vista: Acceso admin (esqueleto) -->
        <section class="view" data-view="admin">
            <h2>Acceso administrador</h2>
            <p>Login al panel administrativo.</p>

            <form id="admin-login-form">
                <label for="admin-user">Usuario</label>
                <input id="admin-user" type="text" name="user" autocomplete="username">

                <label for="admin-pass">Contraseña</label>
                <input id="admin-pass" type="password" name="pass" autocomplete="current-password">

                <button type="submit">Ingresar</button>
            </form>

            <p class="placeholder">
                Más adelante, desde aquí se redirigirá al panel admin
                (HU-A1: alta de producto y otras operaciones).
            </p>
        </section>
    </main>

    <footer class="app-footer">
        <small>WINE-PICK-QR &copy; <?php echo date('Y'); ?></small>
    </footer>

    <!-- JS principal (módulos ES) -->
    <script type="module" src="./js/app.js"></script>
</body>
</html>

