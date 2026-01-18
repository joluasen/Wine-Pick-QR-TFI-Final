<?php
declare(strict_types=1);
// app/Controllers/ProductController.php

/**
 * Controlador de Productos
 * 
 * Gestiona la lógica de negocio para los endpoints de productos.
 * Valida solicitudes, invoca el modelo para obtener/persistir datos,
 * y construye respuestas HTTP apropiadas.
 * 
 * Endpoints implementados:
 * - GET /api/public/productos/{codigo}  - Obtener por código QR
 * - GET /api/public/productos?search=.. - Buscar productos
 * - POST /api/admin/productos           - Crear producto
 */

class ProductController {

    private \Product $productModel;
    
    /**
     * GET /api/public/promociones
     * 
     * Listar productos con promociones vigentes y activas.
     * Devuelve datos del producto + promoción formateados.
     */
    public function listActivePromotions(): void
    {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        // Validaciones básicas
        if ($limit <= 0) $limit = 10;
        if ($limit > 100) $limit = 100;
        if ($offset < 0) $offset = 0;

        // Obtener lista de productos con promos vigentes
        $rows = $this->productModel->getProductsWithActivePromotions($limit, $offset);

        // Transformar filas en respuesta con promoción embebida
        $data = array_map(function (array $row) {
            $promotion = [
                'promotion_type' => $row['promo_type'] ?? null,
                'parameter_value' => isset($row['promo_value']) ? (float)$row['promo_value'] : null,
                'visible_text' => $row['promo_text'] ?? null,
                'start_at' => $row['promo_start'] ?? null,
                'end_at' => $row['promo_end'] ?? null,
            ];

            return $this->formatProductResponse($row, [
                'promotion_type' => $promotion['promotion_type'],
                'parameter_value' => $promotion['parameter_value'],
                'visible_text' => $promotion['visible_text'],
                'start_at' => $promotion['start_at'],
                'end_at' => $promotion['end_at'],
            ]);
        }, $rows);

        ApiResponse::success([
            'count' => count($data),
            'products' => $data,
        ], 200);
    }

    /**
     * GET /api/public/mas-buscados
     * 
     * Listar los productos más buscados/consultados.
     * Se cuenta por eventos de consulta (QR y BÚSQUEDA).
     */
    public function listMostSearched(): void
    {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        // Validaciones básicas
        if ($limit <= 0) $limit = 10;
        if ($limit > 100) $limit = 100;
        if ($offset < 0) $offset = 0;

        // Obtener lista de productos más buscados
        $rows = $this->productModel->getMostSearchedProducts($limit, $offset);

        // Transformar cada resultado agregando promoción vigente (si existe)
        $data = array_map(function ($product) {
            $promotion = $this->productModel->getActivePromotion((int)$product['id']);
            return $this->formatProductResponse($product, $promotion);
        }, $rows);

        ApiResponse::success([
            'count' => count($data),
            'products' => $data,
        ], 200);
    }

    public function __construct()
    {
        try {
            $db = Database::getInstance();
            $this->productModel = new Product($db);
        } catch (\Exception $e) {
            ApiResponse::serverError(
                'Error al conectar con la base de datos.',
                ['details' => $e->getMessage()]
            );
        }
    }

    /**
     * GET /api/public/productos/{codigo}
     * 
     * Obtener un producto por su código público (QR).
     * 
     * @param string $code El código del producto.
     * 
     * @return void Devuelve JSON con el producto o error 404.
     */
    public function getByCode(string $code): void
    {
        if (empty($code)) {
            ApiResponse::validationError('El parámetro "código" es requerido.', 'code');
        }

        $product = $this->productModel->findByCode($code);

        if (!$product) {
            ApiResponse::notFound('Producto no encontrado.');
        }

        // Obtener promoción activa si existe
        $promotion = $this->productModel->getActivePromotion((int)$product['id']);

        // Transformar datos para la respuesta
        $data = $this->formatProductResponse($product, $promotion);

        ApiResponse::success($data, 200);
    }

