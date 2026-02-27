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

/**
 * Helper: primero mira $_ENV (por tu loader .env), si no existe usa getenv()
 */
function wpq_env(string $key, $default = null) {
    if (array_key_exists($key, $_ENV)) return $_ENV[$key];
    $v = getenv($key);
    return ($v === false) ? $default : $v;
}


/**
 * Entorno de ejecución: 'dev' | 'prod'
 * @var string
 */
define('WPQ_ENV', wpq_env('WPQ_ENV', 'dev'));

/**
 * DB (ahora incluye puerto + SSL)
 * Parámetros de conexión a base de datos (MySQL/MariaDB)
 * @var string
 */
define('DB_HOST', wpq_env('DB_HOST', 'localhost'));
define('DB_PORT', (int) wpq_env('DB_PORT', '3306'));
define('DB_NAME', wpq_env('DB_NAME', 'wine_pick_qr'));
define('DB_USER', wpq_env('DB_USER', 'root'));
define('DB_PASS', wpq_env('DB_PASS', ''));
define('DB_CHARSET', wpq_env('DB_CHARSET', 'utf8mb4'));

/**
 * SSL DB (Aiven)
 * - DB_SSL_CA: ruta a archivo CA dentro del contenedor (Aiven)
 * - DB_SSL_VERIFY: "1"/"true" para exigir SSL
 */
define('DB_SSL_CA', wpq_env('DB_SSL_CA', ''));
define('DB_SSL_VERIFY', in_array(strtolower((string) wpq_env('DB_SSL_VERIFY', '0')), ['1','true','yes'], true));

/**
 * Rutas del sistema de archivos
 * @var string
 */
define('BASE_PATH', dirname(__DIR__));
define('APP_PATH', BASE_PATH . '/app');
define('PUBLIC_PATH', BASE_PATH . '/public');
define('CONFIG_PATH', BASE_PATH . '/config');
define('LOGS_PATH', BASE_PATH . '/logs');


/**
 * URL base de la aplicación
 * @var string
 */
define('BASE_URL', wpq_env('BASE_URL', 'http://localhost/proyectos/Wine-Pick-QR-TFI'));


/**
 * Autenticación (JWT) - configurable vía .env
 * CRÍTICO: En producción, JWT_SECRET DEBE estar configurado en .env
 * @var string
 */
$jwtSecret = (string) wpq_env('JWT_SECRET', '');
if (WPQ_ENV === 'prod' && (empty($jwtSecret) || $jwtSecret === 'change-this-in-.env')) {
    die('ERROR CRÍTICO: JWT_SECRET no está configurado. La aplicación no puede iniciar en modo producción sin un secret seguro.');
}
define('JWT_SECRET', $jwtSecret ?: 'dev-only-secret-do-not-use-in-prod');
define('AUTH_COOKIE_NAME', wpq_env('AUTH_COOKIE_NAME', 'wpq_auth'));


/**
 * Headers de seguridad HTTP (se aplican en producción)
 */
if (WPQ_ENV === 'prod' && php_sapi_name() !== 'cli') {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=(self)');
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

