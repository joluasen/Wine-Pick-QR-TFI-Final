-- database.sql - WINE-PICK-QR
-- Initial schema (Sprint 1) for local MySQL/MariaDB (XAMPP)
-- Tables: admin_users, products, promotions, consult_events
--
-- Schema Evolution:
-- - promotion_type ENUM incluye: porcentaje, precio_fijo, 2x1, 3x2, nxm
-- - Soporta promociones simples y combos en MVP

DROP DATABASE IF EXISTS wine_pick_qr;
CREATE DATABASE wine_pick_qr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wine_pick_qr;

-- -----------------------------------------------------
-- Table: admin_users (usuarios_admin)
-- -----------------------------------------------------
CREATE TABLE admin_users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NULL,
    email VARCHAR(150) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    last_login_at DATETIME NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: products (productos)
-- -----------------------------------------------------
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    public_code VARCHAR(64) NOT NULL,
    name VARCHAR(150) NOT NULL,
    drink_type ENUM('vino','espumante','whisky','gin','licor','cerveza','otro') NOT NULL,
    winery_distillery VARCHAR(150) NOT NULL,
    varietal VARCHAR(100) NULL,
    origin VARCHAR(100) NULL,
    vintage_year SMALLINT NULL,
    short_description VARCHAR(255) NULL,
    base_price DECIMAL(10,2) NOT NULL,
    visible_stock INT NULL,
    image_url VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    last_modified_by_admin_id INT UNSIGNED NULL,
    CONSTRAINT uq_products_public_code UNIQUE (public_code),
    CONSTRAINT fk_products_last_admin
        FOREIGN KEY (last_modified_by_admin_id)
        REFERENCES admin_users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    INDEX idx_products_name (name),
    INDEX idx_products_winery (winery_distillery),
    INDEX idx_products_varietal (varietal)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: promotions (promociones)
-- MVP Scope: Promociones simples y combos básicos
-- Tipos: porcentaje, precio_fijo, 2x1, 3x2, nxm
-- -----------------------------------------------------
CREATE TABLE promotions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    promotion_type ENUM('porcentaje','precio_fijo','2x1','3x2','nxm') NOT NULL,
    parameter_value DECIMAL(10,2) NOT NULL COMMENT 'Porcentaje: 0-100. Precio_fijo: precio ARS. nxm: N (llevas N al precio de M)',
    visible_text VARCHAR(255) NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by_admin_id INT UNSIGNED NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_promotions_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_promotions_created_by
        FOREIGN KEY (created_by_admin_id)
        REFERENCES admin_users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    INDEX idx_promotions_product (product_id),
    INDEX idx_promotions_product_active (product_id, is_active),
    INDEX idx_promotions_period (start_at, end_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE consult_events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    occurred_at DATETIME NOT NULL,
    channel ENUM('QR','BUSQUEDA') NOT NULL,
    context_info VARCHAR(100) NULL,
    CONSTRAINT fk_consult_events_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    INDEX idx_consult_events_product (product_id),
    INDEX idx_consult_events_datetime (occurred_at),
    INDEX idx_consult_events_channel (channel)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Poblar consult_events (últimos 90 días) para pruebas
-- Fuente: integrado desde populate_metrics.sql
-- Nota: Esto TRUNCA consult_events para datos de prueba.
-- Ejecutar completo si necesitas dataset de métricas.
-- =====================================================

-- Limpiar datos de prueba anteriores
TRUNCATE TABLE consult_events;

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
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t3;

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

-- Productos estrella: mayor volumen para productos específicos
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

-- Eventos recientes (hoy y ayer) para testing en tiempo real
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

-- Resumen rápido de datos generados
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
-- -----------------------------------------------------
-- Sample data
-- -----------------------------------------------------

-- 1) Admin user (password = 'admin123', hashed with bcrypt)
INSERT INTO admin_users (username, password_hash, full_name, email, is_active, created_at, last_login_at)
VALUES
('admin',
 '$2b$12$6yB8QMSP0BU4/hxyBonwP.C2ZwpcUWM0gJ.qbBytT9Ib3zU.EbZrK',
 'Default Admin',
 'admin@example.com',
 1,
 NOW(),
 NULL);

-- 2) Products (at least 3 example products)
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
) VALUES
('MALBEC-RES-750-001',
 'Malbec Reserva 750ml',
 'vino',
 'Bodega Ejemplo',
 'Malbec',
 'Mendoza, Argentina',
 2021,
 'Malbec reserva intenso y frutado.',
 5500.00,
 24,
 NULL,
 1,
 NOW(),
 NOW(),
 1),
('CABERNET-750-001',
 'Cabernet Sauvignon 750ml',
 'vino',
 'Bodega Ejemplo',
 'Cabernet Sauvignon',
 'Mendoza, Argentina',
 2020,
 'Cabernet con buena estructura y notas de roble.',
 5200.00,
 18,
 NULL,
 1,
 NOW(),
 NOW(),
 1),
('GIN-DRY-700-001',
 'London Dry Gin 700ml',
 'gin',
 'Destilería Ejemplo',
 NULL,
 'Buenos Aires, Argentina',
 NULL,
 'Gin London Dry clásico, ideal para tragos.',
 6300.00,
 12,
 NULL,
 1,
 NOW(),
 NOW(),
 1);

