// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) — versión MySQL (Taller 2)
// Única capa que sabe DÓNDE se guardan los datos. Las funciones conservan
// el mismo nombre, los mismos parámetros y el mismo tipo de resultado que
// la versión en memoria del Taller 1: por eso las demás capas no cambian.
// Todas las consultas son parametrizadas (?): evitan la inyección SQL.
// =====================================================================
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM productos';
  const condiciones = [];
  const valores = [];
  if (filtros.categoria) {                  // ?categoria=fruta
    condiciones.push('categoria = ?');
    valores.push(filtros.categoria);
  }
  if (filtros.ids) {                        // ?ids=1,2,3 → WHERE id IN (1, 2, 3)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

// La intercalación de MySQL (utf8mb4 *_ci) compara sin distinguir mayúsculas:
// 'mango tommy' encuentra 'Mango Tommy'
async function findByNombre(nombre) {
  const [filas] = await pool.query('SELECT * FROM productos WHERE nombre = ?', [nombre]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(producto) {
  const [resultado] = await pool.query(
    'INSERT INTO productos (nombre, categoria, unidad, precio) VALUES (?, ?, ?, ?)',
    [producto.nombre, producto.categoria, producto.unidad, producto.precio]);
  return findById(resultado.insertId);     // MySQL devuelve el id generado
}

async function update(id, producto) {
  const [resultado] = await pool.query(
    'UPDATE productos SET nombre = ?, categoria = ?, unidad = ?, precio = ? WHERE id = ?',
    [producto.nombre, producto.categoria, producto.unidad, producto.precio, id]);
  return resultado.affectedRows > 0 ? findById(id) : null;
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;       // true si borró una fila
}

module.exports = { findAll, findById, findByNombre, create, update, remove };