    /**
     * GET /api/public/productos?search=texto&field=...&min_price=...&max_price=...&vintage_year=...&limit=...&offset=...
     *
     * Buscar productos por texto libre con filtros opcionales.
     *
     * Query params:
     * - search: Texto a buscar (requerido)
     * - field: Campo específico (name, drink_type, varietal, origin, public_code) (opcional)
     * - min_price: Precio mínimo (opcional)
     * - max_price: Precio máximo (opcional)
     * - vintage_year: Año de cosecha (opcional)
     * - limit: Límite de resultados (default: 20, max: 100)
     * - offset: Offset para paginación (default: 0)
     *
     * @return void Devuelve JSON con lista de productos, total y count.
     */
    public function search(): void
    {
        $searchText = trim($_GET['search'] ?? '');

        if ($searchText === '') {
            ApiResponse::validationError('El parámetro "search" es requerido y no puede estar vacío.', 'search');
        }

        // Limitar longitud de búsqueda
        $searchText = mb_substr($searchText, 0, 100);

        // Parámetros de filtrado
        $field = isset($_GET['field']) && $_GET['field'] !== '' ? $_GET['field'] : null;
        $minPrice = isset($_GET['min_price']) && $_GET['min_price'] !== '' ? (float)$_GET['min_price'] : null;
        $maxPrice = isset($_GET['max_price']) && $_GET['max_price'] !== '' ? (float)$_GET['max_price'] : null;
        $vintageYear = isset($_GET['vintage_year']) && $_GET['vintage_year'] !== '' ? (int)$_GET['vintage_year'] : null;

        // Parámetros de paginación
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        if ($limit <= 0) $limit = 20;
        if ($limit > 100) $limit = 100;
        if ($offset < 0) $offset = 0;

        // Ejecutar búsqueda con filtros
        $results = $this->productModel->search($searchText, $limit, $offset, $field, $minPrice, $maxPrice, $vintageYear);

        // Transformar cada resultado agregando promoción vigente (si existe)
        $data = array_map(function ($product) {
            $promotion = $this->productModel->getActivePromotion((int)$product['id']);
            return $this->formatProductResponse($product, $promotion);
        }, $results['products']);

        ApiResponse::success([
            'count' => count($data),
            'total' => $results['total'],
            'products' => $data,
        ], 200);
    }

    /**
     * POST /api/admin/productos
     * 
     * Crear un nuevo producto.
     * 
     * @return void Devuelve JSON con el producto creado (201) o error.
     */
    public function create(): void
    {
        // Obtener JSON del body
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if ($data === null) {
            ApiResponse::validationError('El cuerpo de la solicitud no es un JSON válido.');
        }

        // Validación básica de campos requeridos
        if (!isset($data['public_code'])) {
            ApiResponse::validationError('El campo "public_code" es requerido.', 'public_code');
        }

        if (!isset($data['name'])) {
            ApiResponse::validationError('El campo "name" es requerido.', 'name');
        }

        if (!isset($data['drink_type'])) {
            ApiResponse::validationError('El campo "drink_type" es requerido.', 'drink_type');
        }

        if (!isset($data['winery_distillery'])) {
            ApiResponse::validationError('El campo "winery_distillery" es requerido.', 'winery_distillery');
        }

        if (!isset($data['base_price'])) {
            ApiResponse::validationError('El campo "base_price" es requerido.', 'base_price');
        }

        // Validar drink_type
        if (!Product::isValidDrinkType($data['drink_type'])) {
            $validTypes = ['vino', 'espumante', 'whisky', 'gin', 'licor', 'cerveza', 'otro'];
            ApiResponse::validationError(
                'El "drink_type" no es válido. Valores aceptados: ' . implode(', ', $validTypes),
                'drink_type',
                ['valid_values' => $validTypes]
            );
        }

        // Validar base_price
        $basePrice = (float) ($data['base_price'] ?? 0);
        if ($basePrice <= 0) {
            ApiResponse::validationError('El "base_price" debe ser mayor a 0.', 'base_price');
        }

        // Validar que public_code no esté duplicado
        $existingByCode = $this->productModel->findByPublicCode($data['public_code']);
        if ($existingByCode) {
            ApiResponse::conflict(
                'Ya existe un producto con el código "' . $data['public_code'] . '".',
                'public_code'
            );
        }

        // Validar que no exista un producto idéntico (mismo nombre, bodega, tipo y año)
        $vintageYear = isset($data['vintage_year']) && $data['vintage_year'] !== ''
            ? (int)$data['vintage_year']
            : null;

        $duplicate = $this->productModel->findDuplicate(
            $data['name'],
            $data['winery_distillery'],
            $data['drink_type'],
            $vintageYear
        );

        if ($duplicate) {
            ApiResponse::conflict(
                'Ya existe un producto con el mismo nombre.',
                'name',
                [
                    'existing_product' => [
                        'id' => (int)$duplicate['id'],
                        'public_code' => $duplicate['public_code'],
                        'name' => $duplicate['name']
                    ]
                ]
            );
        }

        // Intentar crear el producto
        try {
            $adminId = (int)($_SERVER['WPQ_USER']['sub'] ?? 0);
            $productId = $this->productModel->create($data, $adminId);

            // Recuperar el producto recién creado
            $product = $this->productModel->findById($productId);

            if (!$product) {
                throw new \Exception('No se pudo recuperar el producto creado.');
            }

            $responseData = $this->formatProductResponse($product);

            ApiResponse::success($responseData, 201);
        } catch (\Exception $e) {
            // Detectar si es un error de clave duplicada
            $errorMsg = $e->getMessage();
            if (strpos($errorMsg, 'Duplicate entry') !== false) {
                ApiResponse::conflict(
                    'Ya existe un producto con este código (public_code).',
                    'public_code',
                    ['error' => $errorMsg]
                );
            }

            // Error genérico
            ApiResponse::serverError(
                'Error al crear el producto.',
                ['error' => $errorMsg]
            );
        }
    }

