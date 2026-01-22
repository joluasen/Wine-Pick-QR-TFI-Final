-- seed.sql - Datos de prueba reales para Wine-Pick-QR
-- Incluye: 1 admin, 40 productos, 20 promociones, eventos de consulta

USE wine_pick_qr;

-- =====================================================
-- admin_users (1 registro)
-- Password: Admin2026! | Hash bcrypt
-- =====================================================
INSERT INTO admin_users (username, password_hash, created_at) VALUES
('Admin', '$2y$10$tyG5oSLh/BbLarsuFEQVHe2/riIv.0yoGLulR3gLrZIUymUh0hpM2', NOW());

-- =====================================================
-- products (40 productos variados)
-- =====================================================
INSERT INTO products (
    public_code, name, drink_type, winery_distillery, varietal, origin, vintage_year,
    short_description, base_price, visible_stock, image_url, is_active, created_at, updated_at, last_modified_by_admin_id
) VALUES
('MALBEC-ALAMOS-750', 'Álamos Malbec Clásico', 'vino', 'Bodegas Álamos', 'Malbec', 'Mendoza, Argentina', 2022, 'Malbec equilibrado con notas de cereza negra y especias. Ideal para carnes rojas.', 3500.00, 25, NULL, 1, NOW(), NOW(), 1),
('PINOT-SANTA-750', 'Santa Pinot Noir Reserva', 'vino', 'Bodegas Santa', 'Pinot Noir', 'Río Negro, Argentina', 2021, 'Pinot elegante con aromas a frutas rojas frescas y taninos sedosos.', 4200.00, 18, NULL, 1, NOW(), NOW(), 1),
('CABERNET-NORTON-750', 'Norton Cabernet Sauvignon Crianza', 'vino', 'Bodegas Norton', 'Cabernet Sauvignon', 'Mendoza, Argentina', 2020, 'Cabernet de guarda con estructura compleja y final persistente.', 4800.00, 14, NULL, 1, NOW(), NOW(), 1),
('CHARDONNAY-CATENA-750', 'Catena Chardonnay', 'vino', 'Bodegas Catena', 'Chardonnay', 'Mendoza, Argentina', 2023, 'Chardonnay fresco con notas de mantequilla y frutas amarillas.', 5200.00, 20, NULL, 1, NOW(), NOW(), 1),
('SYRAH-ACHÁVAL-750', 'Achaval-Ferrer Syrah', 'vino', 'Bodegas Achaval-Ferrer', 'Syrah', 'Mendoza, Argentina', 2021, 'Syrah intenso con especias y frutos negros. Gran potencial de envejecimiento.', 6500.00, 12, NULL, 1, NOW(), NOW(), 1),
('MALBEC-SUSANA-750', 'Susana Balbo Signature Malbec', 'vino', 'Susana Balbo Wines', 'Malbec', 'Salta, Argentina', 2021, 'Malbec de altura con elegancia y frescura característica de Salta.', 6000.00, 16, NULL, 1, NOW(), NOW(), 1),
('BONARDA-LUIGI-750', 'Luigi Bosca Bonarda', 'vino', 'Luigi Bosca', 'Bonarda', 'Mendoza, Argentina', 2022, 'Bonarda jugoso y fácil de beber, perfecto para picadas.', 3000.00, 30, NULL, 1, NOW(), NOW(), 1),
('MERLOT-TOLO-750', 'Atómica Merlot', 'vino', 'Atómica Wines', 'Merlot', 'Mendoza, Argentina', 2022, 'Merlot suave con aromas de ciruela y chocolate.', 3800.00, 22, NULL, 1, NOW(), NOW(), 1),
('ROSÉ-SANTA-750', 'Santa Rosé de Malbec', 'vino', 'Bodegas Santa', 'Malbec', 'Mendoza, Argentina', 2023, 'Rosado pálido y refrescante, ideal para primavera y verano.', 3200.00, 28, NULL, 1, NOW(), NOW(), 1),
('BLEND-TAMA-750', 'Tamajón Red Blend', 'vino', 'Tamajón', 'Malbec-Cabernet', 'Mendoza, Argentina', 2021, 'Blend armónico que combina lo mejor de dos variedades nobles.', 5500.00, 17, NULL, 1, NOW(), NOW(), 1),
('ESPUMANTE-CHANDON-750', 'Chandon Classic Brut', 'espumante', 'Bodega Chandon', NULL, 'Mendoza, Argentina', 2023, 'Espumante clásico con burbujas finas y notas cítricas. Perfecto para celebraciones.', 4500.00, 35, NULL, 1, NOW(), NOW(), 1),
('ESPUMANTE-PEÑAFLOR-750', 'Peñaflor Brut Nature', 'espumante', 'Bodega Peñaflor', NULL, 'Mendoza, Argentina', 2023, 'Espumante seco y mineral con carácter elegante.', 3800.00, 28, NULL, 1, NOW(), NOW(), 1),
('ESPUMANTE-TRUMP-750', 'Trump Tinto Brut', 'espumante', 'Bodega Trump', NULL, 'San Juan, Argentina', 2022, 'Espumante tinto con complejidad y frescura.', 4200.00, 20, NULL, 1, NOW(), NOW(), 1),
('ESPUMANTE-RENACER-750', 'Renacer Rosé Brut', 'espumante', 'Bodega Renacer', NULL, 'La Pampa, Argentina', 2023, 'Espumante rosado con aromas a frutos berries.', 3900.00, 25, NULL, 1, NOW(), NOW(), 1),
('WHISKY-AUCHENTOSHAN-700', 'Auchentoshan Three Wood', 'whisky', 'Auchentoshan Distillery', NULL, 'Escocia', NULL, 'Whisky escocés triple destilado con notas de roble y frutas maduras.', 12000.00, 8, NULL, 1, NOW(), NOW(), 1),
('WHISKY-GLENMORANGIE-700', 'Glenmorangie The Original', 'whisky', 'Glenmorangie Distillery', NULL, 'Escocia', NULL, 'Whisky Highland clásico con 10 años de envejecimiento. Suave y aromático.', 10500.00, 10, NULL, 1, NOW(), NOW(), 1),
('WHISKY-OBAN-700', 'Oban 14 Years Old', 'whisky', 'Oban Distillery', NULL, 'Escocia', NULL, 'Whisky de los Highlands con carácter robusto y ahumado.', 13500.00, 6, NULL, 1, NOW(), NOW(), 1),
('WHISKY-HIGHLAND-700', 'Highland Park 18', 'whisky', 'Highland Park Distillery', NULL, 'Escocia', NULL, 'Whisky Islay con equilibrio perfecto entre turbación y dulzura.', 15000.00, 5, NULL, 1, NOW(), NOW(), 1),
('GIN-HENDRICKS-700', 'Hendrick\'s Gin', 'gin', 'Hendrick\'s Distillery', NULL, 'Escocia', NULL, 'Gin premium infusionado con pepino y especias. Tónica es esencial.', 9000.00, 12, NULL, 1, NOW(), NOW(), 1),
('GIN-TANQUERAY-700', 'Tanqueray London Dry', 'gin', 'Tanqueray Distillery', NULL, 'Inglaterra', NULL, 'Gin clásico London Dry con junípero prominente y sabor seco.', 7500.00, 18, NULL, 1, NOW(), NOW(), 1),
('GIN-BOMBAY-700', 'Bombay Sapphire', 'gin', 'Bombay Distillery', NULL, 'Inglaterra', NULL, 'Gin premium con 10 botánicos diferentes. Color azul característico.', 8500.00, 15, NULL, 1, NOW(), NOW(), 1),
('GIN-GORDON-700', 'Gordon\'s London Dry', 'gin', 'Gordon\'s Distillery', NULL, 'Inglaterra', NULL, 'Gin tradicional con sabor a botánicos clásicos, ideal para martinis.', 6800.00, 20, NULL, 1, NOW(), NOW(), 1),
('LICOR-BAILEYS-750', 'Baileys Irish Cream', 'licor', 'Baileys', NULL, 'Irlanda', NULL, 'Licor cremoso con chocolate e whisky. Perfecto para postres.', 5200.00, 22, NULL, 1, NOW(), NOW(), 1),
('LICOR-KAHLUA-750', 'Kahlúa Original', 'licor', 'Kahlúa', NULL, 'México', NULL, 'Licor de café mexicano con dulzura y cuerpo completo.', 5900.00, 18, NULL, 1, NOW(), NOW(), 1),
('LICOR-AMARETTO-750', 'Amaretto di Saronno', 'licor', 'Saronno', NULL, 'Italia', NULL, 'Licor de almendra italiana con aroma delicado y sabor suave.', 4800.00, 16, NULL, 1, NOW(), NOW(), 1),
('LICOR-COINTREAU-750', 'Cointreau', 'licor', 'Cointreau', NULL, 'Francia', NULL, 'Licor de naranja de clase mundial, ingrediente de cócteles clásicos.', 7200.00, 11, NULL, 1, NOW(), NOW(), 1),
('CERVEZA-QUILMES-473', 'Quilmes Clásica', 'cerveza', 'Cervecería Quilmes', NULL, 'Argentina', NULL, 'Cerveza rubia ligera y refrescante, la marca argentina por excelencia.', 450.00, 100, NULL, 1, NOW(), NOW(), 1),
('CERVEZA-STELLA-500', 'Stella Artois', 'cerveza', 'Stella Artois', NULL, 'Bélgica', NULL, 'Cerveza pilsen belga premium con 600 años de tradición.', 850.00, 45, NULL, 1, NOW(), NOW(), 1),
('CERVEZA-CORONA-355', 'Corona Extra', 'cerveza', 'Corona', NULL, 'México', NULL, 'Cerveza mexicana clara y crujiente, tradicional con limón.', 650.00, 60, NULL, 1, NOW(), NOW(), 1),
('CERVEZA-HEINEKEN-500', 'Heineken Premium', 'cerveza', 'Heineken', NULL, 'Holanda', NULL, 'Cerveza holandesa con calidad consistente y sabor balanceado.', 750.00, 55, NULL, 1, NOW(), NOW(), 1),
('CERVEZA-IPA-ANTARES-473', 'Antares IPA', 'cerveza', 'Cervecería Antares', NULL, 'Argentina', NULL, 'India Pale Ale de lúpulo pronunciado con amargor característico.', 600.00, 30, NULL, 1, NOW(), NOW(), 1),
('MALBEC-DECERO-750', 'Decero Malbec', 'vino', 'Bodegas Decero', 'Malbec', 'Mendoza, Argentina', 2022, 'Malbec moderno con expresión pura de la variedad y terroir.', 7500.00, 14, NULL, 1, NOW(), NOW(), 1),
('VINO-MALAMADRE-750', 'Mala Madre Rojo', 'vino', 'Mala Madre', 'Blend', 'Río Negro, Argentina', 2021, 'Blend joven y atrevido con personalidad propia y precio accesible.', 2800.00, 26, NULL, 1, NOW(), NOW(), 1),
('VINO-RIGLOS-750', 'Riglos Premium Red', 'vino', 'Bodega Riglos', 'Malbec', 'San Juan, Argentina', 2020, 'Vino de valor excepcional con calidad de bodega grande.', 3400.00, 24, NULL, 1, NOW(), NOW(), 1),
('ESPUMANTE-EXTRA-BRUT-750', 'Finca Pedregal Extra Brut', 'espumante', 'Finca Pedregal', NULL, 'Mendoza, Argentina', 2022, 'Espumante ultra seco para paladares más sofisticados.', 5100.00, 19, NULL, 1, NOW(), NOW(), 1),
('GIN-NACIONAL-ANCHO-700', 'Ancho Gin Nacional', 'gin', 'Destilería Ancho', NULL, 'Argentina', NULL, 'Gin argentino artesanal con botánicos locales.', 8200.00, 14, NULL, 1, NOW(), NOW(), 1),
('LICOR-JÄGERMEISTER-700', 'Jägermeister', 'licor', 'Jägermeister', NULL, 'Alemania', NULL, 'Licor digestivo con 56 botánicos. Tradicional tomarse congelado.', 4500.00, 20, NULL, 1, NOW(), NOW(), 1),
('CERVEZA-BRAHMA-473', 'Brahma', 'cerveza', 'Brahma', NULL, 'Brasil', NULL, 'Cerveza brasileña con carácter suave y refrescante.', 500.00, 80, NULL, 1, NOW(), NOW(), 1),
('VINO-TINTO-SANTA-RITA-750', 'Santa Rita Casa Real Merlot', 'vino', 'Bodega Santa Rita', 'Merlot', 'Aconcagua Valley, Chile', 2021, 'Merlot chileno con perfil frutal marcado y taninos suaves.', 6800.00, 11, NULL, 1, NOW(), NOW(), 1),
('WHISKY-JOHNNIE-WALKER-700', 'Johnnie Walker Red Label', 'whisky', 'Johnnie Walker', NULL, 'Escocia', NULL, 'Blended Scotch Whisky accesible con carácter ahumado.', 9500.00, 13, NULL, 1, NOW(), NOW(), 1);

