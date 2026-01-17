<?php
// app/Controllers/PromotionController.php
declare(strict_types=1);

class PromotionController
{
    private \Promotion $promotionModel;
    private \Product $productModel;

    public function __construct(Promotion $promotionModel, Product $productModel)
    {
        $this->promotionModel = $promotionModel;
        $this->productModel = $productModel;
    }

    /**
     * POST /api/admin/promociones
     * 
     * Crear una nueva promoción para un producto.
     * 
     * Requiere:
     * - product_id: ID del producto
     * - promotion_type: tipo de promo (porcentaje, precio_fijo, etc)
     * - parameter_value: valor (precio o porcentaje)
     * - visible_text: texto breve visible
     * - start_at: fecha inicio (Y-m-d H:i:s)
     * - end_at: fecha fin (Y-m-d H:i:s, opcional)
     * 
     * @return void JSON con promoción creada o error.
     */
    public function create(): void
    {
        // Proteger: requiere sesión de admin
        if (empty($_SESSION['admin_user_id'])) {
            ApiResponse::unauthorized('Requiere autenticación de administrador.');
        }

        $body = json_decode(file_get_contents('php://input'), true);

        // Validar campos requeridos
        if (empty($body['product_id']) || empty($body['promotion_type']) || empty($body['parameter_value']) || empty($body['visible_text']) || empty($body['start_at'])) {
            ApiResponse::validationError('Campos requeridos: product_id, promotion_type, parameter_value, visible_text, start_at.', 'body');
        }

        $productId = (int)$body['product_id'];
        $type = trim($body['promotion_type']);
        $value = (float)$body['parameter_value'];
        $text = trim($body['visible_text']);
        $startAt = trim($body['start_at']);
        $endAt = !empty($body['end_at']) ? trim($body['end_at']) : null;
        $adminId = (int)$_SESSION['admin_user_id'];

        // Validar tipo de promoción (valores permitidos)
        $validTypes = ['porcentaje', 'precio_fijo', '2x1', '3x2', 'nxm'];
        if (!in_array($type, $validTypes, true)) {
            ApiResponse::validationError(
                'Tipo de promoción inválido. Valores permitidos: ' . implode(', ', $validTypes) . '.',
                'promotion_type'
            );
        }

        // Validar que el producto existe
        $product = $this->productModel->findById($productId);
        if (!$product) {
            ApiResponse::notFound('Producto no encontrado.');
        }

        // Validar parámetro según el tipo de promoción
        if ($value <= 0) {
            ApiResponse::validationError('El valor de la promoción debe ser mayor a 0.', 'parameter_value');
        }

        // Validaciones específicas por tipo
        if ($type === 'porcentaje') {
            if ($value >= 100) {
                ApiResponse::validationError('El porcentaje debe ser menor a 100% para que el precio final sea mayor a 0.', 'parameter_value');
            }
        } elseif ($type === 'precio_fijo') {
            if ($value >= (float)$product['base_price']) {
                ApiResponse::validationError('El precio promocional debe ser menor al precio base (' . $product['base_price'] . ' ARS).', 'parameter_value');
            }
        } elseif ($type === '2x1' || $type === '3x2' || $type === 'nxm') {
            // Para combos, el valor debe ser entero
            if ($value != floor($value)) {
                ApiResponse::validationError('El valor para combos debe ser un número entero.', 'parameter_value');
            }
        }

        // Validar fechas
        if (!$this->isValidDate($startAt)) {
            ApiResponse::validationError('Fecha de inicio inválida (formato: Y-m-d H:i:s).', 'start_at');
        }

        if ($endAt && !$this->isValidDate($endAt)) {
            ApiResponse::validationError('Fecha de fin inválida (formato: Y-m-d H:i:s).', 'end_at');
        }

        if ($endAt && strtotime($startAt) > strtotime($endAt)) {
            ApiResponse::validationError('La fecha de inicio debe ser menor o igual a la fecha de fin.', 'start_at');
        }

        // Validar texto visible
        if (strlen($text) < 3 || strlen($text) > 255) {
            ApiResponse::validationError('El texto de promoción debe tener entre 3 y 255 caracteres.', 'visible_text');
        }

        // RF12: Validar que no exista otra promoción activa para el mismo producto en el mismo período
        $overlapping = $this->promotionModel->findOverlappingPromotion($productId, $startAt, $endAt);
        if ($overlapping) {
            $conflictInfo = sprintf(
                '"%s" (vigente desde %s hasta %s)',
                $overlapping['visible_text'],
                $overlapping['start_at'],
                $overlapping['end_at'] ?? 'sin fecha de fin'
            );
            ApiResponse::validationError(
                'Ya existe una promoción activa para este producto en el período indicado: ' . $conflictInfo,
                'start_at'
            );
        }

        // Crear promoción
        try {
            $promoId = $this->promotionModel->create(
                $productId,
                $type,
                $value,
                $text,
                $startAt,
                $endAt,
                $adminId
            );

            $promotion = $this->promotionModel->findById($promoId);

            ApiResponse::success([
                'id' => (int)$promotion['id'],
                'product_id' => (int)$promotion['product_id'],
                'promotion_type' => $promotion['promotion_type'],
                'parameter_value' => (float)$promotion['parameter_value'],
                'visible_text' => $promotion['visible_text'],
                'start_at' => $promotion['start_at'],
                'end_at' => $promotion['end_at'],
                'is_active' => (bool)$promotion['is_active'],
                'created_at' => $promotion['created_at'],
            ], 201);
        } catch (\Exception $e) {
            ApiResponse::serverError('Error al crear promoción: ' . $e->getMessage());
        }
    }

