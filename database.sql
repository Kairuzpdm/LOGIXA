-- Script de Creación e Inicialización de la Base de Datos para XAMPP
-- Nombre de la Base de Datos: logistica_db

CREATE DATABASE IF NOT EXISTS logistica_db;
USE logistica_db;

-- 1. TABLA DE USUARIOS (Administradores y Repartidores)
-- Las contraseñas están hasheadas usando bcrypt (para la clave 'admin123' y 'driver123')
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'repartidor') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE PRODUCTOS (ERP - Gestión de Inventario)
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    sku VARCHAR(50) UNIQUE
);

-- 3. TABLA DE CLIENTES (CRM - Gestión de Relaciones y Geolocalización)
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(255) NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL
);

-- 4. TABLA DE PEDIDOS (Gestión de Distribución y Rutas)
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    estado ENUM('pendiente', 'en_ruta', 'entregado', 'incidencia') DEFAULT 'pendiente',
    repartidor_id INT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (repartidor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 5. TABLA DE UBICACIONES EN VIVO DE REPARTIDORES (Tracking en Tiempo Real)
CREATE TABLE IF NOT EXISTS ubicaciones_repartidores (
    repartidor_id INT PRIMARY KEY,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (repartidor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================================================
-- INSERCIÓN DE DATOS DE DEMOSTRACIÓN (Madrid, España como zona operativa)
-- Contraseñas encriptadas con bcryptjs:
-- 'admin123' -> $2a$10$mdsXgcqMch1cp5HfugH7GOak6UO9gT3L0GGcxUF2BT5k8PIon1lVa
-- 'driver123' -> $2a$10$XHkjIgSnCgGY7jb3Fyc4se9PaXLdXFX9NYRBG78ubnPxQQS6G22Qy
-- ============================================================================

-- Insertar Usuarios de Prueba
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador del Sistema', 'admin@logistica.com', '$2a$10$mdsXgcqMch1cp5HfugH7GOak6UO9gT3L0GGcxUF2BT5k8PIon1lVa', 'admin'),
('Carlos Gómez (Repartidor Moto)', 'carlos.repartidor@logistica.com', '$2a$10$XHkjIgSnCgGY7jb3Fyc4se9PaXLdXFX9NYRBG78ubnPxQQS6G22Qy', 'repartidor'),
('Laura Pérez (Repartidor Bici)', 'laura.repartidor@logistica.com', '$2a$10$XHkjIgSnCgGY7jb3Fyc4se9PaXLdXFX9NYRBG78ubnPxQQS6G22Qy', 'repartidor');

-- Insertar Productos en Inventario (ERP)
INSERT INTO productos (nombre, descripcion, precio, stock, sku) VALUES
('Caja de Herramientas Pro', 'Caja de herramientas de acero con 150 piezas', 89.99, 25, 'SKU-TOOL-150'),
('Auriculares Inalámbricos ANC', 'Auriculares con cancelación activa de ruido y Bluetooth 5.2', 120.00, 40, 'SKU-EAR-ANC'),
('Cafetera de Goteo Smart', 'Cafetera programable con conexión WiFi y jarra de vidrio', 59.50, 15, 'SKU-COF-SMART'),
('Teclado Mecánico RGB', 'Teclado con switches mecánicos brown y retroiluminación', 75.00, 30, 'SKU-KEY-BROWN');

-- Insertar Clientes en el CRM (Geolocalizados en el área metropolitana de Madrid)
INSERT INTO clientes (nombre, email, telefono, direccion, latitud, longitud) VALUES
('Sofía Martínez', 'sofia.martinez@gmail.com', '+34600111222', 'Calle de Alcalá, 45, 28014 Madrid', 40.41890000, -3.69680000),
('Alejandro Ruiz', 'alejandro.ruiz@hotmail.com', '+34600333444', 'Plaza de España, 8, 28008 Madrid', 40.42400000, -3.71200000),
('Elena Belmonte', 'elena.bel@gmail.com', '+34600555666', 'Paseo de la Infanta Isabel, 15, 28007 Madrid (Atocha)', 40.40680000, -3.69230000),
('Javier Ortiz', 'javier.ortiz@yahoo.es', '+34600777888', 'Calle de Ferraz, 1, 28008 Madrid (Debod)', 40.42430000, -3.71770000);

-- Insertar Pedidos iniciales
INSERT INTO pedidos (cliente_id, producto_id, cantidad, estado, repartidor_id) VALUES
(1, 2, 1, 'pendiente', NULL), -- Pedido de Sofía (Auriculares)
(2, 1, 1, 'pendiente', NULL), -- Pedido de Alejandro (Caja de herramientas)
(3, 4, 2, 'pendiente', NULL); -- Pedido de Elena (2 Teclados)

-- Inicializar Ubicaciones en Vivo para los repartidores (Punto de inicio: Almacén Central / Puerta del Sol, Madrid)
INSERT INTO ubicaciones_repartidores (repartidor_id, latitud, longitud) VALUES
(2, 40.41677500, -3.70379000),
(3, 40.41677500, -3.70379000);
