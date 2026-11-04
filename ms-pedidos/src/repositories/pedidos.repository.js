// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) — versión MySQL (Taller 2)
// Única capa que sabe DÓNDE se guardan los datos. Las funciones conservan
// el mismo nombre, los mismos parámetros y el mismo tipo de resultado que
// la versión en memoria del Taller 1: por eso las demás capas no cambian.
// Todas las consultas son parametrizadas (?): evitan la inyección SQL.
// =====================================================================
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM pedidos';
  const condiciones = [];
  const valores = [];
  if (filtros.estado) {                     // ?estado=recibido
    condiciones.push('estado = ?');
    valores.push(filtros.estado);
  }
  if (filtros.cliente_id) {                 // ?cliente_id=2
    condiciones.push('cliente_id = ?');
    valores.push(filtros.cliente_id);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(pedido) {
  const [resultado] = await pool.query(
    `INSERT INTO pedidos (cliente_id, producto_id, cantidad, centro_distribucion, estado, fecha)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [pedido.cliente_id, pedido.producto_id, pedido.cantidad, pedido.centro_distribucion, pedido.estado, pedido.fecha]);
  return findById(resultado.insertId);     // MySQL devuelve el id generado
}

async function update(id, pedido) {
  const [resultado] = await pool.query(
    `UPDATE pedidos SET cliente_id = ?, producto_id = ?, cantidad = ?, centro_distribucion = ?,
     estado = ?, fecha = ? WHERE id = ?`,
    [pedido.cliente_id, pedido.producto_id, pedido.cantidad, pedido.centro_distribucion, pedido.estado, pedido.fecha, id]);
  return resultado.affectedRows > 0 ? findById(id) : null;
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM pedidos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;       // true si borró una fila
}

module.exports = { findAll, findById, create, update, remove };
