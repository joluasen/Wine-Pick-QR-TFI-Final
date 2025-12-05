<?php
// public/index.php
declare(strict_types=1);

/**
 * Front controller combinado
 * - Si la ruta solicitada empieza con /api/ ejecuta el enrutador backend (API)
 * - En caso contrario sirve la PWA (SPA) ubicada en public/spa.html
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

session_start();

require_once __DIR__ . '/../config/config.php';

$fullUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$projectPath = parse_url(BASE_URL, PHP_URL_PATH) ?: '/proyectos/Wine-Pick-QR-TFI';
$relative = (strpos($fullUri, $projectPath) === 0) ? substr($fullUri, strlen($projectPath)) : $fullUri;

// Si es una petición a la API, delegar al router backend
if (strpos($relative, '/api/') === 0) {
    // Autoloader PSR-4 para cargar clases del backend
    spl_autoload_register(function ($class) {
        $paths = [
            BASE_PATH . '/app/Utils/' . $class . '.php',
            BASE_PATH . '/app/Models/' . $class . '.php',
            BASE_PATH . '/app/Controllers/' . $class . '.php',
        ];

        foreach ($paths as $file) {
            if (file_exists($file)) {
                require_once $file;
                return;
            }
        }
    });

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

// Para cualquier otra ruta servimos la SPA (PWA)
// Se reservó previamente la SPA en public/spa.html
$spa = __DIR__ . '/spa.html';
if (file_exists($spa)) {
    header('Content-Type: text/html; charset=utf-8', true, 200);
    readfile($spa);
    exit;
}

// Fallback mínimo
header('Content-Type: text/plain; charset=utf-8', true, 200);
echo "Wine-Pick-QR - API / PWA\n";
exit;

