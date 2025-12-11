<?php
// app/Models/Promotion.php
declare(strict_types=1);

/**
 * Modelo de Promoción (Data Access Layer)
 * 
 * Encapsula la lógica de acceso a datos para la tabla 'promotions'.
 * Proporciona métodos para crear, obtener y listar promociones.
 */
class Promotion
{
    private \Database $db;

    public function __construct(Database $database)
    {
        $this->db = $database;
    }

    /**
     * Crear una nueva promoción.
     * 
     * @param int $productId ID del producto.
     * @param string $type Tipo de promoción (porcentaje, precio_fijo, etc).
     * @param float $value Valor de la promoción.
     * @param string $text Texto visible de la promoción.
     * @param string $startAt Fecha de inicio (Y-m-d H:i:s).
     * @param string|null $endAt Fecha de fin (Y-m-d H:i:s) o null para abierto.
     * @param int $adminId ID del admin que creó.
     * 
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

        // Tipos: i=int, s=string, d=double
        // Orden: product_id(i), promotion_type(s), parameter_value(d), visible_text(s), start_at(s), end_at(s), created_by_admin_id(i)
        $types = 'isdsssi';

        $this->db->execute($sql, $params, $types);
        return $this->db->getLastInsertId();
    }

    /**
     * Obtener todas las promociones de un producto.
     * 
     * @param int $productId ID del producto.
     * 
     * @return array Lista de promociones.
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
     * 
     * @param int $productId ID del producto.
     * 
     * @return array|null Promoción activa o null.
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
     * 
     * @param int $id ID de la promoción.
     * @param string $type Tipo.
     * @param float $value Valor.
     * @param string $text Texto visible.
     * @param string $startAt Inicio.
     * @param string|null $endAt Fin.
     * 
     * @return bool Éxito.
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
     * 
     * @param int $id ID de la promoción.
     * 
     * @return bool Éxito.
     */
    public function deactivate(int $id): bool
    {
        $sql = "UPDATE promotions SET is_active = 0, updated_at = NOW() WHERE id = ?";
        $this->db->execute($sql, [$id], 'i');
        return true;
    }

    /**
     * Obtener promoción por ID.
     * 
     * @param int $id ID de la promoción.
     * 
     * @return array|null Datos de la promoción.
     */
    public function findById(int $id): ?array
    {
        $sql = "SELECT * FROM promotions WHERE id = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$id], 'i');
    }
}
?>
