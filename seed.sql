-- ============================================================
-- DATOS DE PRUEBA — E-commerce de Productos de Cómputo
-- ============================================================
-- 1. Reemplaza 'TU_UUID_AQUI' con el UUID de auth.users
--    (Sácarlo de Supabase > Authentication > Users)
-- 2. Ejecuta en el SQL Editor de Supabase
-- 3. Se puede ejecutar múltiples veces sin errores
-- ============================================================

DO $$
DECLARE
  vendor_uuid UUID := 'TU_UUID_AQUI';
  cat_almacenamiento UUID;
  cat_perifericos UUID;
BEGIN

  -- ─── PERFIL DEL VENDEDOR ───────────────────────────────
  INSERT INTO profiles (id, full_name, role) 
  VALUES (vendor_uuid, 'TechStore Chile', 'vendor')
  ON CONFLICT (id) DO UPDATE SET role = 'vendor';
  RAISE NOTICE '✅ Perfil listo';

  -- ─── CATEGORÍAS PRINCIPALES ────────────────────────────
  INSERT INTO categories (name, slug, parent_id) VALUES
    ('Procesadores', 'procesadores', NULL),
    ('Memorias RAM', 'memorias-ram', NULL),
    ('Almacenamiento', 'almacenamiento', NULL),
    ('Periféricos', 'perifericos', NULL),
    ('Gabinete y Fuentes', 'gabinete-fuentes', NULL),
    ('Tarjetas de Video', 'tarjetas-de-video', NULL)
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO cat_almacenamiento FROM categories WHERE slug = 'almacenamiento';
  SELECT id INTO cat_perifericos FROM categories WHERE slug = 'perifericos';

  -- ─── SUBCATEGORÍAS ─────────────────────────────────────
  INSERT INTO categories (name, slug, parent_id) VALUES
    ('SSD', 'ssd', cat_almacenamiento),
    ('HDD', 'hdd', cat_almacenamiento),
    ('Teclados', 'teclados', cat_perifericos),
    ('Mouse', 'mouse', cat_perifericos),
    ('Auriculares', 'auriculares', cat_perifericos)
  ON CONFLICT (slug) DO NOTHING;
  RAISE NOTICE '✅ Categorías listas';

  -- ─── PROVEEDORES ───────────────────────────────────────
  INSERT INTO suppliers (vendor_id, name, contact_name, email, phone, address, notes) VALUES
    (vendor_uuid, 'Importadora AsiaTech', 'Carlos Lin', 'carlos@asiatech.com', '+56 9 1234 5678', 'Santiago, Chile', 'Proveedor principal'),
    (vendor_uuid, 'Distribuidora PCWorld', 'María González', 'maria@pcworld.cl', '+56 9 8765 4321', 'Santiago, Chile', NULL)
  ON CONFLICT DO NOTHING;
  RAISE NOTICE '✅ Proveedores listos';

  -- ─── PRODUCTOS ─────────────────────────────────────────
  INSERT INTO products (vendor_id, category_id, name, slug, description, brand, model, specs, price, stock_quantity, is_active)
  VALUES
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'procesadores'),    'Ryzen 7 7800X3D',              'ryzen-7-7800x3d',             'Procesador AMD de 8 núcleos y 16 hilos con 3D V-Cache.',             'AMD',     '7800X3D',         '{"Núcleos": 8, "Hilos": 16, "Frecuencia base": "4.2 GHz", "Frecuencia turbo": "5.0 GHz", "Socket": "AM5", "TDP": "120W"}'::jsonb,        549990, 15, true),
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'procesadores'),    'Intel Core i5-14600K',          'intel-core-i5-14600k',        'Procesador Intel 14ª gen con 14 núcleos (6P+8E).',                   'Intel',   'i5-14600K',       '{"Núcleos": "14 (6P+8E)", "Hilos": 20, "Frecuencia base": "3.5 GHz", "Frecuencia turbo": "5.3 GHz", "Socket": "LGA1700", "TDP": "125W"}'::jsonb, 349990, 22, true),
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'memorias-ram'),     'Kingston Fury Beast DDR5 32GB', 'kingston-fury-beast-ddr5-32gb', 'Kit 2x16GB DDR5 a 5600MHz con heatsink.',                           'Kingston', 'KF556C36BBEK2-32', '{"Capacidad": "32GB (2x16GB)", "Tipo": "DDR5", "Velocidad": "5600 MHz", "Latencia": "CL36", "Voltaje": "1.25V"}'::jsonb, 129990, 30, true),
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'ssd'),              'Samsung 990 Pro 1TB NVMe',     'samsung-990-pro-1tb',         'SSD NVMe M.2 con lectura 7450 MB/s.',                                'Samsung', 'MZ-V9P1T0BW',    '{"Capacidad": "1TB", "Tipo": "NVMe M.2", "Lectura": "7450 MB/s", "Escritura": "6900 MB/s"}'::jsonb, 189990, 18, true),
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'mouse'),            'Logitech G Pro X Superlight',  'logitech-g-pro-x-superlight',  'Mouse inalámbrico ultra-ligero 63g con sensor HERO 25K.',            'Logitech', 'G Pro X Superlight', '{"Peso": "63g", "Sensor": "HERO 25K", "DPI máx": 25600, "Autonomía": "70 horas"}'::jsonb, 149990, 12, true),
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'teclados'),         'Teclado Mecánico Redragon Kumara', 'teclado-mecanico-redragon-kumara', 'Teclado mecánico 60% RGB.',                                         'Redragon', 'K552-RGB',        '{"Formato": "60%", "Switches": "Redragon", "Retroiluminación": "RGB", "Conexión": "USB-C"}'::jsonb, 49990, 25, true),
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'tarjetas-de-video'), 'NVIDIA GeForce RTX 4070 Ti',   'nvidia-geforce-rtx-4070-ti',  'Tarjeta gráfica Ada Lovelace 12GB GDDR6X.',                          'NVIDIA',  'RTX 4070 Ti',     '{"VRAM": "12GB GDDR6X", "CUDA Cores": 7680, "Boost clock": "2610 MHz", "TDP": "285W"}'::jsonb, 899990, 8, true),
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'gabinete-fuentes'),  'Gabinete NZXT H5 Flow',        'gabinete-nzxt-h5-flow',       'Mid-tower vidrio templado con flujo de aire optimizado.',            'NZXT',    'H5 Flow',         '{"Factor": "Mid-Tower", "Panel lateral": "Vidrio templado", "Ventiladores incluidos": 2}'::jsonb, 89990, 10, true),
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'hdd'),               'Western Digital 2TB HDD',      'western-digital-2tb-hdd',     'Disco duro 2TB 7200RPM para almacenamiento masivo.',                 'Western Digital', 'WD20EZBX',  '{"Capacidad": "2TB", "Velocidad": "7200 RPM", "Caché": "256MB"}'::jsonb, 49990, 20, true),
    (vendor_uuid, (SELECT id FROM categories WHERE slug = 'auriculares'),       'Auriculares HyperX Cloud II',  'auriculares-hyperx-cloud-ii', 'Auriculares gaming 7.1 virtual con micrófono desmontable.',          'HyperX',  'Cloud II',        '{"Tipo": "Over-ear", "Sonido": "7.1 virtual", "Micrófono": "Desmontable"}'::jsonb, 79990, 14, true)
  ON CONFLICT (vendor_id, slug) DO NOTHING;
  RAISE NOTICE '✅ Productos listos';

  -- ─── PROVEEDORES DE PRODUCTOS ──────────────────────────
  INSERT INTO product_suppliers (product_id, supplier_id, vendor_id, cost_price, is_primary)
  SELECT pr.id, s.id, pr.vendor_id, pr.price * 0.7, true
  FROM products pr
  CROSS JOIN suppliers s
  WHERE s.vendor_id = pr.vendor_id
    AND pr.vendor_id = vendor_uuid
  ON CONFLICT (product_id, supplier_id) DO NOTHING;
  RAISE NOTICE '✅ Relaciones producto-proveedor listas';

  -- ─── MOVIMIENTOS DE STOCK ──────────────────────────────
  INSERT INTO stock_movements (product_id, vendor_id, quantity_change, reason, note)
  SELECT id, vendor_id, stock_quantity, 'purchase', 'Stock inicial'
  FROM products
  WHERE vendor_id = vendor_uuid
  ON CONFLICT DO NOTHING;
  RAISE NOTICE '✅ Movimientos de stock inicial listos';

  RAISE NOTICE '✅ ¡Todos los datos de prueba insertados correctamente!';
END $$;

-- ─── VERIFICACIÓN ─────────────────────────────────────────
SELECT 
  p.name AS producto,
  '$' || p.price AS precio,
  p.stock_quantity AS stock,
  c.name AS categoria,
  CASE WHEN p.is_active THEN 'Activo' ELSE 'Inactivo' END AS estado
FROM products p
JOIN categories c ON c.id = p.category_id
ORDER BY c.name, p.name;
