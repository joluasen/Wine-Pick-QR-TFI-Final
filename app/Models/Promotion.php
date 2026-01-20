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
            SELECT p.*, pr.name AS product_name, pr.base_price AS product_price
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
            ORDER BY id ASC
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

        $this->db->execute($sql, [$type, $value, $text, $startAt, $endAt, $id], 'sdsssi');
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
     * Eliminar una promoción permanentemente.
     */
    public function delete(int $id): bool
    {
        $sql = "DELETE FROM promotions WHERE id = ?";
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

    /**
     * Verificar si existe una promoción activa que se solape con el rango de fechas dado.
     * RF12: Un producto no puede tener más de una promoción vigente al mismo tiempo.
     *
     * @param int $productId ID del producto
     * @param string $startAt Fecha de inicio de la nueva promoción
     * @param string|null $endAt Fecha de fin de la nueva promoción (null = sin fin)
     * @param int|null $excludeId ID de promoción a excluir (para edición)
     * @return array|null Retorna la promoción existente que se solapa, o null si no hay conflicto
     */
    public function findOverlappingPromotion(int $productId, string $startAt, ?string $endAt, ?int $excludeId = null): ?array
    {
        // Lógica de solapamiento:
        // Dos rangos [A_start, A_end] y [B_start, B_end] se solapan si:
        // A_start <= B_end AND B_start <= A_end
        // Considerando que end puede ser NULL (sin fin), tratamos NULL como infinito futuro.

        $sql = "
            SELECT id, promotion_type, visible_text, start_at, end_at
            FROM promotions
            WHERE product_id = ?
            AND is_active = 1
            AND (
                -- La nueva promoción empieza antes de que termine la existente
                ? <= COALESCE(end_at, '9999-12-31 23:59:59')
                AND
                -- La existente empieza antes de que termine la nueva
                start_at <= COALESCE(?, '9999-12-31 23:59:59')
            )
        ";

        $params = [$productId, $startAt, $endAt];
        $types = 'iss';

        // Excluir una promoción específica (útil para edición)
        if ($excludeId !== null) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
            $types .= 'i';
        }

        $sql .= " LIMIT 1";

        return $this->db->fetchOne($sql, $params, $types);
    }
}
?>