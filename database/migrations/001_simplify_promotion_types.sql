-- Migration: Actualizar tipos de promoción
-- Fecha: 9 de diciembre de 2025
-- Descripción: Incluir combos básicos en MVP (porcentaje, precio_fijo, 2x1, 3x2, nxm)

USE wine_pick_qr;

-- 1. Modificar la columna ENUM para incluir todos los tipos del MVP
ALTER TABLE promotions 
MODIFY COLUMN promotion_type ENUM('porcentaje','precio_fijo','2x1','3x2','nxm') NOT NULL;

-- Verificar cambios
SELECT DISTINCT promotion_type FROM promotions;
