-- Bases de datos de producción de AgroRed (Taller 3, Módulo 3)
-- Ejecutar en servidor1 (172.16.1.198) con: sudo mysql
-- Reemplazar <clave...> por la contraseña acordada. Las claves NO se suben al repositorio.
-- Cada usuario solo puede conectarse desde servidor2 (172.16.1.199).

CREATE DATABASE usuarios_db;
CREATE USER 'usuarios_user'@'172.16.1.199' IDENTIFIED BY '<claveUsuarios>';
GRANT ALL PRIVILEGES ON usuarios_db.* TO 'usuarios_user'@'172.16.1.199';

CREATE DATABASE productos_db;
CREATE USER 'productos_user'@'172.16.1.199' IDENTIFIED BY '<claveProductos>';
GRANT ALL PRIVILEGES ON productos_db.* TO 'productos_user'@'172.16.1.199';

CREATE DATABASE clientes_db;
CREATE USER 'clientes_user'@'172.16.1.199' IDENTIFIED BY '<claveClientes>';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'172.16.1.199';

CREATE DATABASE pedidos_db;
CREATE USER 'pedidos_user'@'172.16.1.199' IDENTIFIED BY '<clavePedidos>';
GRANT ALL PRIVILEGES ON pedidos_db.* TO 'pedidos_user'@'172.16.1.199';
