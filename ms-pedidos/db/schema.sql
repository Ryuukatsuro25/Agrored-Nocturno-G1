-- db/schema.sql · ms-pedidos · AgroRed S.A.S.
-- Se ejecuta conectado como pedidos_user sobre la base pedidos_db:
--   mysql -u pedidos_user -p pedidos_db
--   mysql> SOURCE db/schema.sql;
-- cliente_id y producto_id son enteros normales SIN FOREIGN KEY: los clientes y
-- los productos viven en otras bases de datos, de otros microservicios. Que existan
-- lo valida ms-pedidos consultando a ms-clientes y ms-productos por REST.
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

DROP TABLE IF EXISTS pedidos;

CREATE TABLE pedidos (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id           INT         NOT NULL,
  producto_id          INT         NOT NULL,
  cantidad             INT         NOT NULL,
  centro_distribucion  VARCHAR(20) NOT NULL,
  estado               VARCHAR(20) NOT NULL DEFAULT 'recibido',
  fecha                DATE        NOT NULL
);

INSERT INTO pedidos (cliente_id, producto_id, cantidad, centro_distribucion, estado, fecha) VALUES
  (1, 1, 120, 'Cali',   'despachado', '2026-10-20'),
  (2, 2,  80, 'Bogotá', 'recibido',   '2026-10-26'),
  (3, 3,  15, 'Bogotá', 'entregado',  '2026-10-15');
