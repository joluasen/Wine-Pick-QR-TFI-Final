<?php
declare(strict_types=1);
// app/Controllers/MetricController.php

/**
 * Controlador de Métricas
 *
 * Gestiona el endpoint de métricas para el dashboard de administración.
 * Proporciona estadísticas de consultas de productos.
 *
 * Endpoints implementados:
 * - GET /api/admin/metrics?days=30 - Obtener métricas del período
 */
class MetricController
{
    private \Metric $metricModel;

    public function __construct()
    {
        try {
            $db = Database::getInstance();
            $this->metricModel = new Metric($db);
        } catch (\Exception $e) {
            ApiResponse::serverError(
                'Error al conectar con la base de datos.',
                ['details' => $e->getMessage()]
            );
        }
    }

    /**
     * GET /api/admin/metrics?days=30
     *
     * Obtener métricas completas del período especificado.
     *
     * Query params:
     * - days: Período en días (7, 30, 90). Default: 30
     *
     * Respuesta:
     * - summary: {total, qr_count, search_count, unique_products}
     * - daily: [{date, total, qr_count, search_count}, ...]
     * - top_products: [{product_id, name, winery, qr_count, search_count, total}, ...]
     * - peak_day: {date, count} | null
     * - top_product: {product_id, name, count} | null
     * - average_daily: float
     */
    public function getMetrics(): void
    {
        // Proteger endpoint: requiere sesión de admin
        if (empty($_SESSION['admin_user_id'])) {
            ApiResponse::unauthorized('No autenticado. Inicia sesión para continuar.');
        }

        // Validar parámetro days
        $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;
        $allowedDays = [7, 30, 90];

        if (!in_array($days, $allowedDays, true)) {
            $days = 30;
        }

        try {
            // Obtener resumen
            $summary = $this->metricModel->getSummary($days);

            // Obtener consultas por día
            $daily = $this->metricModel->getConsultsByDay($days);

            // Obtener productos más consultados
            $topProducts = $this->metricModel->getTopProducts($days, 10);

            // Obtener día pico
            $peakDay = $this->metricModel->getPeakDay($days);

            // Obtener producto top
            $topProduct = $this->metricModel->getTopProduct($days);

            // Calcular promedio diario
            $averageDaily = $days > 0 ? round($summary['total'] / $days, 1) : 0;

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
            ApiResponse::serverError(
                'Error al obtener métricas.',
                ['error' => $e->getMessage()]
            );
        }
    }
}
?>
