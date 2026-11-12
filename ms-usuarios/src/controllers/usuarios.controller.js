// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición y arma la respuesta.
// =====================================================================
const service = require('../services/usuarios.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /usuarios, GET /usuarios?rol=despacho, GET /usuarios?ids=1,2,3
async function listar(req, res) {
  const filtros = { rol: req.query.rol };
  if (req.query.ids) {
    filtros.ids = String(req.query.ids).split(',').map(Number);
    if (filtros.ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new HttpError(400, 'ids debe ser una lista de enteros separados por comas');
    }
  }
  res.status(200).json(await service.listar(filtros));
}

// GET /usuarios/:id
async function obtener(req, res) {
  res.status(200).json(await service.obtener(leerId(req)));
}

// POST /usuarios
async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /usuarios/:id
async function actualizar(req, res) {
  res.status(200).json(await service.actualizar(leerId(req), req.body));
}

// DELETE /usuarios/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();
}

// POST /usuarios/login
async function login(req, res) {
  res.status(200).json(await service.login(req.body));
}

// GET /usuarios/me — los datos del usuario dueño del token
async function miPerfil(req, res) {
  res.status(200).json(await service.obtener(req.usuario.id));
}

module.exports = { listar, obtener, crear, actualizar, eliminar, login, miPerfil };