    /**
     * Formatear un registro de producto para la respuesta JSON.
     * 
     * @param array $product
     * 
     * @return array
     */
    private function formatProductResponse(array $product, ?array $promotion = null): array
    {
        $data = [
            'id' => (int) $product['id'],
            'public_code' => $product['public_code'],
            'name' => $product['name'],
            'drink_type' => $product['drink_type'],
            'winery_distillery' => $product['winery_distillery'],
            'varietal' => $product['varietal'] ?? null,
            'origin' => $product['origin'] ?? null,
            'vintage_year' => !empty($product['vintage_year']) ? (int) $product['vintage_year'] : null,
            'short_description' => $product['short_description'] ?? null,
            'base_price' => (float) $product['base_price'],
            'visible_stock' => !empty($product['visible_stock']) ? (int) $product['visible_stock'] : null,
            'image_url' => $product['image_url'] ?? null,
            'is_active' => (bool) $product['is_active'],
            'created_at' => $product['created_at'],
            'updated_at' => $product['updated_at'],
            'qr_link' => BASE_URL . '/#qr?code=' . rawurlencode($product['public_code']),
        ];

        // Agregar promoción si existe
        if ($promotion) {
            $data['promotion'] = [
                'type' => $promotion['promotion_type'],
                'value' => (float) $promotion['parameter_value'],
                'text' => htmlspecialchars($promotion['visible_text'] ?? '', ENT_QUOTES, 'UTF-8'),
                'start_at' => $promotion['start_at'] ?? null,
                'end_at' => $promotion['end_at'] ?? null,
            ];

            // Calcular precio final según tipo de promoción
            $base = (float) $product['base_price'];
            $final = $base;
            $type = $data['promotion']['type'];
            $val = $data['promotion']['value'];

            if ($type === 'porcentaje') {
                $final = $base * (1 - ($val / 100));
            } elseif ($type === 'precio_fijo') {
                $final = $val;
            } elseif ($type === '2x1') {
                $final = $base / 2.0;
            } elseif ($type === '3x2') {
                $final = ($base * 2.0) / 3.0;
            } elseif ($type === 'nxm') {
                // Para combos NXM, mantener precio unitario; condiciones en texto
                $final = $base;
            }

            // Asegurar no negativo/0
            if ($final <= 0) {
                $final = $base;
            }

            $data['final_price'] = (float) round($final, 2);
            $data['original_price'] = (float) $base;
        } else {
            $data['promotion'] = null;
            $data['final_price'] = (float) $product['base_price'];
            $data['original_price'] = (float) $product['base_price'];
        }

        return $data;
    }

