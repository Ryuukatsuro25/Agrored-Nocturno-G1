// src/repositories/usuarios.repository.js — versión MySQL
const pool = require('../db');

// MySQL guarda BOOLEAN como 0/1: el repositorio lo traduce al formato del contrato
function aUsuario(fila) {
  return { ...fila, activo: Boolean(fila.activo) };
}

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM usuarios';
  const condiciones = [];
  const valores = [];
  if (filtros.rol) {
    condiciones.push('rol = ?');
    valores.push(filtros.rol);
  }
  if (filtros.ids) {                       // ?ids=1,2,3 → WHERE id IN (1, 2, 3)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas.map(aUsuario);
}

async function findById(id) {
  // ? es un parámetro: el valor viaja aparte de la consulta (evita inyección SQL)
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return filas.length > 0 ? aUsuario(filas[0]) : null;
}

async function findByEmail(email) {
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return filas.length > 0 ? aUsuario(filas[0]) : null;
}

async function create(usuario) {
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (nombre, email, rol, activo) VALUES (?, ?, ?, ?)',
    [usuario.nombre, usuario.email, usuario.rol, usuario.activo]);
  return findById(resultado.insertId);     // MySQL devuelve el id generado
}

async function update(id, usuario) {
  const [resultado] = await pool.query(
    'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?',
    [usuario.nombre, usuario.email, usuario.rol, usuario.activo, id]);
  if (resultado.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByEmail, create, update, remove };
