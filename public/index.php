<?php
// public/index.php
declare(strict_types=1);

// Mostrar errores en entorno de desarrollo
ini_set('display_errors', '1');
error_reporting(E_ALL);

// Iniciar sesión (se usará para la parte de administración)
session_start();

// Cargar configuración básica
require_once __DIR__ . '/../config/config.php';

// Ejemplo de uso del logger de depuración
wpq_debug_log('Solicitud recibida en public/index.php desde ' . ($_SERVER['REMOTE_ADDR'] ?? 'desconocido'));

// En el futuro aquí se instanciará el Router / Front Controller,
// que delegará en los controladores de la carpeta app/Controllers.

// Para el Sprint 0 / estructura base, mostramos una respuesta simple.
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>WINE-PICK-QR - Backend</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 2rem;
        }
        .container {
            max-width: 640px;
            margin: 2rem auto;
            background: #fff;
            border-radius: 8px;
            padding: 1.5rem 2rem;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        h1 {
            margin-top: 0;
            color: #8b0000;
        }
        code {
            background: #eee;
            padding: 2px 4px;
            border-radius: 4px;
        }
        .ok {
            color: #22863a;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>WINE-PICK-QR – Backend PHP</h1>
        <p class="ok">✅ Punto de entrada cargado correctamente.</p>
        <p>
            Estás viendo la salida de <code>public/index.php</code>.<br>
            La estructura base del backend está creada.
        </p>
        <p style="font-size: 0.9rem; color: #555;">
            Próximos pasos (a nivel técnico):<br>
            – Implementar un front controller / router simple.<br>
            – Añadir controladores para productos, promociones, etc.<br>
            – Conectar con la base de datos usando los parámetros de <code>config/config.php</code>.
        </p>
    </div>
</body>
</html>
