-- populate_metrics.sql
-- Poblar consult_events con datos de prueba para los últimos 90 días
-- Ejecutar: mysql -u root wine_pick_qr < database/populate_metrics.sql

USE wine_pick_qr;

-- Limpiar datos de prueba anteriores
TRUNCATE TABLE consult_events;

-- Generar eventos de consulta para los últimos 90 días
-- Distribuidos entre QR y BUSQUEDA con diferentes volúmenes por día

-- Últimos 7 días (alta actividad)
INSERT INTO consult_events (product_id, occurred_at, channel, context_info)
SELECT 
    FLOOR(1 + RAND() * 100) as product_id,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 7) DAY) + INTERVAL FLOOR(RAND() * 86400) SECOND as occurred_at,
    IF(RAND() > 0.4, 'QR', 'BUSQUEDA') as channel,
    CASE 
        WHEN RAND() > 0.5 THEN 'gondola_A1'
        WHEN RAND() > 0.7 THEN 'busqueda_web'
        ELSE 'evento_vip'
    END as context_info
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t2,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t3;

-- Días 8-30 (actividad media)
INSERT INTO consult_events (product_id, occurred_at, channel, context_info)
SELECT 
    FLOOR(1 + RAND() * 100) as product_id,
    DATE_SUB(NOW(), INTERVAL (7 + FLOOR(RAND() * 23)) DAY) + INTERVAL FLOOR(RAND() * 86400) SECOND as occurred_at,
    IF(RAND() > 0.5, 'QR', 'BUSQUEDA') as channel,
    CASE 
        WHEN RAND() > 0.6 THEN 'gondola_B2'
        WHEN RAND() > 0.8 THEN 'busqueda_app'
        ELSE 'degustacion'
    END as context_info
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t2,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3) t3;

-- Días 31-60 (actividad baja)
INSERT INTO consult_events (product_id, occurred_at, channel, context_info)
SELECT 
    FLOOR(1 + RAND() * 100) as product_id,
    DATE_SUB(NOW(), INTERVAL (30 + FLOOR(RAND() * 30)) DAY) + INTERVAL FLOOR(RAND() * 86400) SECOND as occurred_at,
    IF(RAND() > 0.6, 'QR', 'BUSQUEDA') as channel,
    CASE 
        WHEN RAND() > 0.7 THEN 'gondola_C3'
        ELSE 'busqueda_web'
    END as context_info
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t2;

-- Días 61-90 (actividad muy baja)
INSERT INTO consult_events (product_id, occurred_at, channel, context_info)
SELECT 
    FLOOR(1 + RAND() * 100) as product_id,
    DATE_SUB(NOW(), INTERVAL (60 + FLOOR(RAND() * 30)) DAY) + INTERVAL FLOOR(RAND() * 86400) SECOND as occurred_at,
    IF(RAND() > 0.7, 'QR', 'BUSQUEDA') as channel,
    'gondola_inicio' as context_info
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3) t2;

-- Productos estrella: generar más consultas para productos específicos
INSERT INTO consult_events (product_id, occurred_at, channel, context_info)
SELECT 
    CASE 
        WHEN RAND() > 0.7 THEN 4  -- Chardonnay Premium
        WHEN RAND() > 0.5 THEN 10 -- Whisky Single Malt
        WHEN RAND() > 0.3 THEN 19 -- Malbec Roble
        ELSE 27 -- Malbec Joven
    END as product_id,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) + INTERVAL FLOOR(RAND() * 86400) SECOND as occurred_at,
    IF(RAND() > 0.5, 'QR', 'BUSQUEDA') as channel,
    'producto_destacado' as context_info
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t2;

-- Eventos recientes para hoy y ayer (para testing en tiempo real)
INSERT INTO consult_events (product_id, occurred_at, channel, context_info)
VALUES
(4, NOW(), 'QR', 'testing_hoy'),
(4, NOW() - INTERVAL 2 HOUR, 'BUSQUEDA', 'testing_hoy'),
(10, NOW() - INTERVAL 4 HOUR, 'QR', 'testing_hoy'),
(19, NOW() - INTERVAL 6 HOUR, 'BUSQUEDA', 'testing_hoy'),
(27, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'testing_ayer'),
(27, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 HOUR, 'BUSQUEDA', 'testing_ayer'),
(4, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 6 HOUR, 'QR', 'testing_ayer'),
(10, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR, 'BUSQUEDA', 'testing_ayer');

-- Mostrar resumen
SELECT 
    '📊 Resumen de datos generados' as info,
    COUNT(*) as total_eventos,
    SUM(CASE WHEN channel = 'QR' THEN 1 ELSE 0 END) as eventos_qr,
    SUM(CASE WHEN channel = 'BUSQUEDA' THEN 1 ELSE 0 END) as eventos_busqueda,
    COUNT(DISTINCT product_id) as productos_consultados,
    MIN(DATE(occurred_at)) as fecha_mas_antigua,
    MAX(DATE(occurred_at)) as fecha_mas_reciente
FROM consult_events;

-- Top 5 productos más consultados
SELECT 
    '🏆 Top 5 Productos' as info,
    p.name,
    COUNT(*) as consultas
FROM consult_events ce
JOIN products p ON ce.product_id = p.id
GROUP BY ce.product_id, p.name
ORDER BY consultas DESC
LIMIT 5;

-- Consultas por día (últimos 7 días)
SELECT 
    '📈 Últimos 7 días' as info,
    DATE(occurred_at) as fecha,
    COUNT(*) as total,
    SUM(CASE WHEN channel = 'QR' THEN 1 ELSE 0 END) as qr,
    SUM(CASE WHEN channel = 'BUSQUEDA' THEN 1 ELSE 0 END) as busqueda
FROM consult_events
WHERE occurred_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(occurred_at)
ORDER BY fecha DESC;
