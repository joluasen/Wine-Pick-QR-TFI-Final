<?php
declare(strict_types=1);
// app/Controllers/AuthController.php

class AuthController
{
    private \AdminUser $adminModel;

    public function __construct()
    {
        try {
            $db = Database::getInstance();
            $this->adminModel = new AdminUser($db);
        } catch (\Exception $e) {
            ApiResponse::serverError(
                'Error al conectar com a base de datos.',
                ['details' => $e->getMessage()]
            );
        }
    }

    /**
     * POST /api/admin/change-password
     * Cambia la contraseña del admin autenticado
     */
    public function changePassword(): void
    {
        // Verificar autenticación
        $claims = Auth::getUser();
        if (!$claims) {
            ApiResponse::unauthorized('No autenticado');
        }

        $body = file_get_contents('php://input');
        $data = json_decode($body, true);
        
        if ($data === null) {
            ApiResponse::validationError('El cuerpo de la solicitud no es un JSON válido.');
        }

        $currentPassword = trim($data['currentPassword'] ?? '');
        $newPassword = $data['newPassword'] ?? '';
        $confirmPassword = $data['confirmPassword'] ?? '';

        // Validar campos requeridos
        if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
            ApiResponse::validationError('Todos los campos son requeridos.');
        }

        // Validar que las contraseñas coincidan
        if ($newPassword !== $confirmPassword) {
            ApiResponse::validationError('Las contraseñas nuevas no coinciden.');
        }

        // Validación de seguridad de la nueva contraseña
        if (strlen($newPassword) < 8) {
            ApiResponse::validationError('La contraseña debe tener al menos 8 caracteres.');
        }

        // Debe tener mayúsculas Y minúsculas Y caracteres especiales
        $hasLower = preg_match('/[a-z]/', $newPassword);
        $hasUpper = preg_match('/[A-Z]/', $newPassword);
        $hasSpecial = preg_match('/[^A-Za-z0-9]/', $newPassword);

        if (!$hasLower || !$hasUpper || !$hasSpecial) {
            ApiResponse::validationError('La contraseña debe incluir mayúsculas, minúsculas y caracteres especiales.');
        }

        $userId = (int)($claims['sub'] ?? 0);
        
        // Intentar cambiar la contraseña
        $success = $this->adminModel->changePassword($userId, $currentPassword, $newPassword);
        
        if (!$success) {
            ApiResponse::unauthorized('La contraseña actual es incorrecta.');
        }

        ApiResponse::success(['message' => 'Contraseña actualizada correctamente'], 200);
    }

    /**
     * POST /api/admin/login
     */
    public function login(): void
    {
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if ($data === null) {
            ApiResponse::validationError('El cuerpo de la solicitud no es un JSON válido.');
        }

        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if ($username === '' || $password === '') {
            ApiResponse::validationError('Usuario y contraseña son requeridos.');
        }

        // Verificar credenciales
        $user = $this->adminModel->verifyCredentials($username, $password);
        if (!$user) {
            ApiResponse::unauthorized('Credenciales inválidas.');
        }

        // Emitir JWT y setear cookie HttpOnly
        Auth::issueToken($user, 1800); // 30 minutos

        ApiResponse::success([
            'id' => (int)$user['id'],
            'username' => $user['username'],
        ], 200);
    }

    /**
     * POST /api/admin/logout
     */
    public function logout(): void
    {
        Auth::clearAuthCookie();
        ApiResponse::success(['message' => 'Sesión cerrada'], 200);
    }

    /**
     * GET /api/admin/me
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
?>
