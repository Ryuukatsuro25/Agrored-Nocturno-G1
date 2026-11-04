-- db/schema.sql · ms-productos · AgroRed S.A.S.
-- Se ejecuta conectado como productos_user sobre la base productos_db:
--   mysql -u productos_user -p productos_db
--   mysql> SOURCE db/schema.sql;
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

DROP TABLE IF EXISTS productos;

CREATE TABLE productos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100)  NOT NULL UNIQUE,
  categoria  VARCHAR(20)   NOT NULL,
  unidad     VARCHAR(10)   NOT NULL,
  precio     DECIMAL(12,2) NOT NULL
);

INSERT INTO productos (nombre, categoria, unidad, precio) VALUES
  ('Mango Tommy',       'fruta',     'kg',   6500),
  ('Tomate chonto',     'hortaliza', 'kg',   3200),
  ('Pulpa de maracuyá', 'procesado', 'caja', 48000);
