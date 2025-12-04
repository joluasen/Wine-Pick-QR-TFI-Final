<?php
// config/config.php
declare(strict_types=1);

/**
 * Configuración básica del proyecto WINE-PICK-QR.
 * 
 * NOTA:
 * - Ajusta DB_NAME, DB_USER y DB_PASS según tu entorno XAMPP.
 * - Por ahora NO abrimos conexión a la BD automáticamente para evitar errores
 *   si la base todavía no existe.
 */

// Entorno: 'dev' | 'prod'
define('WPQ_ENV', 'dev');

// Parámetros de base de datos (MySQL / MariaDB en XAMPP)
define('DB_HOST', 'localhost');
define('DB_NAME', 'wine_pick_qr');   // Cambiá este nombre si usás otro
define('DB_USER', 'root');
define('DB_PASS', '');               // En XAMPP por defecto suele ser vacío
define('DB_CHARSET', 'utf8mb4');

// Rutas del sistema de archivos
define('BASE_PATH', dirname(__DIR__));      // .../wine-pick-qr
define('APP_PATH', BASE_PATH . '/app');
define('PUBLIC_PATH', BASE_PATH . '/public');
define('CONFIG_PATH', BASE_PATH . '/config');
define('LOGS_PATH', BASE_PATH . '/logs');

// URL base (para entornos locales)
define('BASE_URL', 'http://localhost/proyectos/Wine-Pick-QR-TFI');

/**
 * Función de ayuda para depuración controlada.
 * Solo muestra detalles si estamos en entorno 'dev'.
 */
function wpq_debug_log(string $message): void
{
    if (WPQ_ENV !== 'dev') {
        return;
    }

    $date = date('Y-m-d H:i:s');
    $line = "[{$date}] {$message}\n";

    // Aseguramos que exista la carpeta logs
    if (!is_dir(LOGS_PATH)) {
        @mkdir(LOGS_PATH, 0777, true);
    }

    @file_put_contents(LOGS_PATH . '/debug.log', $line, FILE_APPEND);
}
