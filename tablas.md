 Estructura de Base de Datos - E-commerce de Productos de Cómputo
Tablas con Columnas, Tipos, Restricciones y Relaciones
🔹 1. profiles - Perfiles de Usuario
Columna	Tipo	Restricciones	Descripción
id	UUID	PK, FK → auth.users, NOT NULL	ID del usuario (vinculado a auth)
full_name	TEXT	NULLABLE	Nombre completo
role	TEXT	NOT NULL, CHECK IN ('admin', 'vendor', 'customer'), DEFAULT 'customer'	Rol del usuario
created_at	TIMESTAMPTZ	DEFAULT now()	Fecha de creación
updated_at	TIMESTAMPTZ	DEFAULT now()	Última actualización
Relaciones:

id → auth.users.id (ONE-TO-ONE)

🔹 2. categories - Categorías de Productos
Columna	Tipo	Restricciones	Descripción
id	UUID	PK, DEFAULT uuid_generate_v4()	ID único
name	TEXT	NOT NULL	Nombre de categoría
slug	TEXT	NOT NULL, UNIQUE	Slug para URLs
parent_id	UUID	FK → categories.id, ON DELETE SET NULL	Categoría padre (jerarquía)
created_at	TIMESTAMPTZ	DEFAULT now()	Fecha de creación
Relaciones:

parent_id → categories.id (SELF-REFERENCING)

🔹 3. suppliers - Proveedores por Vendedor
Columna	Tipo	Restricciones	Descripción
id	UUID	PK, DEFAULT uuid_generate_v4()	ID único
vendor_id	UUID	FK → profiles.id, ON DELETE CASCADE, NOT NULL	Vendedor dueño del proveedor
name	TEXT	NOT NULL	Nombre del proveedor
contact_name	TEXT	NULLABLE	Nombre del contacto
email	TEXT	NULLABLE	Email del proveedor
phone	TEXT	NULLABLE	Teléfono
address	TEXT	NULLABLE	Dirección
notes	TEXT	NULLABLE	Notas adicionales
created_at	TIMESTAMPTZ	DEFAULT now()	Fecha de creación
Relaciones:

vendor_id → profiles.id (MANY-TO-ONE)

🔹 4. products - Productos del E-commerce
Columna	Tipo	Restricciones	Descripción
id	UUID	PK, DEFAULT uuid_generate_v4()	ID único
vendor_id	UUID	FK → profiles.id, ON DELETE CASCADE, NOT NULL	Vendedor del producto
category_id	UUID	FK → categories.id, ON DELETE SET NULL	Categoría
name	TEXT	NOT NULL	Nombre del producto
slug	TEXT	NOT NULL	Slug único por vendedor
description	TEXT	NULLABLE	Descripción detallada
brand	TEXT	NULLABLE	Marca (Kingston, Logitech, etc.)
model	TEXT	NULLABLE	Modelo específico
specs	JSONB	DEFAULT '{}'::jsonb	Especificaciones técnicas (RAM: {capacity, speed, type})
price	DECIMAL(10,2)	NOT NULL, CHECK >= 0	Precio de venta
stock_quantity	INT	NOT NULL, DEFAULT 0, CHECK >= 0	Cantidad en stock
main_image	TEXT	NULLABLE	Imagen principal en base64
is_active	BOOLEAN	DEFAULT true	Producto activo/visible
created_at	TIMESTAMPTZ	DEFAULT now()	Fecha de creación
updated_at	TIMESTAMPTZ	DEFAULT now()	Última actualización
Constraints adicionales:

UNIQUE(vendor_id, slug)

Relaciones:

vendor_id → profiles.id (MANY-TO-ONE)

category_id → categories.id (MANY-TO-ONE)

🔹 5. product_suppliers - Relación Producto-Proveedor
Columna	Tipo	Restricciones	Descripción
id	UUID	PK, DEFAULT uuid_generate_v4()	ID único
product_id	UUID	FK → products.id, ON DELETE CASCADE, NOT NULL	Producto
supplier_id	UUID	FK → suppliers.id, ON DELETE CASCADE, NOT NULL	Proveedor
vendor_id	UUID	FK → profiles.id, ON DELETE CASCADE, NOT NULL	Vendedor
cost_price	DECIMAL(10,2)	NULLABLE, CHECK >= 0	Precio de costo
is_primary	BOOLEAN	DEFAULT false	¿Es proveedor principal?
Constraints adicionales:

UNIQUE(product_id, supplier_id)

Relaciones:

product_id → products.id (MANY-TO-ONE)

supplier_id → suppliers.id (MANY-TO-ONE)

vendor_id → profiles.id (MANY-TO-ONE)

