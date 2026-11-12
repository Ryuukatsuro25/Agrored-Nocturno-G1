// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) — versión MySQL
// Única capa que sabe dónde y cómo se guardan los datos.
// =====================================================================
const pool = require('../db');

// Convierte una fila de MySQL al formato del contrato:
// quita password_hash (nunca sale del repositorio) y traduce activo 0/1 → false/true
function aUsuario(fila) {
  const { password_hash, ...usuario } = fila;
  return { ...usuario, activo: Boolean(fila.activo) };
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
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return filas.length > 0 ? aUsuario(filas[0]) : null;
}

async function findByEmail(email) {
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return filas.length > 0 ? aUsuario(filas[0]) : null;
}

// Solo para el inicio de sesión: es la única función que devuelve el hash
async function findCredenciales(email) {
  const [filas] = await pool.query(
    'SELECT id, nombre, email, rol, activo, password_hash FROM usuarios WHERE email = ?', [email]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(usuario, passwordHash) {
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES (?, ?, ?, ?, ?)',
    [usuario.nombre, usuario.email, passwordHash, usuario.rol, usuario.activo]);
  return findById(resultado.insertId);
}

async function update(id, usuario, passwordHash) {
  let sql = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ?';
  const valores = [usuario.nombre, usuario.email, usuario.rol, usuario.activo];
  if (passwordHash) {                      // la contraseña solo cambia si se envió una nueva
    sql += ', password_hash = ?';
    valores.push(passwordHash);
  }
  const [resultado] = await pool.query(sql + ' WHERE id = ?', [...valores, id]);
  if (resultado.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByEmail, findCredenciales, create, update, remove };
