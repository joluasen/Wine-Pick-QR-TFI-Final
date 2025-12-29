<?php
// public/index.php
declare(strict_types=1);

/**
 * Front controller (entrada HTTP)
 *
 * Responsabilidad:
 * - Delegar solicitudes cuyo path comienza con `/api/` al enrutador del backend.
 * - Servir archivos estáticos desde `public/` cuando existan (manifest, JS, CSS, imágenes).
 * - Ejecutar archivos PHP de vistas cuando se soliciten.
 * - Para cualquier otra ruta, devolver la SPA `public/spa.php`.
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

session_start();

require_once __DIR__ . '/../config/config.php';

$fullUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$projectPath = parse_url(BASE_URL, PHP_URL_PATH) ?: '/proyectos/Wine-Pick-QR-TFI';
$relative = (strpos($fullUri, $projectPath) === 0) ? substr($fullUri, strlen($projectPath)) : $fullUri;

// Autoloader PSR-4 para cargar clases del backend (disponible globalmente)
spl_autoload_register(function ($class) {
    // Soportar namespaces PSR-4: App\Helpers\ViewHelper → app/Helpers/ViewHelper.php
    $classPath = str_replace('\\', '/', $class);
    $classPath = str_replace('App/', '', $classPath); // Quitar namespace raíz

    $paths = [
        BASE_PATH . '/app/' . $classPath . '.php',
        BASE_PATH . '/app/Utils/' . $class . '.php',
        BASE_PATH . '/app/Models/' . $class . '.php',
        BASE_PATH . '/app/Controllers/' . $class . '.php',
        BASE_PATH . '/app/Helpers/' . $class . '.php',
    ];

    foreach ($paths as $file) {
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Si es una petición a la API, delegar al router backend
if (strpos($relative, '/api/') === 0) {

    // Registrar solicitud
    wpq_debug_log('Solicitud API: ' . $_SERVER['REQUEST_METHOD'] . ' ' . $_SERVER['REQUEST_URI'] . ' desde ' . ($_SERVER['REMOTE_ADDR'] ?? 'desconocido'));

    try {
        $router = new Router();
        $router->dispatch();
    } catch (\Exception $e) {
        JsonResponse::error(
            'INTERNAL_ERROR',
            'Error interno del servidor.',
            500,
            ['exception' => $e->getMessage()]
        );
    }
    exit;
}

// Antes de servir la SPA, comprobar si el recurso solicitado existe
$publicDir = __DIR__;
$requestedPath = $relative;

// Normalizar ruta (asegurar que empieza con '/')
if ($requestedPath === '' || $requestedPath[0] !== '/') {
    $requestedPath = '/' . ltrim($requestedPath, '/');
}

$candidate = realpath($publicDir . $requestedPath);

if ($candidate !== false && strpos($candidate, $publicDir) === 0 && is_file($candidate)) {
    // Determinar tipo MIME básico por extensión
    $ext = strtolower(pathinfo($candidate, PATHINFO_EXTENSION));
    
    // Si es un archivo PHP, ejecutarlo
    if ($ext === 'php') {
        header('Content-Type: text/html; charset=utf-8');
        include $candidate;
        exit;
    }
    
    $mimeMap = [
        'html' => 'text/html; charset=utf-8',
        'htm'  => 'text/html; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'js'   => 'application/javascript; charset=utf-8',
        'mjs'  => 'application/javascript; charset=utf-8',
        'css'  => 'text/css; charset=utf-8',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'webp' => 'image/webp',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
        'map'  => 'application/json; charset=utf-8',
        'txt'  => 'text/plain; charset=utf-8'
    ];

    $contentType = $mimeMap[$ext] ?? 'application/octet-stream';
    header('Content-Type: ' . $contentType, true, 200);
    readfile($candidate);
    exit;
}

// Si no es un archivo estático, servir la SPA
// Primero intentar spa.php, luego spa.html como fallback
$spaPhp = $publicDir . '/spa.php';
$spaHtml = $publicDir . '/spa.html';

if (file_exists($spaPhp)) {
    header('Content-Type: text/html; charset=utf-8', true, 200);
    include $spaPhp;
    exit;
}

if (file_exists($spaHtml)) {
    header('Content-Type: text/html; charset=utf-8', true, 200);
    readfile($spaHtml);
    exit;
}

// Fallback mínimo
header('Content-Type: text/plain; charset=utf-8', true, 200);
echo "Wine-Pick-QR - API / PWA\n";
exit;
