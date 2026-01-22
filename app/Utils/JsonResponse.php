<?php
// app/Utils/JsonResponse.php
declare(strict_types=1);

/**
 * Clase JsonResponse
 *
 * Centraliza la construcción de respuestas HTTP con formato JSON uniforme.
 * Garantiza que todas las respuestas de la API sigan la estructura:
 *   { ok: bool, data: mixed, error: null|object }
 *
 * Proporciona métodos estáticos para respuestas exitosas y de error,
 * manejando automáticamente códigos HTTP, headers y serialización JSON.
 */
class JsonResponse
{
    /**
     * Construye y envía una respuesta exitosa en formato JSON.
     *
     * @param mixed $data Los datos a devolver (array, string, etc.)
     * @param int $httpCode Código HTTP (200 por defecto, 201 para Created)
     * @return void Envía el JSON y termina la ejecución.
     */
    public static function success($data, int $httpCode = 200): void
    {
        http_response_code($httpCode);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'ok' => true,
            'data' => $data,
            'error' => null,
        ];

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Construye y envía una respuesta de error en formato JSON.
     *
     * @param string $errorCode Código de error (VALIDATION_ERROR, NOT_FOUND, etc.)
     * @param string $message Mensaje legible del error
     * @param int $httpCode Código HTTP (400, 404, 500, etc.)
     * @param array $details Información adicional (solo en dev)
     * @return void Envía el JSON y termina la ejecución.
     */
    public static function error(
        string $errorCode,
        string $message,
        int $httpCode = 400,
        array $details = []
    ): void {
        http_response_code($httpCode);
        header('Content-Type: application/json; charset=utf-8');

        $errorResponse = [
            'code' => $errorCode,
            'message' => $message,
        ];

        // Solo incluir detalles en desarrollo
        if (WPQ_ENV === 'dev' && !empty($details)) {
            $errorResponse['details'] = $details;
        }

        $response = [
            'ok' => false,
            'data' => null,
            'error' => $errorResponse,
        ];

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
?>