    /**
     * GET /api/admin/promociones?product_id=... o GET /api/admin/promociones?limit=...&offset=...
     *
     * Listar promociones con dos modos:
     * 1. Si se proporciona product_id: Listar todas las promociones de ese producto
     * 2. Si NO se proporciona product_id: Listar todas las promociones (paginado)
     *
     * Query params:
     * - product_id: ID del producto (opcional, para filtrar por producto)
     * - limit: Límite de resultados (default: 10, max: 100, solo si NO hay product_id)
     * - offset: Offset para paginación (default: 0, solo si NO hay product_id)
     *
     * @return void JSON con lista de promociones.
     */
    public function listPromotions(): void
    {
        if (empty($_SESSION['admin_user_id'])) {
            ApiResponse::unauthorized('Requiere autenticación.');
        }

        $productId = isset($_GET['product_id']) && $_GET['product_id'] !== '' ? (int)$_GET['product_id'] : null;

        // Modo 1: Listar promociones de un producto específico
        if ($productId !== null) {
            if ($productId <= 0) {
                ApiResponse::validationError('product_id debe ser un número positivo.', 'product_id');
            }

            $promos = $this->promotionModel->findByProductId($productId);

            ApiResponse::success([
                'count' => count($promos),
                'promotions' => array_map(fn($p) => [
                    'id' => (int)$p['id'],
                    'promotion_type' => $p['promotion_type'],
                    'parameter_value' => (float)$p['parameter_value'],
                    'visible_text' => $p['visible_text'],
                    'start_at' => $p['start_at'],
                    'end_at' => $p['end_at'],
                    'is_active' => (bool)$p['is_active'],
                    'created_at' => $p['created_at'],
                ], $promos),
            ], 200);
        }

        // Modo 2: Listar todas las promociones (paginado, con datos de producto)
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        if ($limit <= 0) $limit = 10;
        if ($limit > 100) $limit = 100;
        if ($offset < 0) $offset = 0;

        $promos = $this->promotionModel->findAllWithProduct($limit, $offset);
        $total = $this->promotionModel->countAll();

        ApiResponse::success([
            'count' => count($promos),
            'total' => $total,
            'promotions' => $promos,
        ], 200);
    }

