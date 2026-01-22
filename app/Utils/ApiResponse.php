<?php
// app/Utils/ApiResponse.php
declare(strict_types=1);

/**
 * Clase ApiResponse
 *
 * Wrapper de respuestas de API.
 * Proporciona métodos helper de alto nivel para construir respuestas HTTP comunes.
 * Encapsula JsonResponse, simplificando los llamados desde controladores.
 *
 * Métodos disponibles:
 * - success: respuesta exitosa (200, 201)
 * - validationError: error de validación de datos (400)
 * - notFound: recurso no encontrado (404)
 * - conflict: conflicto (clave duplicada, etc.) (409)
 * - unauthorized: no autenticado (401)
 * - forbidden: no autorizado (403)
 * - serverError: error interno del servidor (500)
 * - customError: error personalizado
 */
class ApiResponse
{

    // ========== CÓDIGOS HTTP ========== 
    /** @var int Código HTTP 200 OK */
    const HTTP_OK = 200;
    /** @var int Código HTTP 201 Created */
    const HTTP_CREATED = 201;
    /** @var int Código HTTP 400 Bad Request */
    const HTTP_BAD_REQUEST = 400;
    /** @var int Código HTTP 401 Unauthorized */
    const HTTP_UNAUTHORIZED = 401;
    /** @var int Código HTTP 403 Forbidden */
    const HTTP_FORBIDDEN = 403;
    /** @var int Código HTTP 404 Not Found */
    const HTTP_NOT_FOUND = 404;
    /** @var int Código HTTP 409 Conflict */
    const HTTP_CONFLICT = 409;
    /** @var int Código HTTP 500 Internal Server Error */
    const HTTP_SERVER_ERROR = 500;

    // ========== CÓDIGOS DE ERROR LÓGICOS ========== 
    /** @var string Error de validación de datos */
    const ERROR_VALIDATION = 'VALIDATION_ERROR';
    /** @var string Error de recurso no encontrado */
    const ERROR_NOT_FOUND = 'NOT_FOUND';
    /** @var string Error de conflicto (duplicado, etc.) */
    const ERROR_CONFLICT = 'CONFLICT';
    /** @var string Error de autenticación */
    const ERROR_UNAUTHORIZED = 'UNAUTHORIZED';
    /** @var string Error de autorización */
    const ERROR_FORBIDDEN = 'FORBIDDEN';
    /** @var string Error interno del servidor */
    const ERROR_SERVER = 'INTERNAL_ERROR';

    /**
     * Respuesta exitosa (200 OK o 201 Created).
     * 
     * @param mixed $data Los datos a devolver.
     * @param int $httpCode Código HTTP (200 por defecto, 201 para Created).
     * 
     * @return void
     */
    public static function success($data, int $httpCode = self::HTTP_OK): void
    {
        JsonResponse::success($data, $httpCode);
    }

    /**
     * Error de validación (400 Bad Request).
     * 
     * @param string $message Mensaje del error.
     * @param string|null $field Campo que genera el error (opcional).
     * @param array $details Información adicional del error (opcional).
     * 
     * @return void
     */
    public static function validationError(
        string $message,
        ?string $field = null,
        array $details = []
    ): void {
        $errorDetails = [];
        
        if ($field) {
            $errorDetails['field'] = $field;
        }
        
        if (!empty($details)) {
            $errorDetails = array_merge($errorDetails, $details);
        }

        JsonResponse::error(
            self::ERROR_VALIDATION,
            $message,
            self::HTTP_BAD_REQUEST,
            $errorDetails
        );
    }

    /**
     * Recurso no encontrado (404 Not Found).
     * 
     * @param string $message Mensaje del error.
     * 
     * @return void
     */
    public static function notFound(
        string $message = 'Recurso no encontrado.'
    ): void {
        JsonResponse::error(
            self::ERROR_NOT_FOUND,
            $message,
            self::HTTP_NOT_FOUND
        );
    }

    /**
     * Conflicto - Recurso duplicado (409 Conflict).
     * 
     * @param string $message Mensaje del error.
     * @param string|null $field Campo que causa el conflicto (opcional).
     * @param array $details Información adicional (opcional).
     * 
     * @return void
     */
    public static function conflict(
        string $message,
        ?string $field = null,
        array $details = []
    ): void {
        $errorDetails = [];
        
        if ($field) {
            $errorDetails['field'] = $field;
        }
        
        if (!empty($details)) {
            $errorDetails = array_merge($errorDetails, $details);
        }

        JsonResponse::error(
            self::ERROR_CONFLICT,
            $message,
            self::HTTP_CONFLICT,
            $errorDetails
        );
    }

    /**
     * No autorizado (401 Unauthorized).
     * 
     * @param string $message Mensaje del error.
     * 
     * @return void
     */
    public static function unauthorized(
        string $message = 'Autenticación requerida.'
    ): void {
        JsonResponse::error(
            self::ERROR_UNAUTHORIZED,
            $message,
            self::HTTP_UNAUTHORIZED
        );
    }

    /**
     * Prohibido (403 Forbidden).
     * 
     * @param string $message Mensaje del error.
     * 
     * @return void
     */
    public static function forbidden(
        string $message = 'Acceso prohibido.'
    ): void {
        JsonResponse::error(
            self::ERROR_FORBIDDEN,
            $message,
            self::HTTP_FORBIDDEN
        );
    }

    /**
     * Error interno del servidor (500 Internal Server Error).
     * 
     * @param string $message Mensaje del error.
     * @param array $details Información adicional (solo en dev).
     * 
     * @return void
     */
    public static function serverError(
        string $message = 'Error interno del servidor.',
        array $details = []
    ): void {
        JsonResponse::error(
            self::ERROR_SERVER,
            $message,
            self::HTTP_SERVER_ERROR,
            $details
        );
    }

    /**
     * Error genérico personalizado.
     * 
     * Para casos que no encajan en los helpers anteriores.
     * 
     * @param string $code Código de error.
     * @param string $message Mensaje del error.
     * @param int $httpCode Código HTTP.
     * @param array $details Información adicional (opcional).
     * 
     * @return void
     */
    public static function customError(
        string $code,
        string $message,
        int $httpCode = self::HTTP_SERVER_ERROR,
        array $details = []
    ): void {
        JsonResponse::error($code, $message, $httpCode, $details);
    }
}
?>
