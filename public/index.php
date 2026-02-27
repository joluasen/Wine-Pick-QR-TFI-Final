<?php
// public/index.php
declare(strict_types=1);

/**
 * index.php - Front controller (entrada HTTP principal)
 *
 * Este archivo es el punto de entrada ÚNICO para todas las solicitudes HTTP del proyecto.
 * Implementa el patrón Front Controller, típico en aplicaciones SPA modernas.
 *
 * ¿Qué hace este archivo?
 *
 * 1. Carga la configuración global del proyecto (rutas, entorno, etc.).
 * 2. Configura el manejo de errores según el entorno (dev/prod).
 * 3. Registra un autoloader para cargar clases PHP automáticamente.
 * 4. Analiza la URL solicitada y decide:
 *    a) Si la ruta comienza con /api/, delega la solicitud al backend (Router PHP).
 *    b) Si la ruta corresponde a un archivo estático (CSS, JS, imagen, etc.), lo sirve directamente.
 *    c) Si la ruta es un archivo PHP de vista, lo ejecuta.
 *    d) Si no es ninguna de las anteriores, sirve la SPA (Single Page Application) para que el frontend maneje la navegación.
 *
 * Esto permite que la aplicación funcione como una PWA/SPA moderna, con rutas amigables y backend seguro.
 */

// 1. Cargar configuración global del proyecto (define rutas, entorno, etc.)
require_once __DIR__ . '/../config/config.php';

// 2. Configurar manejo de errores según entorno (dev/prod)
//    - En producción: oculta errores al usuario y los guarda en logs
//    - En desarrollo: muestra todos los errores en pantalla
if (WPQ_ENV === 'prod') {
    // Producción: NO mostrar errores, solo loguearlos
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(E_ALL);
    ini_set('log_errors', '1');
    ini_set('error_log', LOGS_PATH . '/php_errors.log');
} else {
    // Desarrollo: Mostrar todos los errores
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
}


// 3. Determinar la ruta solicitada por el usuario
$fullUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/'; // Ej: /proyectos/Wine-Pick-QR-TFI/api/public/productos
$projectPath = parse_url(BASE_URL, PHP_URL_PATH) ?: '/proyectos/Wine-Pick-QR-TFI'; // Ruta base del proyecto
$relative = (strpos($fullUri, $projectPath) === 0) ? substr($fullUri, strlen($projectPath)) : $fullUri; // Ruta relativa dentro del proyecto


// 4. Autoloader PSR-4: permite cargar clases PHP automáticamente según su nombre
//    Ejemplo: App\Models\Product → app/Models/Product.php
spl_autoload_register(function ($class) {
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


// 5. Si la ruta solicitada comienza con /api/, delegar al backend (Router PHP)
if (strpos($relative, '/api/') === 0) {
    // Loguear la solicitud API
    wpq_debug_log('Solicitud API: ' . $_SERVER['REQUEST_METHOD'] . ' ' . $_SERVER['REQUEST_URI'] . ' desde ' . ($_SERVER['REMOTE_ADDR'] ?? 'desconocido'));
    try {
        $router = new Router(); // Instanciar el enrutador backend
        $router->dispatch();    // Procesar la solicitud y devolver respuesta JSON
    } catch (\Exception $e) {
        // Si ocurre un error, devolver respuesta JSON de error
        JsonResponse::error(
            'INTERNAL_ERROR',
            'Error interno del servidor.',
            500,
            ['exception' => $e->getMessage()]
        );
    }
    exit;
}


// 6. Si la ruta solicitada corresponde a un archivo estático (CSS, JS, imagen, etc.), servirlo directamente
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
    // Si es un archivo PHP, ejecutarlo como vista
    if ($ext === 'php') {
        header('Content-Type: text/html; charset=utf-8');
        include $candidate;
        exit;
    }
    // Mapear extensiones a tipos MIME
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


// 7. Si no es un archivo estático ni una API, servir la SPA (Single Page Application)
//    Esto permite que el frontend maneje rutas amigables (ej: /producto/123)
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
// Fallback mínimo si no existe SPA
header('Content-Type: text/plain; charset=utf-8', true, 200);
echo "Wine-Pick-QR - API / PWA\n";
exit;
