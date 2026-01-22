
DROP DATABASE IF EXISTS wine_pick_qr;
CREATE DATABASE wine_pick_qr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wine_pick_qr;

CREATE TABLE admin_users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    public_code VARCHAR(64) NOT NULL,
    name VARCHAR(150) NOT NULL,
    drink_type ENUM('vino','espumante','whisky','gin','licor','cerveza') NOT NULL,
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

