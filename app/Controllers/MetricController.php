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
}