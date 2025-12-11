<?php
// app/Controllers/ProductController.php
declare(strict_types=1);

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
class ProductController
{
    private \Product $productModel;

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
     * GET /api/public/productos?search=texto
     * 
     * Buscar productos por texto libre.
     * 
     * @return void Devuelve JSON con lista de productos o error 400.
     */
    public function search(): void
    {
        $searchText = $_GET['search'] ?? '';

        if (empty($searchText)) {
            ApiResponse::validationError('El parámetro "search" es requerido y no puede estar vacío.', 'search');
        }

        // Limitar longitud de búsqueda
        $searchText = mb_substr($searchText, 0, 100);

        $results = $this->productModel->search($searchText, 20);

        // Transformar cada resultado
        $data = array_map([$this, 'formatProductResponse'], $results);

        ApiResponse::success([
            'count' => count($data),
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
        // Proteger endpoint: requiere sesión de admin
        if (empty($_SESSION['admin_user_id'])) {
            ApiResponse::unauthorized('No autenticado. Inicia sesión para continuar.');
        }

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

        // Intentar crear el producto
        try {
            $productId = $this->productModel->create($data, null); // TODO: obtener admin_id de sesión

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
        } else {
            $data['promotion'] = null;
        }

        return $data;
    }
}
?>
