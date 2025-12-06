<?php
// app/Models/Product.php
declare(strict_types=1);

/**
 * Modelo de Producto (Data Access Layer)
 * 
 * Encapsula toda la lógica de acceso a datos para la tabla 'products'.
 * Proporciona métodos para consultar, buscar y crear productos en la base de datos.
 * 
 * Responsabilidades:
 * - Construcción de queries SQL
 * - Binding de parámetros preparados
 * - Transformación de resultados a arrays asociativos
 * - Validación de datos antes de inserción
 */
class Product
{
    private \Database $db;

    public function __construct(Database $database)
    {
        $this->db = $database;
    }

    /**
     * Buscar un producto por código público.
     * 
     * @param string $code El código público del producto.
     * 
     * @return array|null Datos del producto o null si no existe.
     */
    public function findByCode(string $code): ?array
    {
        $query = "
            SELECT
                id,
                public_code,
                name,
                drink_type,
                winery_distillery,
                varietal,
                origin,
                vintage_year,
                short_description,
                base_price,
                visible_stock,
                image_url,
                is_active,
                created_at,
                updated_at
            FROM products
            WHERE public_code = ? AND is_active = 1
            LIMIT 1
        ";

        return $this->db->fetchOne($query, [$code], 's');
    }

    /**
     * Buscar productos por texto (en nombre, descripción, varietal, origen, etc.).
     * 
     * @param string $searchText Texto a buscar.
     * @param int $limit Número máximo de resultados.
     * 
     * @return array Lista de productos coincidentes.
     */
    public function search(string $searchText, int $limit = 20): array
    {
        $searchPattern = '%' . $searchText . '%';

        $query = "
            SELECT
                id,
                public_code,
                name,
                drink_type,
                winery_distillery,
                varietal,
                origin,
                vintage_year,
                short_description,
                base_price,
                visible_stock,
                image_url,
                is_active,
                created_at,
                updated_at
            FROM products
            WHERE is_active = 1
            AND (
                name LIKE ?
                OR short_description LIKE ?
                OR winery_distillery LIKE ?
                OR varietal LIKE ?
                OR origin LIKE ?
            )
            ORDER BY name ASC
            LIMIT ?
        ";

        // Preparar parámetros: 4 LIKE (strings) + 1 LIMIT (int)
        $params = [$searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $limit];
        $types = 'sssssi';

        return $this->db->fetchAll($query, $params, $types);
    }

    /**
     * Obtener todos los productos activos (para futuro listado general).
     * 
     * @param int $limit
     * @param int $offset
     * 
     * @return array
     */
    public function getAll(int $limit = 20, int $offset = 0): array
    {
        $query = "
            SELECT
                id,
                public_code,
                name,
                drink_type,
                winery_distillery,
                varietal,
                origin,
                vintage_year,
                short_description,
                base_price,
                visible_stock,
                image_url,
                is_active,
                created_at,
                updated_at
            FROM products
            WHERE is_active = 1
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ";

        return $this->db->fetchAll($query, [$limit, $offset], 'ii');
    }

    /**
     * Crear un nuevo producto.
     * 
     * @param array $data Datos del producto (public_code, name, drink_type, winery_distillery, base_price, etc.)
     * @param int|null $adminId ID del admin que crea el producto.
     * 
     * @return int ID del producto creado.
     * @throws Exception Si falta datos requeridos o hay error en BD.
     */
    public function create(array $data, ?int $adminId = null): int
    {
        // Validar campos requeridos
        $required = ['public_code', 'name', 'drink_type', 'winery_distillery', 'base_price'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                throw new \Exception("Campo requerido faltante: {$field}");
            }
        }

        // Asignar valores por defecto para campos opcionales
        $publicCode = trim($data['public_code']);
        $name = trim($data['name']);
        $drinkType = trim($data['drink_type']);
        $wineryDistillery = trim($data['winery_distillery']);
        $varietal = !empty($data['varietal']) ? trim($data['varietal']) : null;
        $origin = !empty($data['origin']) ? trim($data['origin']) : null;
        $vintageYear = !empty($data['vintage_year']) ? (int)$data['vintage_year'] : null;
        $shortDescription = !empty($data['short_description']) ? trim($data['short_description']) : null;
        $basePrice = (float) $data['base_price'];
        $visibleStock = !empty($data['visible_stock']) ? (int)$data['visible_stock'] : null;
        $imageUrl = !empty($data['image_url']) ? trim($data['image_url']) : null;
        $isActive = !empty($data['is_active']) ? (int)$data['is_active'] : 1;

        $now = date('Y-m-d H:i:s');

        $query = "
            INSERT INTO products (
                public_code,
                name,
                drink_type,
                winery_distillery,
                varietal,
                origin,
                vintage_year,
                short_description,
                base_price,
                visible_stock,
                image_url,
                is_active,
                created_at,
                updated_at,
                last_modified_by_admin_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        $params = [
            $publicCode,
            $name,
            $drinkType,
            $wineryDistillery,
            $varietal,
            $origin,
            $vintageYear,
            $shortDescription,
            $basePrice,
            $visibleStock,
            $imageUrl,
            $isActive,
            $now,
            $now,
            $adminId,
        ];

        // Tipos: s=string, i=int, d=double
        // Orden: public_code(s), name(s), drink_type(s), winery_distillery(s),
        //        varietal(s), origin(s), vintage_year(i), short_description(s),
        //        base_price(d), visible_stock(i), image_url(s), is_active(i),
        //        created_at(s), updated_at(s), last_modified_by_admin_id(i)
        $types = 'ssssssissdisssi';

        try {
            $this->db->execute($query, $params, $types);
            return $this->db->getLastInsertId();
        } catch (\Exception $e) {
            // Aquí podríamos capturar duplicate key error para public_code
            throw $e;
        }
    }

    /**
     * Validar que drink_type sea válido.
     * 
     * @param string $type
     * 
     * @return bool
     */
    public static function isValidDrinkType(string $type): bool
    {
        $valid = ['vino', 'espumante', 'whisky', 'gin', 'licor', 'cerveza', 'otro'];
        return in_array(strtolower($type), $valid, true);
    }

    /**
     * Obtener un producto por ID (para uso interno).
     * 
     * @param int $id
     * 
     * @return array|null
     */
    public function findById(int $id): ?array
    {
        $query = "
            SELECT *
            FROM products
            WHERE id = ? AND is_active = 1
            LIMIT 1
        ";

        return $this->db->fetchOne($query, [$id], 'i');
    }

    /**
     * Obtener promoción activa de un producto.
     * 
     * @param int $productId ID del producto.
     * 
     * @return array|null Datos de la promoción activa o null si no hay.
     */
    public function getActivePromotion(int $productId): ?array
    {
        $now = date('Y-m-d H:i:s');
        
        $query = "
            SELECT
                id,
                promotion_type,
                parameter_value,
                visible_text,
                start_at,
                end_at
            FROM promotions
            WHERE product_id = ?
            AND is_active = 1
            AND start_at <= ?
            AND (end_at IS NULL OR end_at >= ?)
            ORDER BY start_at DESC
            LIMIT 1
        ";

        return $this->db->fetchOne($query, [$productId, $now, $now], 'iss');
    }
}
?>
