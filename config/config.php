<?php
// config/config.php
declare(strict_types=1);

/**
 * Configuración Central del Proyecto Wine-Pick-QR
 * 
 * Este archivo contiene todas las constantes de configuración necesarias para
 * la aplicación, incluyendo parámetros de base de datos, rutas del sistema de
 * archivos y configuración de entorno.
 * 
 * Modificar .env en la raíz del proyecto para cambiar entre local y hosting.
 */

// Cargar variables de entorno desde .env
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Ignorar comentarios
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        // Parsear KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            // No sobrescribir si ya existe en $_ENV o como constante
            if (!isset($_ENV[$key]) && !defined($key)) {
                $_ENV[$key] = $value;
            }
        }
    }
}

// Entorno de ejecución: 'dev' | 'prod'
define('WPQ_ENV', $_ENV['WPQ_ENV'] ?? 'dev');

// Parámetros de conexión a base de datos (MySQL/MariaDB)
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'wine_pick_qr');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');
define('DB_CHARSET', $_ENV['DB_CHARSET'] ?? 'utf8mb4');

// Rutas del sistema de archivos
define('BASE_PATH', dirname(__DIR__));
define('APP_PATH', BASE_PATH . '/app');
define('PUBLIC_PATH', BASE_PATH . '/public');
define('CONFIG_PATH', BASE_PATH . '/config');
define('LOGS_PATH', BASE_PATH . '/logs');

// URL base de la aplicación
define('BASE_URL', $_ENV['BASE_URL'] ?? 'http://localhost/proyectos/Wine-Pick-QR-TFI');

// Autenticación (JWT) - configurable vía .env
// CRÍTICO: En producción, JWT_SECRET DEBE estar configurado en .env
$jwtSecret = $_ENV['JWT_SECRET'] ?? '';
if (WPQ_ENV === 'prod' && (empty($jwtSecret) || $jwtSecret === 'change-this-in-.env')) {
    // En producción, no permitir secrets inseguros
    die('ERROR CRÍTICO: JWT_SECRET no está configurado en .env. La aplicación no puede iniciar en modo producción sin un secret seguro.');
}
define('JWT_SECRET', $jwtSecret ?: 'dev-only-secret-do-not-use-in-prod');
define('AUTH_COOKIE_NAME', $_ENV['AUTH_COOKIE_NAME'] ?? 'wpq_auth');

// Headers de seguridad HTTP (se aplican en producción)
if (WPQ_ENV === 'prod' && php_sapi_name() !== 'cli') {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
}

/**
 * Registra mensajes de depuración en el archivo de logs.
 * 
 * Solo escribe en logs cuando el entorno está configurado como 'dev'.
 * En producción, esta función no produce salida.
 * 
 * @param string $message Mensaje a registrar en el log.
 * @return void
 */
function wpq_debug_log(string $message): void
{
    if (WPQ_ENV !== 'dev') {
        return;
    }

    $date = date('Y-m-d H:i:s');
    $line = "[{$date}] {$message}\n";

    if (!is_dir(LOGS_PATH)) {
        @mkdir(LOGS_PATH, 0777, true);
    }

    @file_put_contents(LOGS_PATH . '/debug.log', $line, FILE_APPEND);
}

