<?php
declare(strict_types=1);
// app/Models/Product.php

/**
 * Modelo de Producto 
 *
 * Encapsula la lógica de acceso a datos para la tabla 'products'.
 * Proporciona métodos para consultar, buscar, crear, actualizar y eliminar productos en la base de datos.
 *
 * Responsabilidades:
 * - Construcción de queries SQL
 * - Binding de parámetros preparados
 * - Transformación de resultados a arrays asociativos
 * - Validación de datos antes de inserción
 */
class Product
{
    /**
     * Devuelve el total de productos activos (para paginación de más buscados)
     * @return int
     */
    public function getMostSearchedProductsTotal(): int
    {
        $query = "SELECT COUNT(*) as total FROM products WHERE is_active = 1";
        $row = $this->db->fetchOne($query);
    return $row ? (int)$row['total'] : 0;
}

/**
 * Obtener el producto con promoción vigente más consultada.
 * Devuelve los datos del producto y la promoción vigente.
 *
 * @return array|null
 */
public function getMostConsultedPromotionProduct(): ?array
    {
        $now = date('Y-m-d H:i:s');
        $query = "
            SELECT
                p.*, pr.id as promo_id, pr.promotion_type, pr.parameter_value, pr.visible_text, pr.start_at, pr.end_at,
                COUNT(ce.id) as consult_count
            FROM products p
            INNER JOIN promotions pr ON pr.product_id = p.id
                AND pr.is_active = 1
                AND pr.start_at <= ?
                AND (pr.end_at IS NULL OR pr.end_at >= ?)
            LEFT JOIN consult_events ce ON ce.product_id = p.id
            WHERE p.is_active = 1
            GROUP BY p.id, pr.id
            ORDER BY consult_count DESC
            LIMIT 1
        ";
        $row = $this->db->fetchOne($query, [$now, $now], 'ss');
        return $row ?: null;
    }
    /**
     * Instancia de acceso a base de datos.
     * @var Database
     */
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