-- 3) One example promotion for product id = 1
INSERT INTO promotions (
    product_id,
    promotion_type,
    parameter_value,
    visible_text,
    start_at,
    end_at,
    is_active,
    created_by_admin_id,
    created_at,
    updated_at
) VALUES (
    1,
    'porcentaje',
    20.00,
    '20% OFF pagando en efectivo',
    NOW(),
    NULL,
    1,
    1,
    NOW(),
    NOW()
);

-- 4) Some example consult events
INSERT INTO consult_events (
    product_id,
    occurred_at,
    channel,
    context_info
) VALUES
(1, NOW(), 'QR', 'store_demo'),
(1, DATE_SUB(NOW(), INTERVAL 1 DAY), 'BUSQUEDA', 'search_results'),

(2, DATE_SUB(NOW(), INTERVAL 2 DAY), 'QR', 'gondola_A1');

-- -----------------------------------------------------
-- Datos generados: 100 productos, 50 promociones, consult_events
-- -----------------------------------------------------

-- 100 productos
INSERT INTO products (
    public_code, name, drink_type, winery_distillery, varietal, origin, vintage_year, short_description, base_price, visible_stock, image_url, is_active, created_at, updated_at, last_modified_by_admin_id
) VALUES
('B3A9Q', 'Pinot Noir Reserva', 'vino', 'Bodega Patagonia', 'Pinot Noir', 'Río Negro, Argentina', 2022, 'Pinot elegante y fresco.', 6500.00, 20, NULL, 1, NOW(), NOW(), 1),
('V0W2X', 'Malbec Clásico', 'vino', 'Bodega Mendoza', 'Malbec', 'Mendoza, Argentina', 2021, 'Malbec joven y frutado.', 4800.00, 30, NULL, 1, NOW(), NOW(), 1),
('L9P4Z', 'Cabernet Franc', 'vino', 'Bodega Sur', 'Cabernet Franc', 'Patagonia, Argentina', 2020, 'Cabernet Franc especiado.', 7200.00, 15, NULL, 1, NOW(), NOW(), 1),
('Q7M1S', 'Chardonnay Premium', 'vino', 'Bodega Norte', 'Chardonnay', 'Salta, Argentina', 2022, 'Chardonnay fresco y floral.', 5900.00, 18, NULL, 1, NOW(), NOW(), 1),
('F2K8J', 'Rosé de Malbec', 'vino', 'Bodega Rosé', 'Malbec', 'San Juan, Argentina', 2023, 'Rosado vibrante y seco.', 5100.00, 25, NULL, 1, NOW(), NOW(), 1),
('N5D6T', 'Syrah Reserva', 'vino', 'Bodega Andes', 'Syrah', 'La Rioja, Argentina', 2021, 'Syrah intenso y especiado.', 5400.00, 22, NULL, 1, NOW(), NOW(), 1),
('R8C3B', 'Bonarda Clásico', 'vino', 'Bodega Bonarda', 'Bonarda', 'Mendoza, Argentina', 2020, 'Bonarda suave y amable.', 4300.00, 19, NULL, 1, NOW(), NOW(), 1),
('S1V7U', 'Espumante Extra Brut', 'espumante', 'Bodega Espuma', NULL, 'Mendoza, Argentina', 2022, 'Espumante fresco y seco.', 6700.00, 16, NULL, 1, NOW(), NOW(), 1),
('J6Q2L', 'Gin Patagónico', 'gin', 'Destilería Sur', NULL, 'Neuquén, Argentina', NULL, 'Gin artesanal de la Patagonia.', 8500.00, 10, NULL, 1, NOW(), NOW(), 1),
('M4X5E', 'Whisky Single Malt', 'whisky', 'Destilería Andes', NULL, 'Mendoza, Argentina', NULL, 'Whisky argentino single malt.', 12000.00, 8, NULL, 1, NOW(), NOW(), 1),
('A7W3P', 'Malbec Orgánico', 'vino', 'Bodega Eco', 'Malbec', 'Mendoza, Argentina', 2022, 'Malbec orgánico certificado.', 7000.00, 12, NULL, 1, NOW(), NOW(), 1),
('T2B9F', 'Cabernet Sauvignon Reserva', 'vino', 'Bodega Reserva', 'Cabernet Sauvignon', 'San Juan, Argentina', 2021, 'Cabernet con notas de pimiento.', 6200.00, 14, NULL, 1, NOW(), NOW(), 1),
('E5H8K', 'Merlot Clásico', 'vino', 'Bodega Merlot', 'Merlot', 'Mendoza, Argentina', 2020, 'Merlot suave y frutado.', 5100.00, 17, NULL, 1, NOW(), NOW(), 1),
('U9S4D', 'Chardonnay Joven', 'vino', 'Bodega Blanca', 'Chardonnay', 'Río Negro, Argentina', 2023, 'Chardonnay joven y fresco.', 4800.00, 21, NULL, 1, NOW(), NOW(), 1),
('K3L7N', 'Rosé Blend', 'vino', 'Bodega Rosé', 'Blend', 'San Juan, Argentina', 2022, 'Rosado blend refrescante.', 5300.00, 20, NULL, 1, NOW(), NOW(), 1),
('Z2F6Y', 'Espumante Dulce', 'espumante', 'Bodega Espuma', NULL, 'Mendoza, Argentina', 2022, 'Espumante dulce y frutal.', 6900.00, 13, NULL, 1, NOW(), NOW(), 1),
('P8J1C', 'Gin Citrus', 'gin', 'Destilería Citrus', NULL, 'Buenos Aires, Argentina', NULL, 'Gin con notas cítricas.', 8700.00, 9, NULL, 1, NOW(), NOW(), 1),
('D6M4V', 'Whisky Blend', 'whisky', 'Destilería Blend', NULL, 'Córdoba, Argentina', NULL, 'Whisky blend nacional.', 9500.00, 11, NULL, 1, NOW(), NOW(), 1),
('Y5N2A', 'Malbec Roble', 'vino', 'Bodega Roble', 'Malbec', 'Mendoza, Argentina', 2021, 'Malbec con paso por roble.', 7600.00, 18, NULL, 1, NOW(), NOW(), 1),
('C1V8G', 'Cabernet Sauvignon Joven', 'vino', 'Bodega Joven', 'Cabernet Sauvignon', 'San Juan, Argentina', 2023, 'Cabernet joven y fresco.', 5000.00, 20, NULL, 1, NOW(), NOW(), 1),
('W7Q3R', 'Malbec Gran Reserva', 'vino', 'Bodega Gran', 'Malbec', 'Mendoza, Argentina', 2019, 'Malbec de guarda.', 9000.00, 7, NULL, 1, NOW(), NOW(), 1),
('H2S9X', 'Syrah Clásico', 'vino', 'Bodega Andes', 'Syrah', 'La Rioja, Argentina', 2020, 'Syrah amable y frutado.', 5200.00, 15, NULL, 1, NOW(), NOW(), 1),
('G5B4M', 'Bonarda Reserva', 'vino', 'Bodega Bonarda', 'Bonarda', 'Mendoza, Argentina', 2021, 'Bonarda con cuerpo.', 6000.00, 13, NULL, 1, NOW(), NOW(), 1),
('S8K1T', 'Espumante Brut Nature', 'espumante', 'Bodega Espuma', NULL, 'Mendoza, Argentina', 2023, 'Brut nature elegante.', 7100.00, 12, NULL, 1, NOW(), NOW(), 1),
('L3F7Q', 'Gin Floral', 'gin', 'Destilería Floral', NULL, 'Córdoba, Argentina', NULL, 'Gin con botánicos florales.', 8900.00, 8, NULL, 1, NOW(), NOW(), 1),
('V6D2P', 'Whisky Reserva', 'whisky', 'Destilería Andes', NULL, 'Mendoza, Argentina', NULL, 'Whisky reserva nacional.', 13000.00, 6, NULL, 1, NOW(), NOW(), 1),
('B9M5C', 'Malbec Joven', 'vino', 'Bodega Mendoza', 'Malbec', 'Mendoza, Argentina', 2023, 'Malbec joven y fresco.', 4700.00, 22, NULL, 1, NOW(), NOW(), 1),
('Q4W8S', 'Cabernet Sauvignon Gran Reserva', 'vino', 'Bodega Gran', 'Cabernet Sauvignon', 'San Juan, Argentina', 2019, 'Cabernet de guarda.', 9500.00, 5, NULL, 1, NOW(), NOW(), 1),
('F7K3J', 'Merlot Reserva', 'vino', 'Bodega Merlot', 'Merlot', 'Mendoza, Argentina', 2021, 'Merlot de guarda.', 6800.00, 10, NULL, 1, NOW(), NOW(), 1),
('N2D6T', 'Chardonnay Reserva', 'vino', 'Bodega Blanca', 'Chardonnay', 'Río Negro, Argentina', 2021, 'Chardonnay con paso por roble.', 6200.00, 14, NULL, 1, NOW(), NOW(), 1),
('R5C8B', 'Rosé Malbec', 'vino', 'Bodega Rosé', 'Malbec', 'San Juan, Argentina', 2022, 'Rosado de Malbec fresco.', 5400.00, 16, NULL, 1, NOW(), NOW(), 1),
('S2V7U', 'Espumante Rosé', 'espumante', 'Bodega Espuma', NULL, 'Mendoza, Argentina', 2023, 'Espumante rosado.', 7200.00, 11, NULL, 1, NOW(), NOW(), 1),
('J9Q1L', 'Gin Clásico', 'gin', 'Destilería Clásica', NULL, 'Buenos Aires, Argentina', NULL, 'Gin clásico argentino.', 8100.00, 13, NULL, 1, NOW(), NOW(), 1),
('M6X5E', 'Whisky Joven', 'whisky', 'Destilería Joven', NULL, 'Córdoba, Argentina', NULL, 'Whisky joven nacional.', 8800.00, 9, NULL, 1, NOW(), NOW(), 1),
('A4W3P', 'Malbec Blend', 'vino', 'Bodega Blend', 'Malbec', 'Mendoza, Argentina', 2022, 'Malbec blend especial.', 7300.00, 12, NULL, 1, NOW(), NOW(), 1),
('T7B9F', 'Cabernet Sauvignon Clásico', 'vino', 'Bodega Joven', 'Cabernet Sauvignon', 'San Juan, Argentina', 2023, 'Cabernet clásico.', 5100.00, 18, NULL, 1, NOW(), NOW(), 1),
('E2H8K', 'Merlot Joven', 'vino', 'Bodega Merlot', 'Merlot', 'Mendoza, Argentina', 2023, 'Merlot joven y fresco.', 4600.00, 20, NULL, 1, NOW(), NOW(), 1),
('U5S4D', 'Chardonnay Gran Reserva', 'vino', 'Bodega Blanca', 'Chardonnay', 'Río Negro, Argentina', 2019, 'Chardonnay de guarda.', 8000.00, 7, NULL, 1, NOW(), NOW(), 1),
('K9L7N', 'Rosé Syrah', 'vino', 'Bodega Rosé', 'Syrah', 'San Juan, Argentina', 2022, 'Rosado de Syrah.', 5500.00, 15, NULL, 1, NOW(), NOW(), 1),
('Z6F6Y', 'Espumante Brut', 'espumante', 'Bodega Espuma', NULL, 'Mendoza, Argentina', 2022, 'Brut clásico.', 6800.00, 13, NULL, 1, NOW(), NOW(), 1),
('P1J1C', 'Gin Herbal', 'gin', 'Destilería Herbal', NULL, 'Córdoba, Argentina', NULL, 'Gin con botánicos herbales.', 9000.00, 8, NULL, 1, NOW(), NOW(), 1),
('D8M4V', 'Whisky Premium', 'whisky', 'Destilería Andes', NULL, 'Mendoza, Argentina', NULL, 'Whisky premium nacional.', 15000.00, 5, NULL, 1, NOW(), NOW(), 1),
('Y2N2A', 'Malbec Reserva Especial', 'vino', 'Bodega Mendoza', 'Malbec', 'Mendoza, Argentina', 2020, 'Malbec reserva especial.', 8500.00, 10, NULL, 1, NOW(), NOW(), 1),
('C7V8G', 'Cabernet Sauvignon Blend', 'vino', 'Bodega Blend', 'Cabernet Sauvignon', 'San Juan, Argentina', 2021, 'Cabernet blend.', 6900.00, 12, NULL, 1, NOW(), NOW(), 1),
('W3Q3R', 'Merlot Gran Reserva', 'vino', 'Bodega Merlot', 'Merlot', 'Mendoza, Argentina', 2019, 'Merlot de guarda.', 9000.00, 6, NULL, 1, NOW(), NOW(), 1),
('H6S9X', 'Chardonnay Clásico', 'vino', 'Bodega Blanca', 'Chardonnay', 'Río Negro, Argentina', 2022, 'Chardonnay clásico.', 5700.00, 14, NULL, 1, NOW(), NOW(), 1),
('G1B4M', 'Rosé Pinot Noir', 'vino', 'Bodega Rosé', 'Pinot Noir', 'San Juan, Argentina', 2023, 'Rosado de Pinot Noir.', 5600.00, 17, NULL, 1, NOW(), NOW(), 1),
('S5K1T', 'Espumante Extra Dulce', 'espumante', 'Bodega Espuma', NULL, 'Mendoza, Argentina', 2023, 'Espumante extra dulce.', 7000.00, 11, NULL, 1, NOW(), NOW(), 1),
('L8F7Q', 'Gin Spicy', 'gin', 'Destilería Spicy', NULL, 'Buenos Aires, Argentina', NULL, 'Gin especiado.', 9200.00, 7, NULL, 1, NOW(), NOW(), 1),
('V3D2P', 'Whisky Blend Especial', 'whisky', 'Destilería Blend', NULL, 'Córdoba, Argentina', NULL, 'Whisky blend especial.', 9900.00, 9, NULL, 1, NOW(), NOW(), 1),
('B7A9Q', 'Malbec Patagónico', 'vino', 'Bodega Sur', 'Malbec', 'Río Negro, Argentina', 2022, 'Malbec fresco y mineral.', 6700.00, 13, NULL, 1, NOW(), NOW(), 1),
('V8W2X', 'Cabernet Sauvignon Patagónico', 'vino', 'Bodega Sur', 'Cabernet Sauvignon', 'Río Negro, Argentina', 2021, 'Cabernet con notas de frutos rojos.', 6900.00, 12, NULL, 1, NOW(), NOW(), 1),
('L2P4Z', 'Syrah Patagónico', 'vino', 'Bodega Sur', 'Syrah', 'Río Negro, Argentina', 2020, 'Syrah especiado y elegante.', 7100.00, 11, NULL, 1, NOW(), NOW(), 1),
('Q9M1S', 'Chardonnay Patagónico', 'vino', 'Bodega Sur', 'Chardonnay', 'Río Negro, Argentina', 2023, 'Chardonnay floral y fresco.', 6500.00, 14, NULL, 1, NOW(), NOW(), 1),
('F4K8J', 'Rosé Patagónico', 'vino', 'Bodega Sur', 'Blend', 'Río Negro, Argentina', 2022, 'Rosado vibrante.', 6300.00, 13, NULL, 1, NOW(), NOW(), 1),
('N1D6T', 'Espumante Patagónico', 'espumante', 'Bodega Sur', NULL, 'Río Negro, Argentina', 2023, 'Espumante fresco.', 7200.00, 10, NULL, 1, NOW(), NOW(), 1),
('R6C3B', 'Gin Patagónico Citrus', 'gin', 'Destilería Sur', NULL, 'Río Negro, Argentina', NULL, 'Gin con botánicos cítricos.', 9100.00, 8, NULL, 1, NOW(), NOW(), 1),
('S4V7U', 'Whisky Patagónico', 'whisky', 'Destilería Sur', NULL, 'Río Negro, Argentina', NULL, 'Whisky artesanal patagónico.', 13500.00, 6, NULL, 1, NOW(), NOW(), 1),
('J8Q2L', 'Malbec Sanjuanino', 'vino', 'Bodega San Juan', 'Malbec', 'San Juan, Argentina', 2021, 'Malbec frutado.', 5400.00, 15, NULL, 1, NOW(), NOW(), 1),
('M1X5E', 'Cabernet Sauvignon Sanjuanino', 'vino', 'Bodega San Juan', 'Cabernet Sauvignon', 'San Juan, Argentina', 2022, 'Cabernet joven.', 5600.00, 14, NULL, 1, NOW(), NOW(), 1),
('A9W3P', 'Syrah Sanjuanino', 'vino', 'Bodega San Juan', 'Syrah', 'San Juan, Argentina', 2020, 'Syrah especiado.', 5800.00, 13, NULL, 1, NOW(), NOW(), 1),
('T1B9F', 'Chardonnay Sanjuanino', 'vino', 'Bodega San Juan', 'Chardonnay', 'San Juan, Argentina', 2023, 'Chardonnay fresco.', 5200.00, 12, NULL, 1, NOW(), NOW(), 1),
('E8H8K', 'Rosé Sanjuanino', 'vino', 'Bodega San Juan', 'Blend', 'San Juan, Argentina', 2022, 'Rosado refrescante.', 5000.00, 11, NULL, 1, NOW(), NOW(), 1),
('U2S4D', 'Espumante Sanjuanino', 'espumante', 'Bodega San Juan', NULL, 'San Juan, Argentina', 2023, 'Espumante joven.', 5900.00, 10, NULL, 1, NOW(), NOW(), 1),
('K7L7N', 'Gin Sanjuanino', 'gin', 'Destilería San Juan', NULL, 'San Juan, Argentina', NULL, 'Gin artesanal.', 8300.00, 8, NULL, 1, NOW(), NOW(), 1),
('Z1F6Y', 'Whisky Sanjuanino', 'whisky', 'Destilería San Juan', NULL, 'San Juan, Argentina', NULL, 'Whisky nacional.', 11000.00, 7, NULL, 1, NOW(), NOW(), 1),
('P5J1C', 'Malbec Cordobés', 'vino', 'Bodega Córdoba', 'Malbec', 'Córdoba, Argentina', 2022, 'Malbec suave.', 5100.00, 16, NULL, 1, NOW(), NOW(), 1),
('D2M4V', 'Cabernet Sauvignon Cordobés', 'vino', 'Bodega Córdoba', 'Cabernet Sauvignon', 'Córdoba, Argentina', 2021, 'Cabernet amable.', 5300.00, 15, NULL, 1, NOW(), NOW(), 1),
('Y7N2A', 'Syrah Cordobés', 'vino', 'Bodega Córdoba', 'Syrah', 'Córdoba, Argentina', 2020, 'Syrah especiado.', 5500.00, 14, NULL, 1, NOW(), NOW(), 1),
('C2V8G', 'Chardonnay Cordobés', 'vino', 'Bodega Córdoba', 'Chardonnay', 'Córdoba, Argentina', 2023, 'Chardonnay floral.', 5000.00, 13, NULL, 1, NOW(), NOW(), 1),
('W8Q3R', 'Rosé Cordobés', 'vino', 'Bodega Córdoba', 'Blend', 'Córdoba, Argentina', 2022, 'Rosado suave.', 4800.00, 12, NULL, 1, NOW(), NOW(), 1),
('H1S9X', 'Espumante Cordobés', 'espumante', 'Bodega Córdoba', NULL, 'Córdoba, Argentina', 2023, 'Espumante fresco.', 5700.00, 11, NULL, 1, NOW(), NOW(), 1),
('G8B4M', 'Gin Cordobés', 'gin', 'Destilería Córdoba', NULL, 'Córdoba, Argentina', NULL, 'Gin nacional.', 8000.00, 9, NULL, 1, NOW(), NOW(), 1),
('S7K1T', 'Whisky Cordobés', 'whisky', 'Destilería Córdoba', NULL, 'Córdoba, Argentina', NULL, 'Whisky artesanal.', 10500.00, 8, NULL, 1, NOW(), NOW(), 1),
('L4F7Q', 'Malbec Salteño', 'vino', 'Bodega Salta', 'Malbec', 'Salta, Argentina', 2021, 'Malbec de altura.', 7500.00, 10, NULL, 1, NOW(), NOW(), 1),
('V1D2P', 'Cabernet Sauvignon Salteño', 'vino', 'Bodega Salta', 'Cabernet Sauvignon', 'Salta, Argentina', 2022, 'Cabernet de altura.', 7700.00, 9, NULL, 1, NOW(), NOW(), 1),
('B8A9Q', 'Syrah Salteño', 'vino', 'Bodega Salta', 'Syrah', 'Salta, Argentina', 2020, 'Syrah intenso.', 7900.00, 8, NULL, 1, NOW(), NOW(), 1),
('Q2M1S', 'Chardonnay Salteño', 'vino', 'Bodega Salta', 'Chardonnay', 'Salta, Argentina', 2023, 'Chardonnay floral.', 7300.00, 7, NULL, 1, NOW(), NOW(), 1),
('F1K8J', 'Rosé Salteño', 'vino', 'Bodega Salta', 'Blend', 'Salta, Argentina', 2022, 'Rosado de altura.', 7100.00, 6, NULL, 1, NOW(), NOW(), 1),
('N8D6T', 'Espumante Salteño', 'espumante', 'Bodega Salta', NULL, 'Salta, Argentina', 2023, 'Espumante de altura.', 8000.00, 5, NULL, 1, NOW(), NOW(), 1),
('R1C3B', 'Gin Salteño', 'gin', 'Destilería Salta', NULL, 'Salta, Argentina', NULL, 'Gin de altura.', 9500.00, 4, NULL, 1, NOW(), NOW(), 1),
('S6V7U', 'Whisky Salteño', 'whisky', 'Destilería Salta', NULL, 'Salta, Argentina', NULL, 'Whisky de altura.', 14000.00, 3, NULL, 1, NOW(), NOW(), 1),
('J2Q2L', 'Malbec Entrerriano', 'vino', 'Bodega Entre Ríos', 'Malbec', 'Entre Ríos, Argentina', 2022, 'Malbec regional.', 5200.00, 12, NULL, 1, NOW(), NOW(), 1),
('M8X5E', 'Cabernet Sauvignon Entrerriano', 'vino', 'Bodega Entre Ríos', 'Cabernet Sauvignon', 'Entre Ríos, Argentina', 2021, 'Cabernet regional.', 5400.00, 11, NULL, 1, NOW(), NOW(), 1),
('A2W3P', 'Syrah Entrerriano', 'vino', 'Bodega Entre Ríos', 'Syrah', 'Entre Ríos, Argentina', 2020, 'Syrah regional.', 5600.00, 10, NULL, 1, NOW(), NOW(), 1),
('T9B9F', 'Chardonnay Entrerriano', 'vino', 'Bodega Entre Ríos', 'Chardonnay', 'Entre Ríos, Argentina', 2023, 'Chardonnay regional.', 5000.00, 9, NULL, 1, NOW(), NOW(), 1),
('E1H8K', 'Rosé Entrerriano', 'vino', 'Bodega Entre Ríos', 'Blend', 'Entre Ríos, Argentina', 2022, 'Rosado regional.', 4800.00, 8, NULL, 1, NOW(), NOW(), 1),
('U8S4D', 'Espumante Entrerriano', 'espumante', 'Bodega Entre Ríos', NULL, 'Entre Ríos, Argentina', 2023, 'Espumante regional.', 5700.00, 7, NULL, 1, NOW(), NOW(), 1),
('K2L7N', 'Gin Entrerriano', 'gin', 'Destilería Entre Ríos', NULL, 'Entre Ríos, Argentina', NULL, 'Gin regional.', 8000.00, 6, NULL, 1, NOW(), NOW(), 1),
('Z8F6Y', 'Whisky Entrerriano', 'whisky', 'Destilería Entre Ríos', NULL, 'Entre Ríos, Argentina', NULL, 'Whisky regional.', 10500.00, 5, NULL, 1, NOW(), NOW(), 1),
('P2J1C', 'Malbec Misionero', 'vino', 'Bodega Misiones', 'Malbec', 'Misiones, Argentina', 2021, 'Malbec tropical.', 5300.00, 8, NULL, 1, NOW(), NOW(), 1),
('D5M4V', 'Cabernet Sauvignon Misionero', 'vino', 'Bodega Misiones', 'Cabernet Sauvignon', 'Misiones, Argentina', 2022, 'Cabernet tropical.', 5500.00, 7, NULL, 1, NOW(), NOW(), 1),
('Y1N2A', 'Syrah Misionero', 'vino', 'Bodega Misiones', 'Syrah', 'Misiones, Argentina', 2020, 'Syrah tropical.', 5700.00, 6, NULL, 1, NOW(), NOW(), 1),
('C8V8G', 'Chardonnay Misionero', 'vino', 'Bodega Misiones', 'Chardonnay', 'Misiones, Argentina', 2023, 'Chardonnay tropical.', 5100.00, 5, NULL, 1, NOW(), NOW(), 1),
('W5Q3R', 'Rosé Misionero', 'vino', 'Bodega Misiones', 'Blend', 'Misiones, Argentina', 2022, 'Rosado tropical.', 4900.00, 4, NULL, 1, NOW(), NOW(), 1),
('H8S9X', 'Espumante Misionero', 'espumante', 'Bodega Misiones', NULL, 'Misiones, Argentina', 2023, 'Espumante tropical.', 5800.00, 3, NULL, 1, NOW(), NOW(), 1),
('G2B4M', 'Gin Misionero', 'gin', 'Destilería Misiones', NULL, 'Misiones, Argentina', NULL, 'Gin tropical.', 8100.00, 2, NULL, 1, NOW(), NOW(), 1),
('S3K1T', 'Whisky Misionero', 'whisky', 'Destilería Misiones', NULL, 'Misiones, Argentina', NULL, 'Whisky tropical.', 10800.00, 1, NULL, 1, NOW(), NOW(), 1),
('L1F7Q', 'Malbec Cuyano', 'vino', 'Bodega Cuyo', 'Malbec', 'Cuyo, Argentina', 2022, 'Malbec regional.', 5400.00, 10, NULL, 1, NOW(), NOW(), 1),
('V5D2P', 'Cabernet Sauvignon Cuyano', 'vino', 'Bodega Cuyo', 'Cabernet Sauvignon', 'Cuyo, Argentina', 2021, 'Cabernet regional.', 5600.00, 9, NULL, 1, NOW(), NOW(), 1);

