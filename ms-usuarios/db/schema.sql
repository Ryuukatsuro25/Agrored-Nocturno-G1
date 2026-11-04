-- db/schema.sql
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

CREATE TABLE usuarios (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(100) NOT NULL,
  email   VARCHAR(120) NOT NULL UNIQUE,
  rol     VARCHAR(30)  NOT NULL,
  activo  BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO usuarios (nombre, email, rol, activo) VALUES
  ('Administrador General', 'admin@empresa.com', 'administrador', TRUE),
  ('Laura Gómez', 'laura.gomez@empresa.com', 'administrador', TRUE),
  ('Andrés Castillo', 'andres.castillo@empresa.com', 'administrador', FALSE);