    public function search(string $searchText, int $limit = 20, int $offset = 0, ?string $field = null, ?float $minPrice = null, ?float $maxPrice = null, ?int $vintageYear = null, ?string $drinkType = null): array
    {
        $allowedFields = ['name', 'drink_type', 'varietal', 'origin', 'winery_distillery', 'public_code'];
        $where = '';
        $params = [];
        $types = '';

        // Si hay texto de búsqueda, aplicar condiciones de búsqueda
        if (!empty($searchText)) {
            if (!empty($field) && in_array($field, $allowedFields, true)) {
                // Precisión: beginsWith para name, exacto para public_code, contiene para otros
                if ($field === 'name') {
                    $where = "name LIKE ?";
                    $params[] = $searchText . '%'; // beginsWith
                    $types .= 's';
                } elseif ($field === 'public_code') {
                    $where = "public_code = ?";
                    $params[] = $searchText;
                    $types .= 's';
                } else {
                    $where = "{$field} LIKE ?";
                    $params[] = '%' . $searchText . '%';
                    $types .= 's';
                }
            } else {
                // Búsqueda por defecto: solo en public_code, name y drink_type
                $searchPattern = '%' . $searchText . '%';
                $where = 'public_code LIKE ? OR name LIKE ? OR drink_type LIKE ?';
                $params = array_fill(0, 3, $searchPattern);
                $types = 'sss';
            }
        } else {
            // Sin texto de búsqueda: mostrar todos (los filtros se aplican después)
            $where = '1=1';
        }

        // Filtros adicionales
        $extraWhere = '';
        if ($drinkType !== null) {
            $extraWhere .= ' AND drink_type = ?';
            $params[] = $drinkType;
            $types .= 's';
        }
        if ($minPrice !== null) {
            $extraWhere .= ' AND base_price >= ?';
            $params[] = $minPrice;
            $types .= 'd';
        }
        if ($maxPrice !== null) {
            $extraWhere .= ' AND base_price <= ?';
            $params[] = $maxPrice;
            $types .= 'd';
        }
        if ($vintageYear !== null) {
            $extraWhere .= ' AND vintage_year = ?';
            $params[] = $vintageYear;
            $types .= 'i';
        }

        // Query para resultados paginados
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
            AND ($where)
            $extraWhere
            ORDER BY name ASC
            LIMIT ? OFFSET ?
        ";
        $params[] = $limit;
        $params[] = $offset;
        $types .= 'ii';
        $products = $this->db->fetchAll($query, $params, $types);

        // Query para total
        $countExtraWhere = '';
        $countParams = [];
        $countTypes = '';

        // Misma lógica de búsqueda para el count
        if (!empty($searchText)) {
            if (!empty($field) && in_array($field, $allowedFields, true)) {
                if ($field === 'name') {
                    $countParams[] = $searchText . '%';
                    $countTypes .= 's';
                } elseif ($field === 'public_code') {
                    $countParams[] = $searchText;
                    $countTypes .= 's';
                } else {
                    $countParams[] = '%' . $searchText . '%';
                    $countTypes .= 's';
                }
            } else {
                $searchPattern = '%' . $searchText . '%';
                $countParams = array_fill(0, 3, $searchPattern);
                $countTypes = 'sss';
            }
        }
        // Si searchText está vacío, no se agregan params de búsqueda (where = '1=1')

        if ($drinkType !== null) {
            $countExtraWhere .= ' AND drink_type = ?';
            $countParams[] = $drinkType;
            $countTypes .= 's';
        }
        if ($minPrice !== null) {
            $countExtraWhere .= ' AND base_price >= ?';
            $countParams[] = $minPrice;
            $countTypes .= 'd';
        }
        if ($maxPrice !== null) {
            $countExtraWhere .= ' AND base_price <= ?';
            $countParams[] = $maxPrice;
            $countTypes .= 'd';
        }
        if ($vintageYear !== null) {
            $countExtraWhere .= ' AND vintage_year = ?';
            $countParams[] = $vintageYear;
            $countTypes .= 'i';
        }
        $countQuery = "
            SELECT COUNT(*) as total
            FROM products
            WHERE is_active = 1
            AND ($where)
            $countExtraWhere
        ";
        $row = empty($countTypes)
            ? $this->db->fetchOne($countQuery)
            : $this->db->fetchOne($countQuery, $countParams, $countTypes);
        $total = $row ? (int)$row['total'] : 0;

        return [
            'products' => $products,
            'total' => $total
        ];
    }


    /**
     * Obtener todos los productos activos con paginación y total.
     * @param int $limit
     * @param int $offset
     * @return array ['products' => [...], 'total' => int]
     */
    public function getAllWithTotal(int $limit = 20, int $offset = 0): array
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
            ORDER BY id ASC
            LIMIT ? OFFSET ?
        ";
        $products = $this->db->fetchAll($query, [$limit, $offset], 'ii');

        $countQuery = "SELECT COUNT(*) as total FROM products WHERE is_active = 1";
        $row = $this->db->fetchOne($countQuery, [], '');
        $total = $row ? (int)$row['total'] : 0;