    /**
     * PUT /api/admin/promociones/{id}
     *
     * Actualizar una promoción existente.
     *
     * Requiere en body JSON:
     * - promotion_type: tipo de promo (porcentaje, precio_fijo, etc)
     * - parameter_value: valor (precio o porcentaje)
     * - visible_text: texto breve visible
     * - start_at: fecha inicio (Y-m-d H:i:s)
     * - end_at: fecha fin (Y-m-d H:i:s, opcional)
     *
     * @return void JSON con promoción actualizada o error.
     */
    public function update(string $id): void
    {
        // Proteger: requiere sesión de admin
        if (empty($_SESSION['admin_user_id'])) {
            ApiResponse::unauthorized('Requiere autenticación de administrador.');
        }

        // Validar ID
        $promotionId = (int)$id;
        if ($promotionId <= 0) {
            ApiResponse::validationError('ID de promoción inválido.', 'id');
        }

        // Obtener JSON del body
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if ($data === null) {
            ApiResponse::validationError('El cuerpo de la solicitud no es un JSON válido.');
        }

        // Verificar que la promoción existe
        $promotion = $this->promotionModel->findById($promotionId);
        if (!$promotion) {
            ApiResponse::notFound('Promoción no encontrada.');
        }

        // Validar campos requeridos
        if (empty($data['promotion_type']) || empty($data['parameter_value']) || empty($data['visible_text']) || empty($data['start_at'])) {
            ApiResponse::validationError('Campos requeridos: promotion_type, parameter_value, visible_text, start_at.', 'body');
        }

        $type = trim($data['promotion_type']);
        $value = (float)$data['parameter_value'];
        $text = trim($data['visible_text']);
        $startAt = trim($data['start_at']);
        $endAt = !empty($data['end_at']) ? trim($data['end_at']) : null;

        // Validar tipo de promoción
        $validTypes = ['porcentaje', 'precio_fijo', '2x1', '3x2', 'nxm'];
        if (!in_array($type, $validTypes, true)) {
            ApiResponse::validationError(
                'Tipo de promoción inválido. Valores permitidos: ' . implode(', ', $validTypes) . '.',
                'promotion_type'
            );
        }

        // Validar parámetro según el tipo de promoción
        if ($value <= 0) {
            ApiResponse::validationError('El valor de la promoción debe ser mayor a 0.', 'parameter_value');
        }

        // Validaciones específicas por tipo
        if ($type === 'porcentaje') {
            // Porcentaje debe ser entero sin decimales
            if ($value != floor($value)) {
                ApiResponse::validationError('El porcentaje debe ser un número entero (sin decimales).', 'parameter_value');
            }
            if ($value >= 100) {
                ApiResponse::validationError('El porcentaje debe ser menor a 100%.', 'parameter_value');
            }
        } elseif ($type === 'precio_fijo') {
            // Obtener producto para validar precio
            $product = $this->productModel->findById((int)$promotion['product_id']);
            if ($product && $value >= (float)$product['base_price']) {
                ApiResponse::validationError('El precio promocional debe ser menor al precio base (' . $product['base_price'] . ' ARS).', 'parameter_value');
            }
        } elseif ($type === '2x1' || $type === '3x2' || $type === 'nxm') {
            if ($value != floor($value)) {
                ApiResponse::validationError('El valor para combos debe ser un número entero.', 'parameter_value');
            }
        }

        // Validar fechas
        if (!$this->isValidDate($startAt)) {
            ApiResponse::validationError('Fecha de inicio inválida (formato: Y-m-d H:i:s).', 'start_at');
        }

        if ($endAt && !$this->isValidDate($endAt)) {
            ApiResponse::validationError('Fecha de fin inválida (formato: Y-m-d H:i:s).', 'end_at');
        }

        if ($endAt && strtotime($startAt) > strtotime($endAt)) {
            ApiResponse::validationError('La fecha de inicio debe ser menor o igual a la fecha de fin.', 'start_at');
        }

        // Validar texto visible
        if (strlen($text) < 3 || strlen($text) > 255) {
            ApiResponse::validationError('El texto de promoción debe tener entre 3 y 255 caracteres.', 'visible_text');
        }

        // Nota: RF12 (validación de solapamiento) solo aplica al crear promociones, no al editarlas.
        // El admin debe poder editar libremente una promoción existente para corregir errores de fechas.

        // Actualizar promoción
        try {
            $success = $this->promotionModel->update(
                $promotionId,
                $type,
                $value,
                $text,
                $startAt,
                $endAt
            );

            if (!$success) {
                ApiResponse::serverError('No se pudo actualizar la promoción.');
            }

            $updatedPromo = $this->promotionModel->findById($promotionId);

            ApiResponse::success([
                'id' => (int)$updatedPromo['id'],
                'product_id' => (int)$updatedPromo['product_id'],
                'promotion_type' => $updatedPromo['promotion_type'],
                'parameter_value' => (float)$updatedPromo['parameter_value'],
                'visible_text' => $updatedPromo['visible_text'],
                'start_at' => $updatedPromo['start_at'],
                'end_at' => $updatedPromo['end_at'],
                'is_active' => (bool)$updatedPromo['is_active'],
                'created_at' => $updatedPromo['created_at'],
            ], 200);
        } catch (\Exception $e) {
            ApiResponse::serverError('Error al actualizar promoción: ' . $e->getMessage());
        }
    }

    /**
     * DELETE /api/admin/promociones/{id}
     * 
     * Eliminar una promoción existente.
     * 
     * @return void JSON con confirmación o error.
     */
    public function delete(string $id): void
    {
        // Proteger: requiere sesión de admin
        if (empty($_SESSION['admin_user_id'])) {
            ApiResponse::unauthorized('Requiere autenticación de administrador.');
        }

        // Validar ID
        $promotionId = (int)$id;
        if ($promotionId <= 0) {
            ApiResponse::validationError('ID de promoción inválido.', 'id');
        }

        // Verificar que la promoción existe
        $promotion = $this->promotionModel->findById($promotionId);
        if (!$promotion) {
            ApiResponse::notFound('Promoción no encontrada.');
        }

        // Eliminar promoción
        try {
            $success = $this->promotionModel->delete($promotionId);

            if (!$success) {
                ApiResponse::serverError('No se pudo eliminar la promoción.');
            }

            ApiResponse::success([
                'message' => 'Promoción eliminada exitosamente.',
                'id' => $promotionId
            ], 200);
        } catch (\Exception $e) {
            ApiResponse::serverError('Error al eliminar promoción: ' . $e->getMessage());
        }
    }

    /**
     * Validar formato de fecha Y-m-d H:i:s
     */
    private function isValidDate(string $date): bool
    {
        // Permitir formato Y-m-d H:i:s (con segundos opcionales)
        $pattern = '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/';
        if (!preg_match($pattern, $date)) {
            return false;
        }
        
        // Verificar que sea una fecha válida
        $d = \DateTime::createFromFormat('Y-m-d H:i:s', $date);
        return $d && $d->format('Y-m-d H:i:s') === $date;
    }
}
?>
