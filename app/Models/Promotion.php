<?php
declare(strict_types=1);
// app/Models/Promotion.php

/**
 * Modelo de Promoción
 * 
 * Encapsula la lógica de acceso a datos para la tabla 'promotions'.
 * Permite crear, consultar, actualizar, desactivar y eliminar promociones,
 * así como validar solapamientos y obtener promociones activas.
 * 
 * Responsabilidades:
 * - Construcción de queries SQL
 * - Binding de parámetros preparados
 * - Transformación de resultados a arrays asociativos
 * - Validación de solapamiento de fechas
 */
class Promotion
{

    /**
     * Instancia de acceso a base de datos.
     * @var Database
     */
    private \Database $db;


    /**
     * Constructor del modelo Promotion.
     * @param Database $database Instancia de base de datos inyectada.
     */
    public function __construct(Database $database)
    {
        $this->db = $database;
    }

    /**
     * Listar todas las promociones con datos de producto (paginado).
     * Devuelve promociones junto con nombre y precio del producto asociado.
     *
     * @param int $limit  Límite de resultados.
     * @param int $offset Desplazamiento para paginación.
     * @return array Lista de promociones con datos de producto.
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
     * Contar todas las promociones existentes en la base de datos.
     *
     * @return int Total de promociones.
     */
    public function countAll(): int
    {
        $sql = "SELECT COUNT(*) as total FROM promotions";
        $row = $this->db->fetchOne($sql);
        return $row ? (int)$row['total'] : 0;
    }

    /**
     * Crear una nueva promoción.
     *
     * @param int $productId ID del producto asociado.
     * @param string $type Tipo de promoción.
     * @param float $value Valor del parámetro de la promoción.
     * @param string $text Texto visible de la promoción.
     * @param string $startAt Fecha/hora de inicio (Y-m-d H:i:s).
     * @param string|null $endAt Fecha/hora de fin (o null si es indefinida).
     * @param int $adminId ID del admin que crea la promoción.
     * @return int ID de la promoción creada.
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
     *
     * @param int $productId ID del producto.
     * @return array Lista de promociones asociadas al producto.
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
     *
     * @param int $productId ID del producto.
     * @return array|null Datos de la promoción activa o null si no hay.
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
     * Actualizar una promoción existente.
     *
     * @param int $id ID de la promoción a actualizar.
     * @param string $type Tipo de promoción.
     * @param float $value Valor del parámetro de la promoción.
     * @param string $text Texto visible de la promoción.
     * @param string $startAt Fecha/hora de inicio (Y-m-d H:i:s).
     * @param string|null $endAt Fecha/hora de fin (o null si es indefinida).
     * @return bool True si se actualizó correctamente.
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
     * Desactivar una promoción (soft delete).
     *
     * @param int $id ID de la promoción a desactivar.
     * @return bool True si se desactivó correctamente.
     */
    public function deactivate(int $id): bool
    {
        $sql = "UPDATE promotions SET is_active = 0, updated_at = NOW() WHERE id = ?";
        $this->db->execute($sql, [$id], 'i');
        return true;
    }

    /**
     * Eliminar una promoción permanentemente (borrado físico).
     *
     * @param int $id ID de la promoción a eliminar.
     * @return bool True si se eliminó correctamente.
     */
    public function delete(int $id): bool
    {
        $sql = "DELETE FROM promotions WHERE id = ?";
        $this->db->execute($sql, [$id], 'i');
        return true;
    }

    /**
     * Obtener promoción por ID.
     *
     * @param int $id ID de la promoción.
     * @return array|null Datos de la promoción o null si no existe.
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
     * Dos rangos [A_start, A_end] y [B_start, B_end] se solapan si:
     *   A_start <= B_end AND B_start <= A_end
     * Considerando que end puede ser NULL (sin fin), se trata como infinito futuro.
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