        return [
            'products' => $products,
            'total' => $total
        ];
    }

    /**
     * Listar productos con promociones vigentes activas.
     *
     * Devuelve filas con datos del producto y campos de promoción con prefijo `promo_`.
     * Filtra únicamente por productos que tienen una promoción vigente y activa.
     * Se filtra por vigencia: start_at <= NOW() y (end_at IS NULL o end_at >= NOW()).
     *
     * @param int $limit Máximo de resultados a devolver (default: 50, max: 100).
     * @param int $offset Desplazamiento para paginación (default: 0).
     * @return array ['products' => [...], 'total' => int]
     */
    public function getProductsWithActivePromotions(int $limit = 50, int $offset = 0): array
    {
        // Validaciones básicas
        if ($limit <= 0) $limit = 50;
        if ($limit > 100) $limit = 100;
        if ($offset < 0) $offset = 0;

        $now = date('Y-m-d H:i:s');

        // Consulta principal: obtener productos con promociones vigentes
        $query = "
            SELECT
                p.id,
                p.public_code,
                p.name,
                p.drink_type,
                p.winery_distillery,
                p.varietal,
                p.origin,
                p.vintage_year,
                p.short_description,
                p.base_price,
                p.visible_stock,
                p.image_url,
                p.is_active,
                p.created_at,
                p.updated_at,
                pr.id AS promo_id,
                pr.promotion_type AS promo_type,
                pr.parameter_value AS promo_value,
                pr.visible_text AS promo_text,
                pr.start_at AS promo_start,
                pr.end_at AS promo_end
            FROM products p
            INNER JOIN promotions pr ON p.id = pr.product_id
            WHERE p.is_active = 1
              AND pr.is_active = 1
              AND pr.start_at <= ?
              AND (pr.end_at IS NULL OR pr.end_at >= ?)
            ORDER BY p.id ASC
            LIMIT ? OFFSET ?
        ";

        $products = $this->db->fetchAll($query, [$now, $now, $limit, $offset], 'ssii') ?: [];

        // Consulta para contar el total de productos con promociones vigentes
        $countQuery = "
            SELECT COUNT(DISTINCT p.id) as total
            FROM products p
            INNER JOIN promotions pr ON p.id = pr.product_id
            WHERE p.is_active = 1
              AND pr.is_active = 1
              AND pr.start_at <= ?
              AND (pr.end_at IS NULL OR pr.end_at >= ?)
        ";

        $countRow = $this->db->fetchOne($countQuery, [$now, $now], 'ss');
        $total = $countRow ? (int)$countRow['total'] : 0;

        return [
            'products' => $products,
            'total' => $total
        ];
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
        $types = 'ssssssisdissssi';

        try {
            $this->db->execute($query, $params, $types);
            return $this->db->getLastInsertId();
        } catch (\Exception $e) {
            // Aquí podríamos capturar duplicate key error para public_code
            throw $e;
        }
    }

    /**
     * Actualizar un producto existente.
     *
     * @param int $id ID del producto a actualizar.
     * @param array $data Datos del producto a actualizar.
     * @param int|null $adminId ID del admin que modifica el producto.
     *
     * @return bool True si se actualizó correctamente.
     * @throws Exception Si falta el ID o hay error en BD.
     */
    public function update(int $id, array $data, ?int $adminId = null): bool
    {
        if ($id <= 0) {
            throw new \Exception("ID de producto inválido");
        }

        // Construir dinámicamente los campos a actualizar
        $allowedFields = [
            'name', 'drink_type', 'winery_distillery', 'varietal', 'origin',
            'vintage_year', 'short_description', 'base_price', 'visible_stock',
            'image_url', 'is_active'
        ];

        $updates = [];
        $params = [];
        $types = '';

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "{$field} = ?";

                // Determinar tipo y agregar parámetro
                if ($field === 'base_price') {
                    $params[] = (float)$data[$field];
                    $types .= 'd';
                } elseif (in_array($field, ['vintage_year', 'visible_stock', 'is_active'])) {
                    $params[] = $data[$field] !== null && $data[$field] !== '' ? (int)$data[$field] : null;
                    $types .= 'i';
                } else {
                    $params[] = !empty($data[$field]) ? trim($data[$field]) : null;
                    $types .= 's';
                }
            }
        }

        if (empty($updates)) {
            throw new \Exception("No hay campos para actualizar");
        }

        // Agregar updated_at y last_modified_by_admin_id
        $updates[] = "updated_at = ?";
        $params[] = date('Y-m-d H:i:s');
        $types .= 's';

        $updates[] = "last_modified_by_admin_id = ?";
        $params[] = $adminId;
        $types .= 'i';

        // Agregar ID al final
        $params[] = $id;
        $types .= 'i';

        $query = "
            UPDATE products
            SET " . implode(', ', $updates) . "
            WHERE id = ?
        ";

        try {
            $this->db->execute($query, $params, $types);
            return true;
        } catch (\Exception $e) {
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

    /**
     * Obtener los productos más buscados (consultados).
     * 
     * Agrupa por product_id y cuenta los eventos de consulta (QR y BÚSQUEDA).
     * Retorna los datos del producto junto con su contador de consultas.
     * 
     * @param int $limit Número máximo de productos a retornar.
     * @param int $offset Offset para paginación.
     * 
     * @return array Lista de productos más buscados.
     */
    public function getMostSearchedProducts(int $limit = 10, int $offset = 0): array
    {
        $query = "
            SELECT
                p.id,
                p.public_code,
                p.name,
                p.drink_type,
                p.winery_distillery,
                p.varietal,
                p.origin,
                p.vintage_year,
                p.short_description,
                p.base_price,
                p.visible_stock,
                p.image_url,
                p.is_active,
                p.created_at,
                p.updated_at,
                COUNT(ce.id) as search_count
            FROM products p
            LEFT JOIN consult_events ce ON p.id = ce.product_id
            WHERE p.is_active = 1
            GROUP BY p.id
            ORDER BY search_count DESC, p.name ASC
            LIMIT ? OFFSET ?
        ";

        return $this->db->fetchAll($query, [$limit, $offset], 'ii');
    }

    /**
     * Buscar un producto por su public_code.
     *
     * @param string $publicCode Código público del producto.
     * @param int|null $excludeId ID de producto a excluir (para edición).
     *
     * @return array|null Datos del producto o null si no existe.
     */
    public function findByPublicCode(string $publicCode, ?int $excludeId = null): ?array
    {
        $query = "
            SELECT id, public_code, name
            FROM products
            WHERE public_code = ?
        ";
        $params = [$publicCode];
        $types = 's';

        if ($excludeId !== null) {
            $query .= " AND id != ?";
            $params[] = $excludeId;
            $types .= 'i';
        }

        $query .= " LIMIT 1";

        return $this->db->fetchOne($query, $params, $types);
    }

    /**
     * Buscar producto duplicado por atributos clave.
     *
     * Un producto se considera duplicado si tiene el mismo:
     * - name
     * - winery_distillery
     * - drink_type
     * - vintage_year (si ambos tienen año, deben coincidir; si alguno es NULL, se ignora)
     *
     * @param string $name Nombre del producto.
     * @param string $wineryDistillery Bodega o destilería.
     * @param string $drinkType Tipo de bebida.
     * @param int|null $vintageYear Año de cosecha.
     * @param int|null $excludeId ID de producto a excluir (para edición).
     *
     * @return array|null Datos del producto duplicado o null si no existe.
     */
    public function findDuplicate(
        string $name,
        string $wineryDistillery,
        string $drinkType,
        ?int $vintageYear = null,
        ?int $excludeId = null
    ): ?array {
        $query = "
            SELECT id, public_code, name, winery_distillery, drink_type, vintage_year
            FROM products
            WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
            AND LOWER(TRIM(winery_distillery)) = LOWER(TRIM(?))
            AND LOWER(TRIM(drink_type)) = LOWER(TRIM(?))
        ";
        $params = [$name, $wineryDistillery, $drinkType];
        $types = 'sss';

        // Manejar vintage_year: solo comparar si el nuevo producto tiene año
        // Si el nuevo tiene año, buscar coincidencia exacta O productos sin año
        // Si el nuevo no tiene año, buscar cualquier producto (con o sin año)
        if ($vintageYear !== null) {
            $query .= " AND (vintage_year = ? OR vintage_year IS NULL)";
            $params[] = $vintageYear;
            $types .= 'i';
        }
        // Si vintageYear es null, no agregamos condición de año (coincide con cualquiera)

        if ($excludeId !== null) {
            $query .= " AND id != ?";
            $params[] = $excludeId;
            $types .= 'i';
        }

        $query .= " LIMIT 1";

        return $this->db->fetchOne($query, $params, $types);
    }

    /**
     * Eliminar un producto por su ID.
     *
     * @param int $id ID del producto
     * @return bool True si se eliminó correctamente, false en caso contrario
     */
    public function delete(int $id): bool
    {
        $query = 'DELETE FROM products WHERE id = ? LIMIT 1';
        $stmt = $this->db->getConnection()->prepare($query);
        
        if (!$stmt) {
            return false;
        }

        $stmt->bind_param('i', $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }
}
?>