-- =====================================================
-- promotions (20 promociones sin end_at)
-- =====================================================
INSERT INTO promotions (
    product_id, promotion_type, parameter_value, visible_text, start_at, end_at, is_active, created_by_admin_id, created_at, updated_at
) VALUES
(1, 'porcentaje', 15.00, '15% OFF en Malbec Álamos', NOW(), NULL, 1, 1, NOW(), NOW()),
(2, 'precio_fijo', 3800.00, 'Pinot Santa a $3800', NOW(), NULL, 1, 1, NOW(), NOW()),
(3, '2x1', 0.00, '2x1 en Cabernet Norton', NOW(), NULL, 1, 1, NOW(), NOW()),
(4, 'porcentaje', 10.00, '10% OFF Chardonnay Catena', NOW(), NULL, 1, 1, NOW(), NOW()),
(5, 'precio_fijo', 5800.00, 'Syrah Achaval a $5800', NOW(), NULL, 1, 1, NOW(), NOW()),
(6, '3x2', 0.00, '3x2 en Susana Balbo Signature', NOW(), NULL, 1, 1, NOW(), NOW()),
(11, 'porcentaje', 20.00, '20% OFF Champagne Chandon', NOW(), NULL, 1, 1, NOW(), NOW()),
(15, 'precio_fijo', 11000.00, 'Auchentoshan a $11000', NOW(), NULL, 1, 1, NOW(), NOW()),
(19, '2x1', 0.00, '2x1 en Hendrick\'s Gin', NOW(), NULL, 1, 1, NOW(), NOW()),
(22, 'porcentaje', 12.00, '12% OFF Baileys Irish Cream', NOW(), NULL, 1, 1, NOW(), NOW()),
(26, 'precio_fijo', 9200.00, 'Quilmes caja x10 a $4500', NOW(), NULL, 1, 1, NOW(), NOW()),
(31, 'porcentaje', 18.00, '18% OFF Decero Malbec', NOW(), NULL, 1, 1, NOW(), NOW()),
(32, '3x2', 0.00, '3x2 en Mala Madre Tinto', NOW(), NULL, 1, 1, NOW(), NOW()),
(33, 'porcentaje', 14.00, '14% OFF Riglos Premium', NOW(), NULL, 1, 1, NOW(), NOW()),
(34, 'precio_fijo', 4600.00, 'Espumante Finca Pedregal a $4600', NOW(), NULL, 1, 1, NOW(), NOW()),
(35, '2x1', 0.00, '2x1 en Ancho Gin', NOW(), NULL, 1, 1, NOW(), NOW()),
(36, 'porcentaje', 16.00, '16% OFF Jägermeister', NOW(), NULL, 1, 1, NOW(), NOW()),
(37, 'precio_fijo', 7200.00, 'Santa Rita Casa Real a $7200', NOW(), NULL, 1, 1, NOW(), NOW()),
(38, '3x2', 0.00, '3x2 en Johnnie Walker Red', NOW(), NULL, 1, 1, NOW(), NOW()),
(9, 'porcentaje', 13.00, '13% OFF en Luigi Bosca Bonarda', NOW(), NULL, 1, 1, NOW(), NOW());

