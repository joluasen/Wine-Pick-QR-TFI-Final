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
        return $this->db->insert($sql, [$username, $hashedPassword], 'ss');
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
}
?>
