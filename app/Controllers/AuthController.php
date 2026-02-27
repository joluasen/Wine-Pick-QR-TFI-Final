<?php

declare(strict_types=1);
// Controlador para autenticación y gestión de sesión de administradores.

class AuthController
{
    // Modelo de usuario administrador para autenticación y cambio de contraseña.
    private \AdminUser $adminModel;

    // Inicializa el controlador y el modelo de administrador.
    public function __construct()
    {
        try {
            $db = Database::getInstance();
            $this->adminModel = new AdminUser($db);
        } catch (\Exception $e) {
            // Si falla la conexión a la base de datos, retorna error 500 con detalles.
            ApiResponse::serverError(
                'Error al conectar com a base de datos.',
                ['details' => $e->getMessage()]
            );
        }
    }
    /**
     * Cambia la contraseña del administrador autenticado.
     * Endpoint: POST /api/admin/change-password
     * Requiere autenticación y validaciones de seguridad.
     */
    public function changePassword(): void
    {
        // Verifica que el usuario esté autenticado.
        $claims = Auth::getUser();
        if (!$claims) {
            ApiResponse::unauthorized('No autenticado');
        }
        // Obtiene y decodifica el cuerpo de la solicitud (JSON).
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if ($data === null) {
            ApiResponse::validationError('El cuerpo de la solicitud no es un JSON válido.');
        }
        // Extrae y limpia los campos del formulario.
        $currentPassword = trim($data['currentPassword'] ?? '');
        $newPassword = $data['newPassword'] ?? '';
        $confirmPassword = $data['confirmPassword'] ?? '';

        // Valida que todos los campos requeridos estén presentes.
        if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
            ApiResponse::validationError('Todos los campos son requeridos.');
        }

        // Valida que la nueva contraseña y su confirmación coincidan.
        if ($newPassword !== $confirmPassword) {
            ApiResponse::validationError('Las contraseñas nuevas no coinciden.');
        }

        // Validación de seguridad de la nueva contraseña
        if (strlen($newPassword) < 8) {
            ApiResponse::validationError('La contraseña debe tener al menos 8 caracteres.');
        }

        // Valida que la nueva contraseña tenga mayúsculas, minúsculas y caracteres especiales
        $hasLower = preg_match('/[a-z]/', $newPassword);
        $hasUpper = preg_match('/[A-Z]/', $newPassword);
        $hasSpecial = preg_match('/[^A-Za-z0-9]/', $newPassword);

        if (!$hasLower || !$hasUpper || !$hasSpecial) {
            ApiResponse::validationError('La contraseña debe incluir mayúsculas, minúsculas y caracteres especiales.');
        }

        // Obtiene el ID del usuario autenticado.
        $userId = (int)($claims['sub'] ?? 0);

        // Intenta cambiar la contraseña usando el modelo.
        $success = $this->adminModel->changePassword($userId, $currentPassword, $newPassword);

        if (!$success) {
            ApiResponse::unauthorized('La contraseña actual es incorrecta.');
        }
        // Respuesta de éxito si la contraseña fue actualizada.
        ApiResponse::success(['message' => 'Contraseña actualizada correctamente'], 200);
    }

    /**
     * Inicia sesión de administrador.
     * Endpoint: POST /api/admin/login
     * Valida credenciales y emite token JWT.
     */
    public function login(): void
    {
                // Obtiene y decodifica el cuerpo de la solicitud (JSON).
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if ($data === null) {
            ApiResponse::validationError('El cuerpo de la solicitud no es un JSON válido.');
        }
// Extrae y limpia los campos del formulario.
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

                // Valida que usuario y contraseña estén presentes.
        if ($username === '' || $password === '') {
            ApiResponse::validationError('Usuario y contraseña son requeridos.');
        }

        // Verifica las credenciales usando el modelo.
        $user = $this->adminModel->verifyCredentials($username, $password);
        if (!$user) {
            ApiResponse::unauthorized('Credenciales inválidas.');
        }

           // Emite el token JWT y setea la cookie de autenticación (HttpOnly).
        Auth::issueToken($user, 1800); // 30 minutos

                // Respuesta de éxito con datos mínimos del usuario.
        ApiResponse::success([
            'id' => (int)$user['id'],
            'username' => $user['username'],
        ], 200);
    }

    /**
     * Cierra la sesión del administrador.
     * Endpoint: POST /api/admin/logout
     * Elimina la cookie de autenticación.
     */
    public function logout(): void
    {
        Auth::clearAuthCookie();
        ApiResponse::success(['message' => 'Sesión cerrada'], 200);
    }

    /**
     * Devuelve los datos del administrador autenticado.
     * Endpoint: GET /api/admin/me
     * Requiere autenticación.
     */
    public function me(): void
    {
        $claims = Auth::getUser();
        if (!$claims) {
            ApiResponse::unauthorized('No autenticado');
        }

        ApiResponse::success([
            'id' => (int)($claims['sub'] ?? 0),
            'username' => (string)($claims['username'] ?? ''),
        ], 200);
    }
}