    /**
     * POST /api/admin/productos/actualizar
     * Actualizar un producto existente.
     *
     * Body JSON:
     * - id: ID del producto (requerido)
     * - name, drink_type, winery_distillery, base_price, etc. (campos a actualizar)
     *
     * @return void Devuelve JSON con el producto actualizado (200) o error.
     */
    public function update(): void
    {
        // Obtener JSON del body
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if ($data === null) {
            ApiResponse::validationError('El cuerpo de la solicitud no es un JSON válido.');
        }

        // Validación del ID
        if (!isset($data['id'])) {
            ApiResponse::validationError('El campo "id" es requerido.', 'id');
        }

        $productId = (int)$data['id'];

        if ($productId <= 0) {
            ApiResponse::validationError('El "id" debe ser un número positivo.', 'id');
        }

        // Verificar que el producto existe
        $existingProduct = $this->productModel->findById($productId);
        if (!$existingProduct) {
            ApiResponse::notFound('Producto no encontrado.');
        }

        // Validar drink_type si está presente
        if (isset($data['drink_type']) && !Product::isValidDrinkType($data['drink_type'])) {
            $validTypes = ['vino', 'espumante', 'whisky', 'gin', 'licor', 'cerveza', 'otro'];
            ApiResponse::validationError(
                'El "drink_type" no es válido. Valores aceptados: ' . implode(', ', $validTypes),
                'drink_type',
                ['valid_values' => $validTypes]
            );
        }

        // Validar base_price si está presente
        if (isset($data['base_price'])) {
            $basePrice = (float)$data['base_price'];
            if ($basePrice <= 0) {
                ApiResponse::validationError('El "base_price" debe ser mayor a 0.', 'base_price');
            }
        }

        // Validar que public_code no esté duplicado (si se está actualizando)
        if (isset($data['public_code']) && $data['public_code'] !== $existingProduct['public_code']) {
            $existingByCode = $this->productModel->findByPublicCode($data['public_code'], $productId);
            if ($existingByCode) {
                ApiResponse::conflict(
                    'Ya existe un producto con el código "' . $data['public_code'] . '".',
                    'public_code'
                );
            }
        }

        // Validar que no exista un producto idéntico (mismo nombre, bodega, tipo y año)
        // Usar valores actualizados o existentes
        $nameToCheck = isset($data['name']) ? $data['name'] : $existingProduct['name'];
        $wineryToCheck = isset($data['winery_distillery']) ? $data['winery_distillery'] : $existingProduct['winery_distillery'];
        $drinkTypeToCheck = isset($data['drink_type']) ? $data['drink_type'] : $existingProduct['drink_type'];
        $vintageYearToCheck = isset($data['vintage_year'])
            ? ($data['vintage_year'] !== '' ? (int)$data['vintage_year'] : null)
            : (!empty($existingProduct['vintage_year']) ? (int)$existingProduct['vintage_year'] : null);

        $duplicate = $this->productModel->findDuplicate(
            $nameToCheck,
            $wineryToCheck,
            $drinkTypeToCheck,
            $vintageYearToCheck,
            $productId // Excluir el producto actual
        );

        if ($duplicate) {
            ApiResponse::conflict(
                'Ya existe un producto con el mismo nombre, bodega/destilería, tipo de bebida y año.',
                'name',
                [
                    'existing_product' => [
                        'id' => (int)$duplicate['id'],
                        'public_code' => $duplicate['public_code'],
                        'name' => $duplicate['name']
                    ]
                ]
            );
        }

        // Intentar actualizar el producto
        try {
            $adminId = (int)($_SERVER['WPQ_USER']['sub'] ?? 0);
            $this->productModel->update($productId, $data, $adminId);

            // Recuperar el producto actualizado
            $product = $this->productModel->findById($productId);

            if (!$product) {
                throw new \Exception('No se pudo recuperar el producto actualizado.');
            }

            // Obtener promoción activa si existe
            $promotion = $this->productModel->getActivePromotion($productId);
            $responseData = $this->formatProductResponse($product, $promotion);

            ApiResponse::success($responseData, 200);
        } catch (\Exception $e) {
            // Error genérico
            ApiResponse::serverError(
                'Error al actualizar el producto.',
                ['error' => $e->getMessage()]
            );
        }
    }

    /**
     * GET /api/admin/productos?limit=...&offset=...
     * Listar todos los productos para el panel de administración (paginado).
     *
     * Query params:
     * - limit: Límite de resultados (default: 20, max: 100)
     * - offset: Offset para paginación (default: 0)
     *
     * Solo para administradores autenticados.
     */
    public function listAllAdmin(): void
    {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        if ($limit <= 0) $limit = 20;
        if ($limit > 100) $limit = 100;
        if ($offset < 0) $offset = 0;

        $results = $this->productModel->getAllWithTotal($limit, $offset);
        $data = array_map(function ($product) {
            $promotion = $this->productModel->getActivePromotion((int)$product['id']);
            return $this->formatProductResponse($product, $promotion);
        }, $results['products']);

        ApiResponse::success([
            'count' => count($data),
            'total' => $results['total'],
            'products' => $data,
        ], 200);
    }

    /**
     * DELETE /api/admin/productos/{id}
     * Elimina un producto por su ID.
     * Solo para administradores autenticados.
     */
    public function delete(string $id): void
    {
        // Validar ID
        $productId = (int) $id;
        if ($productId <= 0) {
            ApiResponse::validationError('ID de producto inválido.', 'id');
        }

        // Verificar que el producto existe
        $product = $this->productModel->findById($productId);
        if (!$product) {
            ApiResponse::notFound('Producto no encontrado.');
        }

        // Ejecutar delete
        $success = $this->productModel->delete($productId);
        if (!$success) {
            ApiResponse::serverError('Error al eliminar el producto.');
        }

        ApiResponse::success([
            'message' => 'Producto eliminado correctamente',
            'id' => $productId
        ], 200);
    }
}
?>