🔹 6. product_images - Imágenes de Productos (Base64)
Columna	Tipo	Restricciones	Descripción
id	UUID	PK, DEFAULT uuid_generate_v4()	ID único
product_id	UUID	FK → products.id, ON DELETE CASCADE, NOT NULL	Producto
image_data	TEXT	NOT NULL	Imagen en base64
alt_text	TEXT	NULLABLE	Texto alternativo
sort_order	INT	DEFAULT 0	Orden de visualización
created_at	TIMESTAMPTZ	DEFAULT now()	Fecha de creación
Relaciones:

product_id → products.id (MANY-TO-ONE)

🔹 7. stock_movements - Movimientos de Stock
Columna	Tipo	Restricciones	Descripción
id	UUID	PK, DEFAULT uuid_generate_v4()	ID único
product_id	UUID	FK → products.id, ON DELETE CASCADE, NOT NULL	Producto
vendor_id	UUID	FK → profiles.id, ON DELETE CASCADE, NOT NULL	Vendedor
quantity_change	INT	NOT NULL	Cantidad (positivo=entrada, negativo=salida)
reason	TEXT	NOT NULL	Motivo ('manual_adjustment', 'purchase', 'sale', 'return')
reference_id	UUID	NULLABLE	ID de referencia (orden, ajuste, etc.)
note	TEXT	NULLABLE	Notas adicionales
created_at	TIMESTAMPTZ	DEFAULT now()	Fecha del movimiento
Relaciones:

product_id → products.id (MANY-TO-ONE)

vendor_id → profiles.id (MANY-TO-ONE)

🔹 8. orders - Pedidos (Futuro)
Columna	Tipo	Restricciones	Descripción
id	UUID	PK, DEFAULT uuid_generate_v4()	ID único
customer_id	UUID	FK → profiles.id, NOT NULL	Cliente
status	TEXT	DEFAULT 'pending', CHECK IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')	Estado
total	DECIMAL(10,2)	NOT NULL	Total del pedido
created_at	TIMESTAMPTZ	DEFAULT now()	Fecha de creación
Relaciones:

customer_id → profiles.id (MANY-TO-ONE)

🔹 9. order_items - Items del Pedido (Futuro)
Columna	Tipo	Restricciones	Descripción
id	UUID	PK, DEFAULT uuid_generate_v4()	ID único
order_id	UUID	FK → orders.id, ON DELETE CASCADE, NOT NULL	Pedido
product_id	UUID	FK → products.id, NOT NULL	Producto
quantity	INT	NOT NULL, CHECK > 0	Cantidad
unit_price	DECIMAL(10,2)	NOT NULL	Precio unitario al momento de la compra
vendor_id	UUID	FK → profiles.id, NOT NULL	Vendedor del producto
Relaciones:

order_id → orders.id (MANY-TO-ONE)

product_id → products.id (MANY-TO-ONE)

vendor_id → profiles.id (MANY-TO-ONE)

🗺️ Diagrama de Relaciones (Formato Texto)
text
auth.users (Supabase)
    ↓ 1:1
profiles
    ↓ 1:N (vendor_id)
    ├── products ──→ categories
    │       ↓ 1:N
    │       ├── product_images
    │       ├── stock_movements
    │       └── product_suppliers ←── suppliers
    │
    ├── suppliers (por vendor)
    └── orders (customer_id)
            ↓ 1:N
            order_items (vendor_id, product_id)
📦 Índices para Rendimiento
sql
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_suppliers_vendor ON suppliers(vendor_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_vendor ON stock_movements(vendor_id);
CREATE INDEX idx_product_suppliers_product ON product_suppliers(product_id);
CREATE INDEX idx_product_suppliers_vendor ON product_suppliers(vendor_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
🔐 Políticas RLS Resumen
Tabla	Lectura	Escritura
profiles	Público	Solo el propio usuario
categories	Público	Solo admin
suppliers	Solo vendor (sus proveedores)	Solo vendor
products	Público (activos) / Vendor (todos los suyos)	Solo vendor (sus productos)
product_suppliers	Solo vendor	Solo vendor
product_images	Público	Solo vendor (productos propios)
stock_movements	Solo vendor	Solo vendor
orders	Cliente (sus pedidos) / Vendor (pedidos con sus productos)	Cliente crea, vendor actualiza estado
order_items	Igual que orders	Solo sistema
🎯 Ejemplo de Datos de Muestra
sql
-- Categorías de ejemplo
INSERT INTO categories (name, slug, parent_id) VALUES
('Procesadores', 'procesadores', NULL),
('Memorias RAM', 'memorias-ram', NULL),
('Almacenamiento', 'almacenamiento', NULL),
('SSD', 'ssd', 'id-de-almacenamiento'),
('HDD', 'hdd', 'id-de-almacenamiento'),
('Periféricos', 'perifericos', NULL);

-- Roles disponibles
-- 'admin': Gestión total
-- 'vendor': Gestiona sus productos, proveedores, stock
-- 'customer': Solo compra (cliente final)