-- 50 promociones (para productos id 4 a 53)
INSERT INTO promotions (
    product_id, promotion_type, parameter_value, visible_text, start_at, end_at, is_active, created_by_admin_id, created_at, updated_at
) VALUES
(4, 'porcentaje', 10.00, '10% OFF en Chardonnay Premium', NOW(), NULL, 1, 1, NOW(), NOW()),
(5, 'precio_fijo', 4500.00, 'Precio especial Rosé de Malbec', NOW(), NULL, 1, 1, NOW(), NOW()),
(6, '2x1', 0.00, '2x1 en Syrah Reserva', NOW(), NULL, 1, 1, NOW(), NOW()),
(7, 'porcentaje', 15.00, '15% OFF en Bonarda Clásico', NOW(), NULL, 1, 1, NOW(), NOW()),
(8, 'precio_fijo', 6000.00, 'Espumante Extra Brut a $6000', NOW(), NULL, 1, 1, NOW(), NOW()),
(9, 'porcentaje', 12.00, '12% OFF en Gin Patagónico', NOW(), NULL, 1, 1, NOW(), NOW()),
(10, '3x2', 0.00, '3x2 en Whisky Single Malt', NOW(), NULL, 1, 1, NOW(), NOW()),
(11, 'porcentaje', 18.00, '18% OFF en Malbec Orgánico', NOW(), NULL, 1, 1, NOW(), NOW()),
(12, 'precio_fijo', 5500.00, 'Cabernet Sauvignon Reserva a $5500', NOW(), NULL, 1, 1, NOW(), NOW()),
(13, 'porcentaje', 8.00, '8% OFF en Merlot Clásico', NOW(), NULL, 1, 1, NOW(), NOW()),
(14, '2x1', 0.00, '2x1 en Chardonnay Joven', NOW(), NULL, 1, 1, NOW(), NOW()),
(15, 'porcentaje', 20.00, '20% OFF en Rosé Blend', NOW(), NULL, 1, 1, NOW(), NOW()),
(16, 'precio_fijo', 6000.00, 'Espumante Dulce a $6000', NOW(), NULL, 1, 1, NOW(), NOW()),
(17, 'porcentaje', 10.00, '10% OFF en Gin Citrus', NOW(), NULL, 1, 1, NOW(), NOW()),
(18, '3x2', 0.00, '3x2 en Whisky Blend', NOW(), NULL, 1, 1, NOW(), NOW()),
(19, 'porcentaje', 14.00, '14% OFF en Malbec Roble', NOW(), NULL, 1, 1, NOW(), NOW()),
(20, 'precio_fijo', 4800.00, 'Cabernet Sauvignon Joven a $4800', NOW(), NULL, 1, 1, NOW(), NOW()),
(21, 'porcentaje', 22.00, '22% OFF en Malbec Gran Reserva', NOW(), NULL, 1, 1, NOW(), NOW()),
(22, '2x1', 0.00, '2x1 en Syrah Clásico', NOW(), NULL, 1, 1, NOW(), NOW()),
(23, 'porcentaje', 16.00, '16% OFF en Bonarda Reserva', NOW(), NULL, 1, 1, NOW(), NOW()),
(24, 'precio_fijo', 6500.00, 'Espumante Brut Nature a $6500', NOW(), NULL, 1, 1, NOW(), NOW()),
(25, 'porcentaje', 11.00, '11% OFF en Gin Floral', NOW(), NULL, 1, 1, NOW(), NOW()),
(26, '3x2', 0.00, '3x2 en Whisky Reserva', NOW(), NULL, 1, 1, NOW(), NOW()),
(27, 'porcentaje', 9.00, '9% OFF en Malbec Joven', NOW(), NULL, 1, 1, NOW(), NOW()),
(28, 'precio_fijo', 9000.00, 'Cabernet Sauvignon Gran Reserva a $9000', NOW(), NULL, 1, 1, NOW(), NOW()),
(29, 'porcentaje', 13.00, '13% OFF en Merlot Reserva', NOW(), NULL, 1, 1, NOW(), NOW()),
(30, '2x1', 0.00, '2x1 en Chardonnay Reserva', NOW(), NULL, 1, 1, NOW(), NOW()),
(31, 'porcentaje', 17.00, '17% OFF en Rosé Malbec', NOW(), NULL, 1, 1, NOW(), NOW()),
(32, 'precio_fijo', 7000.00, 'Espumante Rosé a $7000', NOW(), NULL, 1, 1, NOW(), NOW()),
(33, 'porcentaje', 19.00, '19% OFF en Gin Clásico', NOW(), NULL, 1, 1, NOW(), NOW()),
(34, '3x2', 0.00, '3x2 en Whisky Joven', NOW(), NULL, 1, 1, NOW(), NOW()),
(35, 'porcentaje', 15.00, '15% OFF en Malbec Blend', NOW(), NULL, 1, 1, NOW(), NOW()),
(36, 'precio_fijo', 6000.00, 'Cabernet Sauvignon Clásico a $6000', NOW(), NULL, 1, 1, NOW(), NOW()),
(37, 'porcentaje', 8.00, '8% OFF en Merlot Joven', NOW(), NULL, 1, 1, NOW(), NOW()),
(38, '2x1', 0.00, '2x1 en Chardonnay Gran Reserva', NOW(), NULL, 1, 1, NOW(), NOW()),
(39, 'porcentaje', 21.00, '21% OFF en Rosé Syrah', NOW(), NULL, 1, 1, NOW(), NOW()),
(40, 'precio_fijo', 6500.00, 'Espumante Brut a $6500', NOW(), NULL, 1, 1, NOW(), NOW()),
(41, 'porcentaje', 12.00, '12% OFF en Gin Herbal', NOW(), NULL, 1, 1, NOW(), NOW()),
(42, '3x2', 0.00, '3x2 en Whisky Premium', NOW(), NULL, 1, 1, NOW(), NOW()),
(43, 'porcentaje', 18.00, '18% OFF en Malbec Reserva Especial', NOW(), NULL, 1, 1, NOW(), NOW()),
(44, 'precio_fijo', 8000.00, 'Cabernet Sauvignon Blend a $8000', NOW(), NULL, 1, 1, NOW(), NOW()),
(45, 'porcentaje', 20.00, '20% OFF en Merlot Gran Reserva', NOW(), NULL, 1, 1, NOW(), NOW()),
(46, '2x1', 0.00, '2x1 en Chardonnay Clásico', NOW(), NULL, 1, 1, NOW(), NOW()),
(47, 'porcentaje', 14.00, '14% OFF en Rosé Pinot Noir', NOW(), NULL, 1, 1, NOW(), NOW()),
(48, 'precio_fijo', 7500.00, 'Espumante Extra Dulce a $7500', NOW(), NULL, 1, 1, NOW(), NOW()),
(49, 'porcentaje', 11.00, '11% OFF en Gin Spicy', NOW(), NULL, 1, 1, NOW(), NOW()),
(50, '3x2', 0.00, '3x2 en Whisky Blend Especial', NOW(), NULL, 1, 1, NOW(), NOW());

