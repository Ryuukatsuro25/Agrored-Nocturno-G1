// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/usuarios.repository');
const { validarUsuario, construirUsuario } = require('../models/usuario');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const usuario = await repo.findById(id);
  if (!usuario) throw new HttpError(404, `No existe el usuario con id ${id}`);
  return usuario;
}

async function crear(datos) {
  const errores = validarUsuario(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const usuario = construirUsuario(datos);

  // Regla de negocio: no puede haber dos usuarios con el mismo email
  // (el email es con lo que se inicia sesión). 409 = Conflict.
  if (await repo.findByEmail(usuario.email)) {
    throw new HttpError(409, `Ya existe un usuario con el email ${usuario.email}`);
  }

  return repo.create(usuario);
}

async function actualizar(id, datos) {
  const errores = validarUsuario(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const usuario = construirUsuario(datos);

  // Misma regla del email, pero el usuario sí puede conservar su propio email
  const otro = await repo.findByEmail(usuario.email);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un usuario con el email ${usuario.email}`);
  }

  const actualizado = await repo.update(id, usuario);
  if (!actualizado) throw new HttpError(404, `No existe el usuario con id ${id}`);
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el usuario con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
