// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, query, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// Le pasa al servicio el token (req.headers.authorization) como un dato
// más, para que pueda reenviarlo a ms-clientes y ms-productos.
// =====================================================================
const service = require('../services/pedidos.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /pedidos  ·  /pedidos?estado=recibido  ·  /pedidos?cliente_id=2
async function listar(req, res) {
  const filtros = { estado: req.query.estado };
  if (req.query.cliente_id !== undefined) {
    filtros.cliente_id = Number(req.query.cliente_id);
    if (!Number.isInteger(filtros.cliente_id) || filtros.cliente_id <= 0) {
      throw new HttpError(400, 'cliente_id debe ser un entero positivo');
    }
  }
  const pedidos = await service.listar(filtros, req.headers.authorization);
  res.status(200).json(pedidos);
}

// GET /pedidos/:id
async function obtener(req, res) {
  const pedido = await service.obtener(leerId(req), req.headers.authorization);
  res.status(200).json(pedido);
}

// POST /pedidos
async function crear(req, res) {
  const nuevo = await service.crear(req.body, req.headers.authorization);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /pedidos/:id
async function actualizar(req, res) {
  const pedido = await service.actualizar(leerId(req), req.body, req.headers.authorization);
  res.status(200).json(pedido);
}

// DELETE /pedidos/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();                              // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
