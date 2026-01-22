<?php
declare(strict_types=1);
// app/Models/Metric.php

/**
 * Modelo de Métricas
 *
 * Proporciona métodos para consultar estadísticas de eventos de consulta.
 * Trabaja con la tabla consult_events para generar métricas del dashboard.
 */
class Metric
{
    /**
     * Instancia de la base de datos
     */
    private \Database $db;

    /**
     * Constructor: recibe la instancia de base de datos.
     */
    public function __construct(Database $database)
    {
        $this->db = $database;
    }

    /**
     * Devuelve un resumen de consultas en un período.
     * Incluye total, por canal y productos únicos.
     * @param int $days Días hacia atrás (7, 30, 90)
     * @return array
     */
    public function getSummary(int $days = 30): array
    {
        $startDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));

        $query = "
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN channel = 'QR' THEN 1 ELSE 0 END) as qr_count,
                SUM(CASE WHEN channel = 'BUSQUEDA' THEN 1 ELSE 0 END) as search_count,
                COUNT(DISTINCT product_id) as unique_products
            FROM consult_events
            WHERE occurred_at >= ?
        ";

        $result = $this->db->fetchOne($query, [$startDate], 's');

        return [
            'total' => (int)($result['total'] ?? 0),
            'qr_count' => (int)($result['qr_count'] ?? 0),
            'search_count' => (int)($result['search_count'] ?? 0),
            'unique_products' => (int)($result['unique_products'] ?? 0),
        ];
    }

    /**
     * Devuelve la cantidad de consultas por día en un período.
     * Rellena con 0 los días sin datos.
     * @param int $days Días hacia atrás
     * @return array
     */
    public function getConsultsByDay(int $days = 30): array
    {
        $startDate = date('Y-m-d', strtotime("-{$days} days"));

        $query = "
            SELECT
                DATE(occurred_at) as date,
                COUNT(*) as total,
                SUM(CASE WHEN channel = 'QR' THEN 1 ELSE 0 END) as qr_count,
                SUM(CASE WHEN channel = 'BUSQUEDA' THEN 1 ELSE 0 END) as search_count
            FROM consult_events
            WHERE DATE(occurred_at) >= ?
            GROUP BY DATE(occurred_at)
            ORDER BY date ASC
        ";

        $results = $this->db->fetchAll($query, [$startDate], 's');

        // Convertir resultados a un mapa indexado por fecha
        $dataMap = [];
        foreach ($results as $row) {
            $dataMap[$row['date']] = [
                'date' => $row['date'],
                'total' => (int)$row['total'],
                'qr' => (int)$row['qr_count'],
                'search' => (int)$row['search_count'],
            ];
        }

        // Generar serie completa de días, rellenando con 0 los faltantes
        $fullSeries = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            $fullSeries[] = $dataMap[$date] ?? [
                'date' => $date,
                'total' => 0,
                'qr' => 0,
                'search' => 0,
            ];
        }

        return $fullSeries;
    }

    /**
     * Devuelve los productos más consultados en un período.
     * @param int $days Días hacia atrás
     * @param int $limit Máximo de productos a retornar
     * @return array
     */
    public function getTopProducts(int $days = 30, int $limit = 10): array
    {
        $startDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));

        $query = "
            SELECT
                p.id as product_id,
                p.name,
                p.winery_distillery as winery,
                SUM(CASE WHEN ce.channel = 'QR' THEN 1 ELSE 0 END) as qr_count,
                SUM(CASE WHEN ce.channel = 'BUSQUEDA' THEN 1 ELSE 0 END) as search_count,
                COUNT(*) as total
            FROM consult_events ce
            INNER JOIN products p ON p.id = ce.product_id
            WHERE ce.occurred_at >= ?
            GROUP BY ce.product_id
            ORDER BY total DESC
            LIMIT ?
        ";

        $results = $this->db->fetchAll($query, [$startDate, $limit], 'si');

        return array_map(function($row) {
            return [
                'product_id' => (int)$row['product_id'],
                'name' => $row['name'],
                'winery' => $row['winery'],
                'qr_count' => (int)$row['qr_count'],
                'search_count' => (int)$row['search_count'],
                'total' => (int)$row['total'],
            ];
        }, $results);
    }

    /**
     * Devuelve el día con más consultas en un período.
     * @param int $days Días hacia atrás
     * @return array|null
     */
    public function getPeakDay(int $days = 30): ?array
    {
        $startDate = date('Y-m-d', strtotime("-{$days} days"));

        $query = "
            SELECT
                DATE(occurred_at) as date,
                COUNT(*) as count
            FROM consult_events
            WHERE DATE(occurred_at) >= ?
            GROUP BY DATE(occurred_at)
            ORDER BY count DESC
            LIMIT 1
        ";

        $result = $this->db->fetchOne($query, [$startDate], 's');

        if (!$result || (int)$result['count'] === 0) {
            return null;
        }

        return [
            'date' => $result['date'],
            'count' => (int)$result['count'],
        ];
    }

    /**
     * Devuelve el producto más consultado en un período.
     * @param int $days Días hacia atrás
     * @return array|null
     */
    public function getTopProduct(int $days = 30): ?array
    {
        $startDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));

        $query = "
            SELECT
                p.id as product_id,
                p.name,
                COUNT(*) as count
            FROM consult_events ce
            INNER JOIN products p ON p.id = ce.product_id
            WHERE ce.occurred_at >= ?
            GROUP BY ce.product_id
            ORDER BY count DESC
            LIMIT 1
        ";

        $result = $this->db->fetchOne($query, [$startDate], 's');

        if (!$result || (int)$result['count'] === 0) {
            return null;
        }

        return [
            'product_id' => (int)$result['product_id'],
            'name' => $result['name'],
            'count' => (int)$result['count'],
        ];
    }
}
?>
