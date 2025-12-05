<?php
// public/index.php
declare(strict_types=1);

/**
 * Punto de Entrada Principal de la Aplicación
 * 
 * Este archivo es el índice frontal (front controller) de la aplicación Wine-Pick-QR.
 * Realiza las inicializaciones necesarias, carga la configuración, registra el autoloader
 * y delega la solicitud HTTP al router para su procesamiento.
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

session_start();

require_once __DIR__ . '/../config/config.php';

// Autoloader PSR-4 para cargar clases automáticamente
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

// Registrar solicitud recibida (solo en desarrollo)
wpq_debug_log('Solicitud recibida: ' . $_SERVER['REQUEST_METHOD'] . ' ' . $_SERVER['REQUEST_URI'] 
    . ' desde ' . ($_SERVER['REMOTE_ADDR'] ?? 'desconocido'));

// Procesar la solicitud a través del enrutador
// Si el usuario accede a la raíz del proyecto, mostrar una página índice
// con información básica de la API en vez de "Ruta no encontrada".
$fullUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$projectPath = parse_url(BASE_URL, PHP_URL_PATH) ?: '/proyectos/Wine-Pick-QR-TFI';
$relative = (strpos($fullUri, $projectPath) === 0) ? substr($fullUri, strlen($projectPath)) : $fullUri;
if ($relative === '' || $relative === '/' || $relative === '/index.php') {
    // Respuesta HTML mínima y profesional embebida directamente en index.php
    header('Content-Type: text/html; charset=utf-8', true, 200);
    echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wine-Pick-QR</title></head><body style="font-family:Arial,Helvetica,sans-serif;margin:32px;color:#222">';
    echo '<h1>Wine-Pick-QR</h1>';
    exit;
}

try {
    $router = new Router();
    $router->dispatch();
} catch (\Exception $e) {
    // Manejo centralizado de excepciones no capturadas
    JsonResponse::error(
        'INTERNAL_ERROR',
        'Error interno del servidor.',
        500,
        ['exception' => $e->getMessage()]
    );
}