-- Consult_events para productos 4 a 53
INSERT INTO consult_events (
    product_id, occurred_at, channel, context_info
) VALUES
(4, NOW(), 'QR', 'degustacion_evento'),
(5, NOW(), 'BUSQUEDA', 'busqueda_web'),
(6, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_B2'),
(7, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(8, NOW(), 'QR', 'evento_vip'),
(9, NOW(), 'BUSQUEDA', 'busqueda_web'),
(10, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_C1'),
(11, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(12, NOW(), 'QR', 'degustacion_evento'),
(13, NOW(), 'BUSQUEDA', 'busqueda_web'),
(14, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_B3'),
(15, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(16, NOW(), 'QR', 'evento_vip'),
(17, NOW(), 'BUSQUEDA', 'busqueda_web'),
(18, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_C2'),
(19, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(20, NOW(), 'QR', 'degustacion_evento'),
(21, NOW(), 'BUSQUEDA', 'busqueda_web'),
(22, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_B4'),
(23, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(24, NOW(), 'QR', 'evento_vip'),
(25, NOW(), 'BUSQUEDA', 'busqueda_web'),
(26, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_C3'),
(27, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(28, NOW(), 'QR', 'degustacion_evento'),
(29, NOW(), 'BUSQUEDA', 'busqueda_web'),
(30, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_B5'),
(31, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(32, NOW(), 'QR', 'evento_vip'),
(33, NOW(), 'BUSQUEDA', 'busqueda_web'),
(34, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_C4'),
(35, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(36, NOW(), 'QR', 'degustacion_evento'),
(37, NOW(), 'BUSQUEDA', 'busqueda_web'),
(38, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_B6'),
(39, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(40, NOW(), 'QR', 'evento_vip'),
(41, NOW(), 'BUSQUEDA', 'busqueda_web'),
(42, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_C5'),
(43, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(44, NOW(), 'QR', 'degustacion_evento'),
(45, NOW(), 'BUSQUEDA', 'busqueda_web'),
(46, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_B7'),
(47, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(48, NOW(), 'QR', 'evento_vip'),
(49, NOW(), 'BUSQUEDA', 'busqueda_web'),
(50, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'gondola_C6'),
(51, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_app'),
(52, NOW(), 'QR', 'degustacion_evento'),
(53, NOW(), 'BUSQUEDA', 'busqueda_web');
