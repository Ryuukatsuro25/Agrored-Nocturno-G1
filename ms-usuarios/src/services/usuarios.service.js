// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Reglas del negocio, validaciones, cifrado de contraseñas e inicio de sesión.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('../repositories/usuarios.repository');
const { validarUsuario, construirUsuario } = require('../models/usuario');
const HttpError = require('../utils/http-error');

const RONDAS_BCRYPT = 10;   // costo del cifrado: más alto = más seguro y más lento

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const usuario = await repo.findById(id);
  if (!usuario) throw new HttpError(404, `No existe el usuario con id ${id}`);
  return usuario;
}

async function crear(datos) {
  const errores = validarUsuario(datos, { passwordObligatoria: true });
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const usuario = construirUsuario(datos);

  // Regla de negocio: no puede haber dos usuarios con el mismo email
  if (await repo.findByEmail(usuario.email)) {
    throw new HttpError(409, `Ya existe un usuario con el email ${usuario.email}`);
  }

  // La contraseña se guarda cifrada (hash): ni siquiera la base de datos la conoce
  const passwordHash = await bcrypt.hash(datos.password, RONDAS_BCRYPT);
  return repo.create(usuario, passwordHash);
}

async function actualizar(id, datos) {
  const errores = validarUsuario(datos, { passwordObligatoria: false });
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const usuario = construirUsuario(datos);

  const otro = await repo.findByEmail(usuario.email);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un usuario con el email ${usuario.email}`);
  }

  const passwordHash = datos.password ? await bcrypt.hash(datos.password, RONDAS_BCRYPT) : null;
  const actualizado = await repo.update(id, usuario, passwordHash);
  if (!actualizado) throw new HttpError(404, `No existe el usuario con id ${id}`);
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el usuario con id ${id}`);
}

// Inicio de sesión: verifica email y contraseña y entrega un token JWT
async function login(datos) {
  const email = typeof datos?.email === 'string' ? datos.email.trim().toLowerCase() : '';
  const password = typeof datos?.password === 'string' ? datos.password : '';

  const credenciales = await repo.findCredenciales(email);
  const valida = credenciales && credenciales.activo &&
    (await bcrypt.compare(password, credenciales.password_hash));
  // El mismo mensaje para email inexistente o contraseña errada: no se da pistas
  if (!valida) throw new HttpError(401, 'Email o contraseña incorrectos');

  const usuario = await repo.findById(credenciales.id);
  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },   // lo que viaja en el token
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRA || '8h' });
  return { token, usuario };
}

module.exports = { listar, obtener, crear, actualizar, eliminar, login };
