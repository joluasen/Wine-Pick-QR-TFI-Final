-- database.sql - WINE-PICK-QR
-- Initial schema (Sprint 1) for local MySQL/MariaDB (XAMPP)
-- Tables: admin_users, products, promotions, consult_events

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
-- -----------------------------------------------------
CREATE TABLE promotions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    promotion_type ENUM('porcentaje','precio_fijo','2x1','n_por_m','otro') NOT NULL,
    parameter_value DECIMAL(10,2) NOT NULL,
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

-- -----------------------------------------------------
-- Table: consult_events (eventos_consulta)
-- -----------------------------------------------------
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
