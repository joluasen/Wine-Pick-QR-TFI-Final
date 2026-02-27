<?php
declare(strict_types=1);
// Controlador para la gestión de productos.
// Implementa la lógica de negocio y validaciones para los endpoints de productos.

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

    // Modelo de productos para operaciones de base de datos.
    private \Product $productModel;

    // Inicializa el controlador y el modelo de productos.
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
     * Devuelve el producto con promoción vigente más consultada.
     * Endpoint: GET /api/public/promocion-mas-consultada
     */
    public function mostConsultedPromotionProduct(): void
    {
        $row = $this->productModel->getMostConsultedPromotionProduct();
        if (!$row) {
            ApiResponse::notFound('No se encontró ningún producto con promoción vigente.');
        }
        // Formatea la respuesta para incluir datos de promoción.
        $promotion = [
            'promotion_type' => $row['promotion_type'],
            'parameter_value' => $row['parameter_value'],
            'visible_text' => $row['visible_text'],
            'start_at' => $row['start_at'],
            'end_at' => $row['end_at'],
            'consult_count' => (int) $row['consult_count'],
        ];
        $data = $this->formatProductResponse($row, $promotion);
        ApiResponse::success($data, 200);
    }

    /**
     * Lista productos con promociones vigentes y activas.
     * Endpoint: GET /api/public/promociones
     */
    public function listActivePromotions(): void
    {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        // Validaciones de paginación
        if ($limit <= 0) $limit = 10;
        if ($limit > 100) $limit = 100;
        if ($offset < 0) $offset = 0;

        // Obtiene productos con promociones activas
        $result = $this->productModel->getProductsWithActivePromotions($limit, $offset);
        $rows = $result['products'] ?? [];
        $total = $result['total'] ?? 0;

        // Formatea cada producto con su promoción
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
            'total' => $total,
            'products' => $data,
        ], 200);
    }

    /**
     * Lista los productos más buscados/consultados.
     * Endpoint: GET /api/public/mas-buscados
     */
    public function listMostSearched(): void
    {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        // Validaciones de paginación
        if ($limit <= 0) $limit = 10;
        if ($limit > 100) $limit = 100;
        if ($offset < 0) $offset = 0;

        // Obtiene productos más buscados
        $rows = $this->productModel->getMostSearchedProducts($limit, $offset);
        $total = $this->productModel->getMostSearchedProductsTotal();

        // Formatea cada producto con su promoción activa
        $data = array_map(function ($product) {
            $promotion = $this->productModel->getActivePromotion((int)$product['id']);
            return $this->formatProductResponse($product, $promotion);
        }, $rows);

        ApiResponse::success([
            'count' => count($data),
            'total' => $total,
            'products' => $data,
        ], 200);
    }

    /**
     * Obtiene un producto por su código público (QR).
     * Endpoint: GET /api/public/productos/{codigo}
     * @param string $code Código del producto.
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

        // Obtiene promoción activa si existe
        $promotion = $this->productModel->getActivePromotion((int)$product['id']);

        // Formatea datos para la respuesta
        $data = $this->formatProductResponse($product, $promotion);

        ApiResponse::success($data, 200);
    }

    /**
     * Busca productos por texto libre con filtros opcionales.
     * Endpoint: GET /api/public/productos?search=texto&...
     */
    public function search(): void
    {
        $searchText = trim($_GET['search'] ?? '');

        // Limita longitud de búsqueda (permite vacío para filtros sin término)
        $searchText = mb_substr($searchText, 0, 100);

        // Parámetros de filtrado
        $field = isset($_GET['field']) && $_GET['field'] !== '' ? $_GET['field'] : null;
        $drinkType = isset($_GET['drink_type']) && $_GET['drink_type'] !== '' ? $_GET['drink_type'] : null;
        $minPrice = isset($_GET['min_price']) && $_GET['min_price'] !== '' ? (float)$_GET['min_price'] : null;
        $maxPrice = isset($_GET['max_price']) && $_GET['max_price'] !== '' ? (float)$_GET['max_price'] : null;
        $vintageYear = isset($_GET['vintage_year']) && $_GET['vintage_year'] !== '' ? (int)$_GET['vintage_year'] : null;

        // Parámetros de paginación
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        if ($limit <= 0) $limit = 20;
        if ($limit > 100) $limit = 100;
        if ($offset < 0) $offset = 0;

        // Ejecuta búsqueda con filtros
        $results = $this->productModel->search($searchText, $limit, $offset, $field, $minPrice, $maxPrice, $vintageYear, $drinkType);

        // Formatea cada producto con su promoción activa
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
     * Crea un nuevo producto.
     * Endpoint: POST /api/admin/productos
     */
    public function create(): void
    {
        // Obtiene JSON del body
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if ($data === null) {
            ApiResponse::validationError('El cuerpo de la solicitud no es un JSON válido.');
        }

        // Validaciones de campos requeridos
        if (!isset($data['public_code'])) {
            ApiResponse::validationError('El campo \"public_code\" es requerido.', 'public_code');
        }
        if (!isset($data['name'])) {
            ApiResponse::validationError('El campo \"name\" es requerido.', 'name');
        }
        if (!isset($data['drink_type'])) {
            ApiResponse::validationError('El campo \"drink_type\" es requerido.', 'drink_type');
        }
        if (!isset($data['winery_distillery'])) {
            ApiResponse::validationError('El campo \"winery_distillery\" es requerido.', 'winery_distillery');
        }
        if (!isset($data['base_price'])) {
            ApiResponse::validationError('El campo \"base_price\" es requerido.', 'base_price');
        }

        // Validación de tipo de bebida
        if (!Product::isValidDrinkType($data['drink_type'])) {
            $validTypes = ['vino', 'espumante', 'whisky', 'gin', 'licor', 'cerveza', 'otro'];
            ApiResponse::validationError(
                'El \"drink_type\" no es válido. Valores aceptados: ' . implode(', ', $validTypes),
                'drink_type',
                ['valid_values' => $validTypes]
            );
        }

        // Validación de precio base
        $basePrice = (float) ($data['base_price'] ?? 0);
        if ($basePrice <= 0) {
            ApiResponse::validationError('El \"base_price\" debe ser mayor a 0.', 'base_price');
        }

        // Validación de imagen si está presente
        if (isset($data['image_url']) && !empty($data['image_url'])) {
            $imageUrl = $data['image_url'];
            if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                ApiResponse::validationError(
                    'La URL de la imagen no es válida.',
                    'image_url',
                    ['provided_url' => $imageUrl]
                );
            }
            if (strpos($imageUrl, BASE_URL) !== 0) {
                ApiResponse::validationError(
                    'La imagen debe estar alojada en el servidor.',
                    'image_url',
                    ['expected_base_url' => BASE_URL]
                );
            }
        }

        // Validación de código público duplicado
        $existingByCode = $this->productModel->findByPublicCode($data['public_code']);
        if ($existingByCode) {
            ApiResponse::conflict(
                'Ya existe un producto con el código \"' . $data['public_code'] . '\".',
                'public_code'
            );
        }

        // Validación de producto duplicado (nombre, bodega, tipo y año)
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

        // Intenta crear el producto
        try {
            $adminId = (int)($_SERVER['WPQ_USER']['sub'] ?? 0);
            $productId = $this->productModel->create($data, $adminId);

            // Recupera el producto recién creado
            $product = $this->productModel->findById($productId);

            if (!$product) {
                throw new \Exception('No se pudo recuperar el producto creado.');
            }

            $responseData = $this->formatProductResponse($product);

            ApiResponse::success($responseData, 201);
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
            if (strpos($errorMsg, 'Duplicate entry') !== false) {
                ApiResponse::conflict(
                    'Ya existe un producto con este código (public_code).',
                    'public_code',
                    ['error' => $errorMsg]
                );
            }
            ApiResponse::serverError(
                'Error al crear el producto.',
                ['error' => $errorMsg]
            );
        }
    }

    /**
     * Formatea un registro de producto para la respuesta JSON.
     * @param array $product
     * @param array|null $promotion
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

        // Agrega promoción si existe
        if ($promotion) {
            $data['promotion'] = [
                'type' => $promotion['promotion_type'],
                'value' => (float) $promotion['parameter_value'],
                'text' => htmlspecialchars($promotion['visible_text'] ?? '', ENT_QUOTES, 'UTF-8'),
                'start_at' => $promotion['start_at'] ?? null,
                'end_at' => $promotion['end_at'] ?? null,
            ];

            // Calcula precio final según tipo de promoción
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
                $final = $base;
            }

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
     * Actualiza un producto existente.
     * Endpoint: POST /api/admin/productos/actualizar
     */
    public function update(): void
    {
        // Obtiene JSON del body
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if ($data === null) {
            ApiResponse::validationError('El cuerpo de la solicitud no es un JSON válido.');
        }

        // Validación del ID
        if (!isset($data['id'])) {
            ApiResponse::validationError('El campo \"id\" es requerido.', 'id');
        }

        $productId = (int)$data['id'];

        if ($productId <= 0) {
            ApiResponse::validationError('El \"id\" debe ser un número positivo.', 'id');
        }

        // Verifica que el producto existe
        $existingProduct = $this->productModel->findById($productId);
        if (!$existingProduct) {
            ApiResponse::notFound('Producto no encontrado.');
        }

        // Validación de tipo de bebida si está presente
        if (isset($data['drink_type']) && !Product::isValidDrinkType($data['drink_type'])) {
            $validTypes = ['vino', 'espumante', 'whisky', 'gin', 'licor', 'cerveza', 'otro'];
            ApiResponse::validationError(
                'El \"drink_type\" no es válido. Valores aceptados: ' . implode(', ', $validTypes),
                'drink_type',
                ['valid_values' => $validTypes]
            );
        }

        // Validación de precio base si está presente
        if (isset($data['base_price'])) {
            $basePrice = (float)$data['base_price'];
            if ($basePrice <= 0) {
                ApiResponse::validationError('El \"base_price\" debe ser mayor a 0.', 'base_price');
            }
        }

        // Validación de imagen si está presente
        if (isset($data['image_url']) && !empty($data['image_url'])) {
            $imageUrl = $data['image_url'];
            if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                ApiResponse::validationError(
                    'La URL de la imagen no es válida.',
                    'image_url',
                    ['provided_url' => $imageUrl]
                );
            }
            if (strpos($imageUrl, BASE_URL) !== 0) {
                ApiResponse::validationError(
                    'La imagen debe estar alojada en el servidor.',
                    'image_url',
                    ['expected_base_url' => BASE_URL]
                );
            }
        }

        // Validación de código público duplicado si se actualiza
        if (isset($data['public_code']) && $data['public_code'] !== $existingProduct['public_code']) {
            $existingByCode = $this->productModel->findByPublicCode($data['public_code'], $productId);
            if ($existingByCode) {
                ApiResponse::conflict(
                    'Ya existe un producto con el código \"' . $data['public_code'] . '\".',
                    'public_code'
                );
            }
        }

        // Validación de producto duplicado (nombre, bodega, tipo y año)
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
            $productId // Excluye el producto actual
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

        // Intenta actualizar el producto
        try {
            // Si se solicita eliminar la imagen anterior
            if (isset($data['delete_old_image']) && $data['delete_old_image'] && isset($data['old_image_url'])) {
                UploadController::deleteProductImage($data['old_image_url']);
                // Remover estos campos del payload para no enviarlos al modelo
                unset($data['delete_old_image']);
                unset($data['old_image_url']);
            }

            $adminId = (int)($_SERVER['WPQ_USER']['sub'] ?? 0);
            $this->productModel->update($productId, $data, $adminId);

            // Recupera el producto actualizado
            $product = $this->productModel->findById($productId);

            if (!$product) {
                throw new \Exception('No se pudo recuperar el producto actualizado.');
            }

            // Obtiene promoción activa si existe
            $promotion = $this->productModel->getActivePromotion($productId);
            $responseData = $this->formatProductResponse($product, $promotion);

            ApiResponse::success($responseData, 200);
        } catch (\Exception $e) {
            ApiResponse::serverError(
                'Error al actualizar el producto.',
                ['error' => $e->getMessage()]
            );
        }
    }

    /**
     * Lista todos los productos para el panel de administración (paginado).
     * Endpoint: GET /api/admin/productos?limit=...&offset=...
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
     * Elimina un producto por su ID.
     * Endpoint: DELETE /api/admin/productos/{id}
     */
    public function delete(string $id): void
    {
        $productId = (int) $id;
        if ($productId <= 0) {
            ApiResponse::validationError('ID de producto inválido.', 'id');
        }

        $product = $this->productModel->findById($productId);
        if (!$product) {
            ApiResponse::notFound('Producto no encontrado.');
        }

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