<?php
// app/Models/AdminUser.php
declare(strict_types=1);

class AdminUser
{
    private \Database $db;

    public function __construct(\Database $database)
    {
        $this->db = $database;
        $this->ensureTableExists();
        $this->seedDefaultAdmin();
    }

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

    private function seedDefaultAdmin(): void
    {
        // Si no hay usuarios, crear uno por defecto
        $row = $this->db->fetchOne("SELECT COUNT(*) as total FROM admin_users", [], '');
        if ($row && (int)$row['total'] === 0) {
            $this->create('admin', 'admin123');
        }
    }

    public function findByUsername(string $username): ?array
    {
        $sql = "SELECT * FROM admin_users WHERE username = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$username], 's') ?: null;
    }

    public function create(string $username, string $password): int
    {
        // Hash con PASSWORD_DEFAULT (bcrypt)
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)";
        $this->db->execute($sql, [$username, $hashedPassword], 'ss');
        return $this->db->getLastInsertId();
    }

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
     * Cambia la contraseña del admin
     * @param int $userId
     * @param string $currentPassword
     * @param string $newPassword
     * @return bool
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
