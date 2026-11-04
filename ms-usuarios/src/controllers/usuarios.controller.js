// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/usuarios.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /usuarios, GET /usuarios?rol=despacho, GET /usuarios?ids=1,3
async function listar(req, res) {
  const filtros = { rol: req.query.rol };
  if (req.query.ids) {                    // ?ids=1,3 → [1, 3]
    filtros.ids = String(req.query.ids).split(',').map(Number);
    if (filtros.ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new HttpError(400, 'ids debe ser una lista de enteros separados por comas');
    }
  }
  const usuarios = await service.listar(filtros);
  res.status(200).json(usuarios);
}

// GET /usuarios/:id
async function obtener(req, res) {
  const usuario = await service.obtener(leerId(req));
  res.status(200).json(usuario);
}

// POST /usuarios
async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /usuarios/:id
async function actualizar(req, res) {
  const actualizado = await service.actualizar(leerId(req), req.body);
  res.status(200).json(actualizado);
}

// DELETE /usuarios/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();                  // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
