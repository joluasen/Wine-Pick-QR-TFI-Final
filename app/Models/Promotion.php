<?php
declare(strict_types=1);
// app/Models/Promotion.php

class Promotion
{
    private \Database $db;

    public function __construct(Database $database)
    {
        $this->db = $database;
    }

    /**
     * Listar todas las promociones con datos de producto (paginado).
     *
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function findAllWithProduct(int $limit = 10, int $offset = 0): array
    {
        $sql = "
            SELECT p.*, pr.name AS product_name
            FROM promotions p
            JOIN products pr ON p.product_id = pr.id
            ORDER BY p.id ASC
            LIMIT ? OFFSET ?
        ";
        return $this->db->fetchAll($sql, [$limit, $offset], 'ii') ?: [];
    }

    /**
     * Contar todas las promociones.
     *
     * @return int
     */
    public function countAll(): int
    {
        $sql = "SELECT COUNT(*) as total FROM promotions";
        $row = $this->db->fetchOne($sql);
        return $row ? (int)$row['total'] : 0;
    }

    /**
     * Crear una nueva promoción.
     */
    public function create(
        int $productId,
        string $type,
        float $value,
        string $text,
        string $startAt,
        ?string $endAt,
        int $adminId
    ): int {
        $sql = "
            INSERT INTO promotions 
            (product_id, promotion_type, parameter_value, visible_text, start_at, end_at, is_active, created_by_admin_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())
        ";

        $params = [
            $productId,
            $type,
            $value,
            $text,
            $startAt,
            $endAt,
            $adminId,
        ];

        $types = 'isdsssi';

        $this->db->execute($sql, $params, $types);
        return $this->db->getLastInsertId();
    }

    /**
     * Obtener todas las promociones de un producto.
     */
    public function findByProductId(int $productId): array
    {
        $sql = "
            SELECT *
            FROM promotions
            WHERE product_id = ?
            ORDER BY created_at DESC
        ";

        return $this->db->fetchAll($sql, [$productId], 'i') ?: [];
    }

    /**
     * Obtener promoción activa vigente de un producto.
     */
    public function getActiveByProductId(int $productId): ?array
    {
        $now = date('Y-m-d H:i:s');
        
        $sql = "
            SELECT *
            FROM promotions
            WHERE product_id = ?
            AND is_active = 1
            AND start_at <= ?
            AND (end_at IS NULL OR end_at >= ?)
            ORDER BY start_at DESC
            LIMIT 1
        ";

        return $this->db->fetchOne($sql, [$productId, $now, $now], 'iss');
    }

    /**
     * Actualizar una promoción.
     */
    public function update(
        int $id,
        string $type,
        float $value,
        string $text,
        string $startAt,
        ?string $endAt
    ): bool {
        $sql = "
            UPDATE promotions
            SET promotion_type = ?, parameter_value = ?, visible_text = ?, start_at = ?, end_at = ?, updated_at = NOW()
            WHERE id = ?
        ";

        $this->db->execute($sql, [$type, $value, $text, $startAt, $endAt, $id], 'sdssi');
        return true;
    }

    /**
     * Desactivar una promoción.
     */
    public function deactivate(int $id): bool
    {
        $sql = "UPDATE promotions SET is_active = 0, updated_at = NOW() WHERE id = ?";
        $this->db->execute($sql, [$id], 'i');
        return true;
    }

    /**
     * Obtener promoción por ID.
     */
    public function findById(int $id): ?array
    {
        $sql = "SELECT * FROM promotions WHERE id = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$id], 'i');
    }
}
?>