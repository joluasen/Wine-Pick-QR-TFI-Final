<?php
declare(strict_types=1);
// Controlador para métricas del dashboard de administración.
// Proporciona estadísticas y datos agregados sobre consultas de productos.
class MetricController
{
    // Modelo de métricas para acceder a datos estadísticos.
    private \Metric $metricModel;

    // Inicializa el controlador y el modelo de métricas.
    public function __construct()
    {
        try {
            $db = Database::getInstance();
            $this->metricModel = new Metric($db);
        } catch (\Exception $e) {
            // Si falla la conexión a la base de datos, retorna error 500 con detalles.
            ApiResponse::serverError(
                'Error al conectar con la base de datos.',
                ['details' => $e->getMessage()]
            );
        }
    }

    /**
     * Obtiene métricas completas del período especificado.
     * Endpoint: GET /api/admin/metrics?days=30
     *
     * Parámetro:
     * - days: Período en días (7, 30, 90). Default: 30
     *
     * Respuesta:
     * - summary: Resumen general de consultas
     * - daily: Consultas por día
     * - top_products: Productos más consultados
     * - peak_day: Día con mayor actividad
     * - top_product: Producto más consultado
     * - average_daily: Promedio diario de consultas
     */
    public function getMetrics(): void
    {
        // Valida el parámetro days y lo ajusta si es necesario.
        $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;
        $allowedDays = [7, 30, 90];

        if (!in_array($days, $allowedDays, true)) {
            $days = 30;
        }

        try {
            // Obtiene el resumen general de métricas.
            $summary = $this->metricModel->getSummary($days);

            // Obtiene las consultas agrupadas por día.
            $daily = $this->metricModel->getConsultsByDay($days);

            // Obtiene los productos más consultados en el período.
            $topProducts = $this->metricModel->getTopProducts($days, 10);

            // Obtiene el día con mayor cantidad de consultas.
            $peakDay = $this->metricModel->getPeakDay($days);

            // Obtiene el producto más consultado.
            $topProduct = $this->metricModel->getTopProduct($days);

            // Calcula el promedio diario de consultas.
            $averageDaily = $days > 0 ? round($summary['total'] / $days, 1) : 0;

            // Responde con todos los datos agregados.
            ApiResponse::success([
                'period_days' => $days,
                'summary' => $summary,
                'daily' => $daily,
                'top_products' => $topProducts,
                'peak_day' => $peakDay,
                'top_product' => $topProduct,
                'average_daily' => $averageDaily,
            ], 200);
        } catch (\Exception $e) {
            // Si ocurre un error, responde con error 500 y detalles.
            ApiResponse::serverError(
                'Error al obtener métricas.',
                ['error' => $e->getMessage()]
            );
        }
    }

    /**
     * Registra una consulta de producto.
     * Endpoint: POST /api/public/metricas
     * 
     * Body JSON:
     * {
     *   "product_id": 123,
     *   "channel": "QR" | "BUSQUEDA",
     *   "context_info": "opcional"
     * }
     * 
     * Este endpoint es público y no requiere autenticación.
     * Si falla, retorna 200 OK para no afectar la experiencia del usuario.
     */
    public function register(): void
    {
        // Obtener datos del body JSON
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if ($data === null) {
            // No fallar, solo loguear y retornar éxito
            error_log('Métrica: Body JSON inválido');
            ApiResponse::success(['registered' => false, 'reason' => 'invalid_json'], 200);
            return;
        }

        // Validar campos requeridos
        if (!isset($data['product_id']) || !isset($data['channel'])) {
            error_log('Métrica: Faltan campos requeridos');
            ApiResponse::success(['registered' => false, 'reason' => 'missing_fields'], 200);
            return;
        }

        $productId = (int)$data['product_id'];
        $channel = strtoupper(trim($data['channel']));

        // Validar product_id
        if ($productId <= 0) {
            error_log('Métrica: product_id inválido: ' . $productId);
            ApiResponse::success(['registered' => false, 'reason' => 'invalid_product_id'], 200);
            return;
        }

        // Validar channel
        if (!in_array($channel, ['QR', 'BUSQUEDA'], true)) {
            error_log('Métrica: canal inválido: ' . $channel);
            ApiResponse::success(['registered' => false, 'reason' => 'invalid_channel'], 200);
            return;
        }

        // Intentar registrar la métrica
        try {
            $this->metricModel->registerConsult($productId, $channel);
            ApiResponse::success(['registered' => true], 200);
        } catch (\InvalidArgumentException $e) {
            // Producto no existe u otro error de validación
            error_log('Métrica: ' . $e->getMessage());
            ApiResponse::success(['registered' => false, 'reason' => 'validation_error'], 200);
        } catch (\Exception $e) {
            // Error de base de datos u otro error
            error_log('Métrica: Error al registrar: ' . $e->getMessage());
            ApiResponse::success(['registered' => false, 'reason' => 'database_error'], 200);
        }
    }
}