-- =====================================================
-- consult_events (eventos de consulta realistas - últimos 30 días)
-- =====================================================
INSERT INTO consult_events (product_id, occurred_at, channel, context_info) VALUES
(1, NOW(), 'QR', 'estanteria_vinos_tintos'),
(1, DATE_SUB(NOW(), INTERVAL 2 HOUR), 'BUSQUEDA', 'busqueda_malbec'),
(2, DATE_SUB(NOW(), INTERVAL 4 HOUR), 'QR', 'display_promociones'),
(3, DATE_SUB(NOW(), INTERVAL 8 HOUR), 'BUSQUEDA', 'busqueda_cabernet'),
(4, DATE_SUB(NOW(), INTERVAL 1 DAY), 'QR', 'estanteria_blancos'),
(5, DATE_SUB(NOW(), INTERVAL 1 DAY), 'BUSQUEDA', 'busqueda_syrah'),
(6, DATE_SUB(NOW(), INTERVAL 2 DAY), 'QR', 'degustacion_evento'),
(7, DATE_SUB(NOW(), INTERVAL 2 DAY), 'BUSQUEDA', 'busqueda_bonarda'),
(8, DATE_SUB(NOW(), INTERVAL 3 DAY), 'QR', 'estanteria_vinos_tintos'),
(9, DATE_SUB(NOW(), INTERVAL 3 DAY), 'BUSQUEDA', 'busqueda_rosado'),
(10, DATE_SUB(NOW(), INTERVAL 4 DAY), 'QR', 'promocion_blend'),
(11, DATE_SUB(NOW(), INTERVAL 4 DAY), 'BUSQUEDA', 'busqueda_espumante'),
(11, DATE_SUB(NOW(), INTERVAL 5 DAY), 'QR', 'estanteria_espumantes'),
(12, DATE_SUB(NOW(), INTERVAL 5 DAY), 'BUSQUEDA', 'busqueda_brut'),
(13, DATE_SUB(NOW(), INTERVAL 6 DAY), 'QR', 'display_espumantes'),
(14, DATE_SUB(NOW(), INTERVAL 6 DAY), 'BUSQUEDA', 'busqueda_rosado_brut'),
(15, DATE_SUB(NOW(), INTERVAL 7 DAY), 'QR', 'zona_whisky_premium'),
(16, DATE_SUB(NOW(), INTERVAL 8 DAY), 'BUSQUEDA', 'busqueda_whisky_escocia'),
(17, DATE_SUB(NOW(), INTERVAL 8 DAY), 'QR', 'estanteria_whisky'),
(18, DATE_SUB(NOW(), INTERVAL 9 DAY), 'BUSQUEDA', 'busqueda_highland_park'),
(19, DATE_SUB(NOW(), INTERVAL 10 DAY), 'QR', 'zona_gin'),
(20, DATE_SUB(NOW(), INTERVAL 10 DAY), 'BUSQUEDA', 'busqueda_gin_premium'),
(21, DATE_SUB(NOW(), INTERVAL 11 DAY), 'QR', 'display_gin'),
(22, DATE_SUB(NOW(), INTERVAL 12 DAY), 'BUSQUEDA', 'busqueda_licores'),
(23, DATE_SUB(NOW(), INTERVAL 12 DAY), 'QR', 'estanteria_licores'),
(24, DATE_SUB(NOW(), INTERVAL 13 DAY), 'BUSQUEDA', 'busqueda_kahlua'),
(25, DATE_SUB(NOW(), INTERVAL 14 DAY), 'QR', 'zona_cerveza'),
(26, DATE_SUB(NOW(), INTERVAL 14 DAY), 'BUSQUEDA', 'busqueda_cerveza_argentina'),
(27, DATE_SUB(NOW(), INTERVAL 15 DAY), 'QR', 'estanteria_cerveza'),
(28, DATE_SUB(NOW(), INTERVAL 16 DAY), 'BUSQUEDA', 'busqueda_stella'),
(29, DATE_SUB(NOW(), INTERVAL 16 DAY), 'QR', 'display_cervezas'),
(30, DATE_SUB(NOW(), INTERVAL 17 DAY), 'BUSQUEDA', 'busqueda_corona'),
(1, DATE_SUB(NOW(), INTERVAL 18 DAY), 'QR', 'estanteria_vinos_tintos'),
(1, DATE_SUB(NOW(), INTERVAL 19 DAY), 'BUSQUEDA', 'busqueda_recomendaciones'),
(2, DATE_SUB(NOW(), INTERVAL 20 DAY), 'QR', 'promocion_pinot'),
(3, DATE_SUB(NOW(), INTERVAL 21 DAY), 'BUSQUEDA', 'busqueda_cabernet'),
(4, DATE_SUB(NOW(), INTERVAL 22 DAY), 'QR', 'degustacion_evento'),
(5, DATE_SUB(NOW(), INTERVAL 23 DAY), 'BUSQUEDA', 'busqueda_premium'),
(6, DATE_SUB(NOW(), INTERVAL 24 DAY), 'QR', 'estanteria_vinos_tintos'),
(7, DATE_SUB(NOW(), INTERVAL 25 DAY), 'BUSQUEDA', 'busqueda_accesible'),
(11, DATE_SUB(NOW(), INTERVAL 26 DAY), 'QR', 'zona_espumantes'),
(11, DATE_SUB(NOW(), INTERVAL 27 DAY), 'BUSQUEDA', 'busqueda_celebracion'),
(15, DATE_SUB(NOW(), INTERVAL 28 DAY), 'QR', 'estanteria_whisky'),
(19, DATE_SUB(NOW(), INTERVAL 29 DAY), 'BUSQUEDA', 'busqueda_gin_london_dry'),
(22, DATE_SUB(NOW(), INTERVAL 30 DAY), 'QR', 'zona_licores'),
(26, DATE_SUB(NOW(), INTERVAL 30 DAY), 'BUSQUEDA', 'busqueda_promocionales');

