<?php
// app/Controllers/AuthController.php
declare(strict_types=1);

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
                'Error al conectar con la base de datos.',
                ['details' => $e->getMessage()]
            );
        }
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

        // Autenticación deshabilitada: responder éxito sin sesión
        ApiResponse::success([
            'message' => 'Autenticación deshabilitada',
            'username' => $username !== '' ? $username : 'public',
        ], 200);
    }

    /**
     * POST /api/admin/logout
     */
    public function logout(): void
    {
        ApiResponse::success(['message' => 'Autenticación deshabilitada'], 200);
    }

    /**
     * GET /api/admin/me
     */
    public function me(): void
    {
        ApiResponse::success([
            'id' => 0,
            'username' => 'public',
        ], 200);
    }
}
?>
