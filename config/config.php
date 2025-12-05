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
 * Modificar estos valores según el entorno de despliegue (desarrollo, staging,
 * producción) sin afectar el código de la aplicación.
 */

// Entorno de ejecución: 'dev' | 'prod'
define('WPQ_ENV', 'dev');

// Parámetros de conexión a base de datos (MySQL/MariaDB)
define('DB_HOST', 'localhost');
define('DB_NAME', 'wine_pick_qr');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Rutas del sistema de archivos
define('BASE_PATH', dirname(__DIR__));
define('APP_PATH', BASE_PATH . '/app');
define('PUBLIC_PATH', BASE_PATH . '/public');
define('CONFIG_PATH', BASE_PATH . '/config');
define('LOGS_PATH', BASE_PATH . '/logs');

// URL base de la aplicación
define('BASE_URL', 'http://localhost/proyectos/Wine-Pick-QR-TFI');

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
