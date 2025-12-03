-- database.sql - WINE-PICK-QR
-- Crea la base de datos, tablas principales y datos de ejemplo.

-- 1) Crear base de datos (si no existe) y seleccionarla
CREATE DATABASE IF NOT EXISTS wine_pick_qr
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE wine_pick_qr;

SET NAMES utf8mb4;

-- 2) Borrar tablas (en orden de dependencias) para poder re-ejecutar el script
DROP TABLE IF EXISTS eventos_consulta;
DROP TABLE IF EXISTS promociones;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios_admin;

-- 3) Tabla usuarios_admin
CREATE TABLE usuarios_admin (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(150) NULL,
  email VARCHAR(150) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso DATETIME NULL DEFAULT NULL,
  CONSTRAINT uk_usuarios_admin_usuario UNIQUE (usuario)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 4) Tabla productos
CREATE TABLE productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  codigo_publico VARCHAR(64) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo_bebida ENUM('vino','espumante','whisky','gin','licor','cerveza','otro') NOT NULL,
  bodega_destileria VARCHAR(150) NOT NULL,
  varietal VARCHAR(100) NULL,
  origen VARCHAR(100) NULL,
  cosecha SMALLINT NULL,
  descripcion_corta VARCHAR(255) NULL,
  precio_base DECIMAL(10,2) NOT NULL,
  stock_visible INT NULL,
  url_imagen VARCHAR(255) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  id_admin_ultima_modificacion INT NULL,

  CONSTRAINT uk_productos_codigo_publico UNIQUE (codigo_publico),

  CONSTRAINT fk_productos_admin_ultima_modificacion
    FOREIGN KEY (id_admin_ultima_modificacion)
    REFERENCES usuarios_admin(id_admin)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  KEY idx_productos_nombre (nombre),
  KEY idx_productos_bodega_destileria (bodega_destileria),
  KEY idx_productos_varietal (varietal),
  KEY idx_productos_tipo_bebida (tipo_bebida)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 5) Tabla promociones
CREATE TABLE promociones (
  id_promocion INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT NOT NULL,
  tipo_promocion ENUM('porcentaje','precio_fijo','2x1','n_por_m','otro') NOT NULL,
  valor_parametro DECIMAL(10,2) NOT NULL,
  descripcion_visible VARCHAR(255) NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  creada_por INT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_promociones_producto
    FOREIGN KEY (id_producto)
    REFERENCES productos(id_producto)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_promociones_creada_por
    FOREIGN KEY (creada_por)
    REFERENCES usuarios_admin(id_admin)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  KEY idx_promociones_producto_activa (id_producto, activa)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 6) Tabla eventos_consulta
CREATE TABLE eventos_consulta (
  id_evento INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT NOT NULL,
  fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  canal ENUM('QR','BUSQUEDA') NOT NULL,
  contexto VARCHAR(100) NULL,

  CONSTRAINT fk_eventos_consulta_producto
    FOREIGN KEY (id_producto)
    REFERENCES productos(id_producto)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  KEY idx_eventos_consulta_producto_fecha (id_producto, fecha_hora),
  KEY idx_eventos_consulta_fecha (fecha_hora),
  KEY idx_eventos_consulta_canal_fecha (canal, fecha_hora)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 7) Datos de ejemplo
-- Usuario admin de prueba
-- Nota: contraseña en texto plano: admin123
INSERT INTO usuarios_admin (usuario, contrasena_hash, nombre_completo, email, activo)
VALUES
  ('admin',
   '$2b$10$cz5KqUMKI73qKvQRHLMdUuVzx3TWKdBZgdaeQB2B89nyDQ4SyB1pu',
   'Administrador Principal',
   'admin@winepickqr.local',
   1
  );

-- Productos de ejemplo
INSERT INTO productos (
  codigo_publico,
  nombre,
  tipo_bebida,
  bodega_destileria,
  varietal,
  origen,
  cosecha,
  descripcion_corta,
  precio_base,
  stock_visible,
  url_imagen,
  activo,
  id_admin_ultima_modificacion
) VALUES
  (
    'MALBEC-RESERVA-2020',
    'Malbec Reserva 2020',
    'vino',
    'Bodega Ejemplo',
    'Malbec',
    'Mendoza, Argentina',
    2020,
    'Vino tinto Malbec reserva, ideal para carnes rojas.',
    4500.00,
    25,
    'https://ejemplo.com/imagenes/malbec_reserva_2020.jpg',
    1,
    1
  ),
  (
    'CABERNET-CLASICO-2021',
    'Cabernet Clásico 2021',
    'vino',
    'Bodega La Sierra',
    'Cabernet Sauvignon',
    'Valle de Uco, Argentina',
    2021,
    'Cabernet joven, buena relación precio-calidad.',
    3200.00,
    40,
    NULL,
    1,
    1
  ),
  (
    'GIN-PATAGONICO',
    'Gin Patagónico',
    'gin',
    'Destilería Sur',
    NULL,
    'Patagonia, Argentina',
    NULL,
    'Gin artesanal patagónico, botánicos locales.',
    7800.00,
    15,
    NULL,
    1,
    1
  );

-- Promoción de ejemplo para el primer producto (id_producto = 1)
INSERT INTO promociones (
  id_producto,
  tipo_promocion,
  valor_parametro,
  descripcion_visible,
  fecha_inicio,
  fecha_fin,
  activa,
  creada_por
) VALUES
  (
    1,
    'porcentaje',
    20.00,
    '20% OFF pagando en efectivo',
    '2025-01-01 00:00:00',
    '2025-01-31 23:59:59',
    1,
    1
  );

-- Eventos de consulta de ejemplo
INSERT INTO eventos_consulta (
  id_producto,
  fecha_hora,
  canal,
  contexto
) VALUES
  (1, NOW(), 'QR', 'demo_tienda'),
  (1, NOW(), 'BUSQUEDA', 'demo_tienda'),
  (2, NOW(), 'QR', 'demo_tienda');
