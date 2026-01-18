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