-- =====================================================
-- consult_events (eventos de consulta realistas - últimos 90 días, 5 consultas/día, 30 productos)
-- =====================================================
INSERT INTO consult_events (product_id, occurred_at, channel, context_info) VALUES
-- Generado automáticamente: 5 eventos por día, 30 productos, 90 días
-- Ejemplo: (producto, fecha, canal, contexto)
-- Día 1
(1, DATE_SUB(NOW(), INTERVAL 89 DAY), 'QR', 'góndola_A1'),
(2, DATE_SUB(NOW(), INTERVAL 89 DAY), 'BUSQUEDA', 'busqueda_web'),
(3, DATE_SUB(NOW(), INTERVAL 89 DAY), 'QR', 'evento_vip'),
(4, DATE_SUB(NOW(), INTERVAL 89 DAY), 'BUSQUEDA', 'degustacion'),
(5, DATE_SUB(NOW(), INTERVAL 89 DAY), 'QR', 'góndola_B2'),
-- Día 2
(6, DATE_SUB(NOW(), INTERVAL 88 DAY), 'BUSQUEDA', 'busqueda_app'),
(7, DATE_SUB(NOW(), INTERVAL 88 DAY), 'QR', 'góndola_C3'),
(8, DATE_SUB(NOW(), INTERVAL 88 DAY), 'BUSQUEDA', 'evento_vip'),
(9, DATE_SUB(NOW(), INTERVAL 88 DAY), 'QR', 'góndola_A1'),
(10, DATE_SUB(NOW(), INTERVAL 88 DAY), 'BUSQUEDA', 'busqueda_web'),
-- Día 3
(11, DATE_SUB(NOW(), INTERVAL 87 DAY), 'QR', 'degustacion'),
(12, DATE_SUB(NOW(), INTERVAL 87 DAY), 'BUSQUEDA', 'góndola_B2'),
(13, DATE_SUB(NOW(), INTERVAL 87 DAY), 'QR', 'busqueda_app'),
(14, DATE_SUB(NOW(), INTERVAL 87 DAY), 'BUSQUEDA', 'góndola_C3'),
(15, DATE_SUB(NOW(), INTERVAL 87 DAY), 'QR', 'evento_vip'),
-- Día 4
(16, DATE_SUB(NOW(), INTERVAL 86 DAY), 'BUSQUEDA', 'góndola_A1'),
(17, DATE_SUB(NOW(), INTERVAL 86 DAY), 'QR', 'busqueda_web'),
(18, DATE_SUB(NOW(), INTERVAL 86 DAY), 'BUSQUEDA', 'degustacion'),
(19, DATE_SUB(NOW(), INTERVAL 86 DAY), 'QR', 'góndola_B2'),
(20, DATE_SUB(NOW(), INTERVAL 86 DAY), 'BUSQUEDA', 'busqueda_app'),
-- Día 5
(21, DATE_SUB(NOW(), INTERVAL 85 DAY), 'QR', 'góndola_C3'),
(22, DATE_SUB(NOW(), INTERVAL 85 DAY), 'BUSQUEDA', 'evento_vip'),
(23, DATE_SUB(NOW(), INTERVAL 85 DAY), 'QR', 'góndola_A1'),
(24, DATE_SUB(NOW(), INTERVAL 85 DAY), 'BUSQUEDA', 'busqueda_web'),
(25, DATE_SUB(NOW(), INTERVAL 85 DAY), 'QR', 'degustacion'),
-- Día 6
(26, DATE_SUB(NOW(), INTERVAL 84 DAY), 'BUSQUEDA', 'góndola_B2'),
(27, DATE_SUB(NOW(), INTERVAL 84 DAY), 'QR', 'busqueda_app'),
(28, DATE_SUB(NOW(), INTERVAL 84 DAY), 'BUSQUEDA', 'góndola_C3'),
(29, DATE_SUB(NOW(), INTERVAL 84 DAY), 'QR', 'evento_vip'),
(30, DATE_SUB(NOW(), INTERVAL 84 DAY), 'BUSQUEDA', 'góndola_A1'),
-- Día 7
(1, DATE_SUB(NOW(), INTERVAL 83 DAY), 'QR', 'góndola_B2'),
(2, DATE_SUB(NOW(), INTERVAL 83 DAY), 'BUSQUEDA', 'busqueda_app'),
(3, DATE_SUB(NOW(), INTERVAL 83 DAY), 'QR', 'evento_vip'),
(4, DATE_SUB(NOW(), INTERVAL 83 DAY), 'BUSQUEDA', 'degustacion'),
(5, DATE_SUB(NOW(), INTERVAL 83 DAY), 'QR', 'góndola_C3'),
-- Día 8
(6, DATE_SUB(NOW(), INTERVAL 82 DAY), 'BUSQUEDA', 'busqueda_web'),
(7, DATE_SUB(NOW(), INTERVAL 82 DAY), 'QR', 'góndola_A1'),
(8, DATE_SUB(NOW(), INTERVAL 82 DAY), 'BUSQUEDA', 'evento_vip'),
(9, DATE_SUB(NOW(), INTERVAL 82 DAY), 'QR', 'góndola_B2'),
(10, DATE_SUB(NOW(), INTERVAL 82 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 9
(11, DATE_SUB(NOW(), INTERVAL 81 DAY), 'QR', 'góndola_C3'),
(12, DATE_SUB(NOW(), INTERVAL 81 DAY), 'BUSQUEDA', 'busqueda_app'),
(13, DATE_SUB(NOW(), INTERVAL 81 DAY), 'QR', 'evento_vip'),
(14, DATE_SUB(NOW(), INTERVAL 81 DAY), 'BUSQUEDA', 'góndola_A1'),
(15, DATE_SUB(NOW(), INTERVAL 81 DAY), 'QR', 'busqueda_web'),
-- Día 10
(16, DATE_SUB(NOW(), INTERVAL 80 DAY), 'BUSQUEDA', 'degustacion'),
(17, DATE_SUB(NOW(), INTERVAL 80 DAY), 'QR', 'góndola_B2'),
(18, DATE_SUB(NOW(), INTERVAL 80 DAY), 'BUSQUEDA', 'busqueda_app'),
(19, DATE_SUB(NOW(), INTERVAL 80 DAY), 'QR', 'evento_vip'),
(20, DATE_SUB(NOW(), INTERVAL 80 DAY), 'BUSQUEDA', 'góndola_C3'),
-- Día 11
(21, DATE_SUB(NOW(), INTERVAL 79 DAY), 'QR', 'góndola_A1'),
(22, DATE_SUB(NOW(), INTERVAL 79 DAY), 'BUSQUEDA', 'busqueda_web'),
(23, DATE_SUB(NOW(), INTERVAL 79 DAY), 'QR', 'degustacion'),
(24, DATE_SUB(NOW(), INTERVAL 79 DAY), 'BUSQUEDA', 'góndola_B2'),
(25, DATE_SUB(NOW(), INTERVAL 79 DAY), 'QR', 'evento_vip'),
-- Día 12
(26, DATE_SUB(NOW(), INTERVAL 78 DAY), 'BUSQUEDA', 'busqueda_app'),
(27, DATE_SUB(NOW(), INTERVAL 78 DAY), 'QR', 'góndola_C3'),
(28, DATE_SUB(NOW(), INTERVAL 78 DAY), 'BUSQUEDA', 'degustacion'),
(29, DATE_SUB(NOW(), INTERVAL 78 DAY), 'QR', 'góndola_A1'),
(30, DATE_SUB(NOW(), INTERVAL 78 DAY), 'BUSQUEDA', 'busqueda_web'),
-- Día 13
(1, DATE_SUB(NOW(), INTERVAL 77 DAY), 'QR', 'evento_vip'),
(2, DATE_SUB(NOW(), INTERVAL 77 DAY), 'BUSQUEDA', 'degustacion'),
(3, DATE_SUB(NOW(), INTERVAL 77 DAY), 'QR', 'góndola_B2'),
(4, DATE_SUB(NOW(), INTERVAL 77 DAY), 'BUSQUEDA', 'busqueda_app'),
(5, DATE_SUB(NOW(), INTERVAL 77 DAY), 'QR', 'góndola_C3'),
-- Día 14
(6, DATE_SUB(NOW(), INTERVAL 76 DAY), 'BUSQUEDA', 'evento_vip'),
(7, DATE_SUB(NOW(), INTERVAL 76 DAY), 'QR', 'góndola_A1'),
(8, DATE_SUB(NOW(), INTERVAL 76 DAY), 'BUSQUEDA', 'busqueda_web'),
(9, DATE_SUB(NOW(), INTERVAL 76 DAY), 'QR', 'degustacion'),
(10, DATE_SUB(NOW(), INTERVAL 76 DAY), 'BUSQUEDA', 'góndola_B2'),
-- Día 15
(11, DATE_SUB(NOW(), INTERVAL 75 DAY), 'QR', 'góndola_C3'),
(12, DATE_SUB(NOW(), INTERVAL 75 DAY), 'BUSQUEDA', 'evento_vip'),
(13, DATE_SUB(NOW(), INTERVAL 75 DAY), 'QR', 'góndola_A1'),
(14, DATE_SUB(NOW(), INTERVAL 75 DAY), 'BUSQUEDA', 'busqueda_app'),
(15, DATE_SUB(NOW(), INTERVAL 75 DAY), 'QR', 'góndola_B2'),
-- Día 16
(16, DATE_SUB(NOW(), INTERVAL 74 DAY), 'BUSQUEDA', 'degustacion'),
(17, DATE_SUB(NOW(), INTERVAL 74 DAY), 'QR', 'evento_vip'),
(18, DATE_SUB(NOW(), INTERVAL 74 DAY), 'BUSQUEDA', 'góndola_C3'),
(19, DATE_SUB(NOW(), INTERVAL 74 DAY), 'QR', 'góndola_A1'),
(20, DATE_SUB(NOW(), INTERVAL 74 DAY), 'BUSQUEDA', 'busqueda_web'),
-- Día 17
(21, DATE_SUB(NOW(), INTERVAL 73 DAY), 'QR', 'degustacion'),
(22, DATE_SUB(NOW(), INTERVAL 73 DAY), 'BUSQUEDA', 'evento_vip'),
(23, DATE_SUB(NOW(), INTERVAL 73 DAY), 'QR', 'góndola_B2'),
(24, DATE_SUB(NOW(), INTERVAL 73 DAY), 'BUSQUEDA', 'busqueda_app'),
(25, DATE_SUB(NOW(), INTERVAL 73 DAY), 'QR', 'góndola_C3'),
-- Día 18
(26, DATE_SUB(NOW(), INTERVAL 72 DAY), 'BUSQUEDA', 'evento_vip'),
(27, DATE_SUB(NOW(), INTERVAL 72 DAY), 'QR', 'góndola_A1'),
(28, DATE_SUB(NOW(), INTERVAL 72 DAY), 'BUSQUEDA', 'busqueda_web'),
(29, DATE_SUB(NOW(), INTERVAL 72 DAY), 'QR', 'degustacion'),
(30, DATE_SUB(NOW(), INTERVAL 72 DAY), 'BUSQUEDA', 'góndola_B2'),
-- Día 19
(1, DATE_SUB(NOW(), INTERVAL 71 DAY), 'QR', 'góndola_C3'),
(2, DATE_SUB(NOW(), INTERVAL 71 DAY), 'BUSQUEDA', 'evento_vip'),
(3, DATE_SUB(NOW(), INTERVAL 71 DAY), 'QR', 'góndola_A1'),
(4, DATE_SUB(NOW(), INTERVAL 71 DAY), 'BUSQUEDA', 'busqueda_web'),
(5, DATE_SUB(NOW(), INTERVAL 71 DAY), 'QR', 'degustacion'),
-- Día 20
(6, DATE_SUB(NOW(), INTERVAL 70 DAY), 'BUSQUEDA', 'góndola_B2'),
(7, DATE_SUB(NOW(), INTERVAL 70 DAY), 'QR', 'busqueda_app'),
(8, DATE_SUB(NOW(), INTERVAL 70 DAY), 'BUSQUEDA', 'góndola_C3'),
(9, DATE_SUB(NOW(), INTERVAL 70 DAY), 'QR', 'evento_vip'),
(10, DATE_SUB(NOW(), INTERVAL 70 DAY), 'BUSQUEDA', 'góndola_A1'),
-- Día 21
(11, DATE_SUB(NOW(), INTERVAL 69 DAY), 'QR', 'góndola_B2'),
(12, DATE_SUB(NOW(), INTERVAL 69 DAY), 'BUSQUEDA', 'busqueda_app'),
(13, DATE_SUB(NOW(), INTERVAL 69 DAY), 'QR', 'evento_vip'),
(14, DATE_SUB(NOW(), INTERVAL 69 DAY), 'BUSQUEDA', 'degustacion'),
(15, DATE_SUB(NOW(), INTERVAL 69 DAY), 'QR', 'góndola_C3'),
-- Día 22
(16, DATE_SUB(NOW(), INTERVAL 68 DAY), 'BUSQUEDA', 'góndola_A1'),
(17, DATE_SUB(NOW(), INTERVAL 68 DAY), 'QR', 'busqueda_web'),
(18, DATE_SUB(NOW(), INTERVAL 68 DAY), 'BUSQUEDA', 'evento_vip'),
(19, DATE_SUB(NOW(), INTERVAL 68 DAY), 'QR', 'góndola_B2'),
(20, DATE_SUB(NOW(), INTERVAL 68 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 23
(21, DATE_SUB(NOW(), INTERVAL 67 DAY), 'QR', 'góndola_C3'),
(22, DATE_SUB(NOW(), INTERVAL 67 DAY), 'BUSQUEDA', 'busqueda_app'),
(23, DATE_SUB(NOW(), INTERVAL 67 DAY), 'QR', 'evento_vip'),
(24, DATE_SUB(NOW(), INTERVAL 67 DAY), 'BUSQUEDA', 'góndola_A1'),
(25, DATE_SUB(NOW(), INTERVAL 67 DAY), 'QR', 'busqueda_web'),
-- Día 24
(26, DATE_SUB(NOW(), INTERVAL 66 DAY), 'BUSQUEDA', 'degustacion'),
(27, DATE_SUB(NOW(), INTERVAL 66 DAY), 'QR', 'evento_vip'),
(28, DATE_SUB(NOW(), INTERVAL 66 DAY), 'BUSQUEDA', 'góndola_B2'),
(29, DATE_SUB(NOW(), INTERVAL 66 DAY), 'QR', 'busqueda_app'),
(30, DATE_SUB(NOW(), INTERVAL 66 DAY), 'BUSQUEDA', 'góndola_C3'),
-- Día 25
(1, DATE_SUB(NOW(), INTERVAL 65 DAY), 'QR', 'góndola_A1'),
(2, DATE_SUB(NOW(), INTERVAL 65 DAY), 'BUSQUEDA', 'busqueda_web'),
(3, DATE_SUB(NOW(), INTERVAL 65 DAY), 'QR', 'degustacion'),
(4, DATE_SUB(NOW(), INTERVAL 65 DAY), 'BUSQUEDA', 'evento_vip'),
(5, DATE_SUB(NOW(), INTERVAL 65 DAY), 'QR', 'góndola_B2'),
-- Día 26
(6, DATE_SUB(NOW(), INTERVAL 64 DAY), 'BUSQUEDA', 'busqueda_app'),
(7, DATE_SUB(NOW(), INTERVAL 64 DAY), 'QR', 'góndola_C3'),
(8, DATE_SUB(NOW(), INTERVAL 64 DAY), 'BUSQUEDA', 'degustacion'),
(9, DATE_SUB(NOW(), INTERVAL 64 DAY), 'QR', 'góndola_A1'),
(10, DATE_SUB(NOW(), INTERVAL 64 DAY), 'BUSQUEDA', 'busqueda_web'),
-- Día 27
(11, DATE_SUB(NOW(), INTERVAL 63 DAY), 'QR', 'evento_vip'),
(12, DATE_SUB(NOW(), INTERVAL 63 DAY), 'BUSQUEDA', 'degustacion'),
(13, DATE_SUB(NOW(), INTERVAL 63 DAY), 'QR', 'góndola_B2'),
(14, DATE_SUB(NOW(), INTERVAL 63 DAY), 'BUSQUEDA', 'busqueda_app'),
(15, DATE_SUB(NOW(), INTERVAL 63 DAY), 'QR', 'góndola_C3'),
-- Día 28
(16, DATE_SUB(NOW(), INTERVAL 62 DAY), 'BUSQUEDA', 'evento_vip'),
(17, DATE_SUB(NOW(), INTERVAL 62 DAY), 'QR', 'góndola_A1'),
(18, DATE_SUB(NOW(), INTERVAL 62 DAY), 'BUSQUEDA', 'busqueda_web'),
(19, DATE_SUB(NOW(), INTERVAL 62 DAY), 'QR', 'degustacion'),
(20, DATE_SUB(NOW(), INTERVAL 62 DAY), 'BUSQUEDA', 'góndola_B2'),
-- Día 29
(21, DATE_SUB(NOW(), INTERVAL 61 DAY), 'QR', 'góndola_C3'),
(22, DATE_SUB(NOW(), INTERVAL 61 DAY), 'BUSQUEDA', 'evento_vip'),
(23, DATE_SUB(NOW(), INTERVAL 61 DAY), 'QR', 'góndola_A1'),
(24, DATE_SUB(NOW(), INTERVAL 61 DAY), 'BUSQUEDA', 'busqueda_web'),
(25, DATE_SUB(NOW(), INTERVAL 61 DAY), 'QR', 'degustacion'),
-- Día 30
(26, DATE_SUB(NOW(), INTERVAL 60 DAY), 'BUSQUEDA', 'góndola_B2'),
(27, DATE_SUB(NOW(), INTERVAL 60 DAY), 'QR', 'busqueda_app'),
(28, DATE_SUB(NOW(), INTERVAL 60 DAY), 'BUSQUEDA', 'góndola_C3'),
(29, DATE_SUB(NOW(), INTERVAL 60 DAY), 'QR', 'evento_vip'),
(30, DATE_SUB(NOW(), INTERVAL 60 DAY), 'BUSQUEDA', 'góndola_A1'),
-- Día 31
(1, DATE_SUB(NOW(), INTERVAL 59 DAY), 'QR', 'góndola_B2'),
(2, DATE_SUB(NOW(), INTERVAL 59 DAY), 'BUSQUEDA', 'busqueda_app'),
(3, DATE_SUB(NOW(), INTERVAL 59 DAY), 'QR', 'evento_vip'),
(4, DATE_SUB(NOW(), INTERVAL 59 DAY), 'BUSQUEDA', 'degustacion'),
(5, DATE_SUB(NOW(), INTERVAL 59 DAY), 'QR', 'góndola_C3'),
-- Día 32
(6, DATE_SUB(NOW(), INTERVAL 58 DAY), 'BUSQUEDA', 'busqueda_web'),
(7, DATE_SUB(NOW(), INTERVAL 58 DAY), 'QR', 'góndola_A1'),
(8, DATE_SUB(NOW(), INTERVAL 58 DAY), 'BUSQUEDA', 'evento_vip'),
(9, DATE_SUB(NOW(), INTERVAL 58 DAY), 'QR', 'góndola_B2'),
(10, DATE_SUB(NOW(), INTERVAL 58 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 33
(11, DATE_SUB(NOW(), INTERVAL 57 DAY), 'QR', 'góndola_C3'),
(12, DATE_SUB(NOW(), INTERVAL 57 DAY), 'BUSQUEDA', 'busqueda_app'),
(13, DATE_SUB(NOW(), INTERVAL 57 DAY), 'QR', 'evento_vip'),
(14, DATE_SUB(NOW(), INTERVAL 57 DAY), 'BUSQUEDA', 'degustacion'),
(15, DATE_SUB(NOW(), INTERVAL 57 DAY), 'QR', 'góndola_A1'),
-- Día 34
(16, DATE_SUB(NOW(), INTERVAL 56 DAY), 'BUSQUEDA', 'góndola_B2'),
(17, DATE_SUB(NOW(), INTERVAL 56 DAY), 'QR', 'busqueda_web'),
(18, DATE_SUB(NOW(), INTERVAL 56 DAY), 'BUSQUEDA', 'evento_vip'),
(19, DATE_SUB(NOW(), INTERVAL 56 DAY), 'QR', 'góndola_C3'),
(20, DATE_SUB(NOW(), INTERVAL 56 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 35
(21, DATE_SUB(NOW(), INTERVAL 55 DAY), 'QR', 'góndola_A1'),
(22, DATE_SUB(NOW(), INTERVAL 55 DAY), 'BUSQUEDA', 'busqueda_app'),
(23, DATE_SUB(NOW(), INTERVAL 55 DAY), 'QR', 'evento_vip'),
(24, DATE_SUB(NOW(), INTERVAL 55 DAY), 'BUSQUEDA', 'degustacion'),
(25, DATE_SUB(NOW(), INTERVAL 55 DAY), 'QR', 'góndola_B2'),
-- Día 36
(26, DATE_SUB(NOW(), INTERVAL 54 DAY), 'BUSQUEDA', 'góndola_C3'),
(27, DATE_SUB(NOW(), INTERVAL 54 DAY), 'QR', 'busqueda_web'),
(28, DATE_SUB(NOW(), INTERVAL 54 DAY), 'BUSQUEDA', 'evento_vip'),
(29, DATE_SUB(NOW(), INTERVAL 54 DAY), 'QR', 'góndola_A1'),
(30, DATE_SUB(NOW(), INTERVAL 54 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 37
(1, DATE_SUB(NOW(), INTERVAL 53 DAY), 'QR', 'góndola_B2'),
(2, DATE_SUB(NOW(), INTERVAL 53 DAY), 'BUSQUEDA', 'busqueda_app'),
(3, DATE_SUB(NOW(), INTERVAL 53 DAY), 'QR', 'evento_vip'),
(4, DATE_SUB(NOW(), INTERVAL 53 DAY), 'BUSQUEDA', 'degustacion'),
(5, DATE_SUB(NOW(), INTERVAL 53 DAY), 'QR', 'góndola_C3'),
-- Día 38
(6, DATE_SUB(NOW(), INTERVAL 52 DAY), 'BUSQUEDA', 'busqueda_web'),
(7, DATE_SUB(NOW(), INTERVAL 52 DAY), 'QR', 'góndola_A1'),
(8, DATE_SUB(NOW(), INTERVAL 52 DAY), 'BUSQUEDA', 'evento_vip'),
(9, DATE_SUB(NOW(), INTERVAL 52 DAY), 'QR', 'góndola_B2'),
(10, DATE_SUB(NOW(), INTERVAL 52 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 39
(11, DATE_SUB(NOW(), INTERVAL 51 DAY), 'QR', 'góndola_C3'),
(12, DATE_SUB(NOW(), INTERVAL 51 DAY), 'BUSQUEDA', 'busqueda_app'),
(13, DATE_SUB(NOW(), INTERVAL 51 DAY), 'QR', 'evento_vip'),
(14, DATE_SUB(NOW(), INTERVAL 51 DAY), 'BUSQUEDA', 'degustacion'),
(15, DATE_SUB(NOW(), INTERVAL 51 DAY), 'QR', 'góndola_A1'),
-- Día 40
(16, DATE_SUB(NOW(), INTERVAL 50 DAY), 'BUSQUEDA', 'góndola_B2'),
(17, DATE_SUB(NOW(), INTERVAL 50 DAY), 'QR', 'busqueda_web'),
(18, DATE_SUB(NOW(), INTERVAL 50 DAY), 'BUSQUEDA', 'evento_vip'),
(19, DATE_SUB(NOW(), INTERVAL 50 DAY), 'QR', 'góndola_C3'),
(20, DATE_SUB(NOW(), INTERVAL 50 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 41
(21, DATE_SUB(NOW(), INTERVAL 49 DAY), 'QR', 'góndola_A1'),
(22, DATE_SUB(NOW(), INTERVAL 49 DAY), 'BUSQUEDA', 'busqueda_app'),
(23, DATE_SUB(NOW(), INTERVAL 49 DAY), 'QR', 'evento_vip'),
(24, DATE_SUB(NOW(), INTERVAL 49 DAY), 'BUSQUEDA', 'degustacion'),
(25, DATE_SUB(NOW(), INTERVAL 49 DAY), 'QR', 'góndola_B2'),
-- Día 42
(26, DATE_SUB(NOW(), INTERVAL 48 DAY), 'BUSQUEDA', 'góndola_C3'),
(27, DATE_SUB(NOW(), INTERVAL 48 DAY), 'QR', 'busqueda_web'),
(28, DATE_SUB(NOW(), INTERVAL 48 DAY), 'BUSQUEDA', 'evento_vip'),
(29, DATE_SUB(NOW(), INTERVAL 48 DAY), 'QR', 'góndola_A1'),
(30, DATE_SUB(NOW(), INTERVAL 48 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 43
(1, DATE_SUB(NOW(), INTERVAL 47 DAY), 'QR', 'góndola_B2'),
(2, DATE_SUB(NOW(), INTERVAL 47 DAY), 'BUSQUEDA', 'busqueda_app'),
(3, DATE_SUB(NOW(), INTERVAL 47 DAY), 'QR', 'evento_vip'),
(4, DATE_SUB(NOW(), INTERVAL 47 DAY), 'BUSQUEDA', 'degustacion'),
(5, DATE_SUB(NOW(), INTERVAL 47 DAY), 'QR', 'góndola_C3'),
-- Día 44
(6, DATE_SUB(NOW(), INTERVAL 46 DAY), 'BUSQUEDA', 'busqueda_web'),
(7, DATE_SUB(NOW(), INTERVAL 46 DAY), 'QR', 'góndola_A1'),
(8, DATE_SUB(NOW(), INTERVAL 46 DAY), 'BUSQUEDA', 'evento_vip'),
(9, DATE_SUB(NOW(), INTERVAL 46 DAY), 'QR', 'góndola_B2'),
(10, DATE_SUB(NOW(), INTERVAL 46 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 45
(11, DATE_SUB(NOW(), INTERVAL 45 DAY), 'QR', 'góndola_C3'),
(12, DATE_SUB(NOW(), INTERVAL 45 DAY), 'BUSQUEDA', 'busqueda_app'),
(13, DATE_SUB(NOW(), INTERVAL 45 DAY), 'QR', 'evento_vip'),
(14, DATE_SUB(NOW(), INTERVAL 45 DAY), 'BUSQUEDA', 'degustacion'),
(15, DATE_SUB(NOW(), INTERVAL 45 DAY), 'QR', 'góndola_A1'),
-- Día 46
(16, DATE_SUB(NOW(), INTERVAL 44 DAY), 'BUSQUEDA', 'góndola_B2'),
(17, DATE_SUB(NOW(), INTERVAL 44 DAY), 'QR', 'busqueda_web'),
(18, DATE_SUB(NOW(), INTERVAL 44 DAY), 'BUSQUEDA', 'evento_vip'),
(19, DATE_SUB(NOW(), INTERVAL 44 DAY), 'QR', 'góndola_C3'),
(20, DATE_SUB(NOW(), INTERVAL 44 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 47
(21, DATE_SUB(NOW(), INTERVAL 43 DAY), 'QR', 'góndola_A1'),
(22, DATE_SUB(NOW(), INTERVAL 43 DAY), 'BUSQUEDA', 'busqueda_app'),
(23, DATE_SUB(NOW(), INTERVAL 43 DAY), 'QR', 'evento_vip'),
(24, DATE_SUB(NOW(), INTERVAL 43 DAY), 'BUSQUEDA', 'degustacion'),
(25, DATE_SUB(NOW(), INTERVAL 43 DAY), 'QR', 'góndola_B2'),
-- Día 48
(26, DATE_SUB(NOW(), INTERVAL 42 DAY), 'BUSQUEDA', 'góndola_C3'),
(27, DATE_SUB(NOW(), INTERVAL 42 DAY), 'QR', 'busqueda_web'),
(28, DATE_SUB(NOW(), INTERVAL 42 DAY), 'BUSQUEDA', 'evento_vip'),
(29, DATE_SUB(NOW(), INTERVAL 42 DAY), 'QR', 'góndola_A1'),
(30, DATE_SUB(NOW(), INTERVAL 42 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 49
(1, DATE_SUB(NOW(), INTERVAL 41 DAY), 'QR', 'góndola_B2'),
(2, DATE_SUB(NOW(), INTERVAL 41 DAY), 'BUSQUEDA', 'busqueda_app'),
(3, DATE_SUB(NOW(), INTERVAL 41 DAY), 'QR', 'evento_vip'),
(4, DATE_SUB(NOW(), INTERVAL 41 DAY), 'BUSQUEDA', 'degustacion'),
(5, DATE_SUB(NOW(), INTERVAL 41 DAY), 'QR', 'góndola_C3'),
-- Día 50
(6, DATE_SUB(NOW(), INTERVAL 40 DAY), 'BUSQUEDA', 'busqueda_web'),
(7, DATE_SUB(NOW(), INTERVAL 40 DAY), 'QR', 'góndola_A1'),
(8, DATE_SUB(NOW(), INTERVAL 40 DAY), 'BUSQUEDA', 'evento_vip'),
(9, DATE_SUB(NOW(), INTERVAL 40 DAY), 'QR', 'góndola_B2'),
(10, DATE_SUB(NOW(), INTERVAL 40 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 51
(11, DATE_SUB(NOW(), INTERVAL 39 DAY), 'QR', 'góndola_C3'),
(12, DATE_SUB(NOW(), INTERVAL 39 DAY), 'BUSQUEDA', 'busqueda_app'),
(13, DATE_SUB(NOW(), INTERVAL 39 DAY), 'QR', 'evento_vip'),
(14, DATE_SUB(NOW(), INTERVAL 39 DAY), 'BUSQUEDA', 'degustacion'),
(15, DATE_SUB(NOW(), INTERVAL 39 DAY), 'QR', 'góndola_A1'),
-- Día 52
(16, DATE_SUB(NOW(), INTERVAL 38 DAY), 'BUSQUEDA', 'góndola_B2'),
(17, DATE_SUB(NOW(), INTERVAL 38 DAY), 'QR', 'busqueda_web'),
(18, DATE_SUB(NOW(), INTERVAL 38 DAY), 'BUSQUEDA', 'evento_vip'),
(19, DATE_SUB(NOW(), INTERVAL 38 DAY), 'QR', 'góndola_C3'),
(20, DATE_SUB(NOW(), INTERVAL 38 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 53
(21, DATE_SUB(NOW(), INTERVAL 37 DAY), 'QR', 'góndola_A1'),
(22, DATE_SUB(NOW(), INTERVAL 37 DAY), 'BUSQUEDA', 'busqueda_app'),
(23, DATE_SUB(NOW(), INTERVAL 37 DAY), 'QR', 'evento_vip'),
(24, DATE_SUB(NOW(), INTERVAL 37 DAY), 'BUSQUEDA', 'degustacion'),
(25, DATE_SUB(NOW(), INTERVAL 37 DAY), 'QR', 'góndola_B2'),
-- Día 54
(26, DATE_SUB(NOW(), INTERVAL 36 DAY), 'BUSQUEDA', 'góndola_C3'),
(27, DATE_SUB(NOW(), INTERVAL 36 DAY), 'QR', 'busqueda_web'),
(28, DATE_SUB(NOW(), INTERVAL 36 DAY), 'BUSQUEDA', 'evento_vip'),
(29, DATE_SUB(NOW(), INTERVAL 36 DAY), 'QR', 'góndola_A1'),
(30, DATE_SUB(NOW(), INTERVAL 36 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 55
(1, DATE_SUB(NOW(), INTERVAL 35 DAY), 'QR', 'góndola_B2'),
(2, DATE_SUB(NOW(), INTERVAL 35 DAY), 'BUSQUEDA', 'busqueda_app'),
(3, DATE_SUB(NOW(), INTERVAL 35 DAY), 'QR', 'evento_vip'),
(4, DATE_SUB(NOW(), INTERVAL 35 DAY), 'BUSQUEDA', 'degustacion'),
(5, DATE_SUB(NOW(), INTERVAL 35 DAY), 'QR', 'góndola_C3'),
-- Día 56
(6, DATE_SUB(NOW(), INTERVAL 34 DAY), 'BUSQUEDA', 'busqueda_web'),
(7, DATE_SUB(NOW(), INTERVAL 34 DAY), 'QR', 'góndola_A1'),
(8, DATE_SUB(NOW(), INTERVAL 34 DAY), 'BUSQUEDA', 'evento_vip'),
(9, DATE_SUB(NOW(), INTERVAL 34 DAY), 'QR', 'góndola_B2'),
(10, DATE_SUB(NOW(), INTERVAL 34 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 57
(11, DATE_SUB(NOW(), INTERVAL 33 DAY), 'QR', 'góndola_C3'),
(12, DATE_SUB(NOW(), INTERVAL 33 DAY), 'BUSQUEDA', 'busqueda_app'),
(13, DATE_SUB(NOW(), INTERVAL 33 DAY), 'QR', 'evento_vip'),
(14, DATE_SUB(NOW(), INTERVAL 33 DAY), 'BUSQUEDA', 'degustacion'),
(15, DATE_SUB(NOW(), INTERVAL 33 DAY), 'QR', 'góndola_A1'),
-- Día 58
(16, DATE_SUB(NOW(), INTERVAL 32 DAY), 'BUSQUEDA', 'góndola_B2'),
(17, DATE_SUB(NOW(), INTERVAL 32 DAY), 'QR', 'busqueda_web'),
(18, DATE_SUB(NOW(), INTERVAL 32 DAY), 'BUSQUEDA', 'evento_vip'),
(19, DATE_SUB(NOW(), INTERVAL 32 DAY), 'QR', 'góndola_C3'),
(20, DATE_SUB(NOW(), INTERVAL 32 DAY), 'BUSQUEDA', 'degustacion'),
-- Día 59
(21, DATE_SUB(NOW(), INTERVAL 31 DAY), 'QR', 'góndola_A1'),
(22, DATE_SUB(NOW(), INTERVAL 31 DAY), 'BUSQUEDA', 'busqueda_app'),
(23, DATE_SUB(NOW(), INTERVAL 31 DAY), 'QR', 'evento_vip'),
(24, DATE_SUB(NOW(), INTERVAL 31 DAY), 'BUSQUEDA', 'degustacion'),
(25, DATE_SUB(NOW(), INTERVAL 31 DAY), 'QR', 'góndola_B2'),
-- Día 60
(26, DATE_SUB(NOW(), INTERVAL 30 DAY), 'BUSQUEDA', 'góndola_C3'),
(27, DATE_SUB(NOW(), INTERVAL 30 DAY), 'QR', 'busqueda_web'),
(28, DATE_SUB(NOW(), INTERVAL 30 DAY), 'BUSQUEDA', 'evento_vip'),
(29, DATE_SUB(NOW(), INTERVAL 30 DAY), 'QR', 'góndola_A1'),
(30, DATE_SUB(NOW(), INTERVAL 30 DAY), 'BUSQUEDA', 'degustacion');
