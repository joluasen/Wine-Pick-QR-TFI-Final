<?php
// Modelo para usuarios administradores del sistema
declare(strict_types=1);

/**
 * Clase AdminUser
 * Gestiona usuarios administradores: creación, autenticación y cambio de contraseña.
 */
class AdminUser
{
    /**
     * Instancia de la base de datos
     */
    private \Database $db;

    /**
     * Constructor: inicializa la tabla y crea el admin por defecto si no existe.
     */
    public function __construct(\Database $database)
    {
        $this->db = $database;
        $this->ensureTableExists();
        $this->seedDefaultAdmin();
    }

    /**
     * Crea la tabla admin_users si no existe.
     */
    private function ensureTableExists(): void
    {
        $sql = "CREATE TABLE IF NOT EXISTS admin_users (
            id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $this->db->execute($sql);
    }

    /**
     * Si no hay usuarios, crea uno por defecto (admin/admin123).
     */
    private function seedDefaultAdmin(): void
    {
        // Si no hay usuarios, crear uno por defecto
        $row = $this->db->fetchOne("SELECT COUNT(*) as total FROM admin_users", [], '');
        if ($row && (int)$row['total'] === 0) {
            $this->create('admin', 'admin123');
        }
    }

    /**
     * Busca un usuario por nombre de usuario.
     * @param string $username
     * @return array|null
     */
    public function findByUsername(string $username): ?array
    {
        $sql = "SELECT * FROM admin_users WHERE username = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$username], 's') ?: null;
    }

    /**
     * Crea un nuevo usuario administrador.
     * @param string $username
     * @param string $password
     * @return int ID del usuario creado
     */
    public function create(string $username, string $password): int
    {
        // Hash con PASSWORD_DEFAULT (bcrypt)
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)";
        $this->db->execute($sql, [$username, $hashedPassword], 'ss');
        return $this->db->getLastInsertId();
    }

    /**
     * Verifica las credenciales de acceso de un usuario.
     * @param string $username
     * @param string $password
     * @return array|null Usuario si es válido, null si no
     */
    public function verifyCredentials(string $username, string $password): ?array
    {
        $user = $this->findByUsername($username);
        if (!$user) return null;

        // Verificar con password_verify
        if (password_verify($password, $user['password_hash'])) {
            return $user;
        }
        return null;
    }

    /**
     * Cambia la contraseña de un usuario administrador.
     * @param int $userId ID del usuario
     * @param string $currentPassword Contraseña actual
     * @param string $newPassword Nueva contraseña
     * @return bool True si se cambió correctamente, false si no
     */
    public function changePassword(int $userId, string $currentPassword, string $newPassword): bool
    {
        $sql = "SELECT * FROM admin_users WHERE id = ? LIMIT 1";
        $user = $this->db->fetchOne($sql, [$userId], 'i');
        
        if (!$user) {
            return false;
        }

        // Verificar contraseña actual
        if (!password_verify($currentPassword, $user['password_hash'])) {
            return false;
        }

        // Hash de la nueva contraseña
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Actualizar en la base de datos
        $updateSql = "UPDATE admin_users SET password_hash = ? WHERE id = ?";
        $this->db->execute($updateSql, [$hashedPassword, $userId], 'si');
        
        return true;
    }
}
?>
