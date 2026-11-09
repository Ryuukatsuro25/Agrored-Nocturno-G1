const service = require('../services/pedidos.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El id debe ser un entero positivo');
  }

  return id;
}

// GET /pedidos
// GET /pedidos?estado=recibido
// GET /pedidos?cliente_id=2
async function listar(req, res) {
  const filtros = {
    estado: req.query.estado
  };

  if (req.query.cliente_id !== undefined) {
    filtros.cliente_id = Number(req.query.cliente_id);

    if (!Number.isInteger(filtros.cliente_id) || filtros.cliente_id <= 0) {
      throw new HttpError(400, 'cliente_id debe ser un entero positivo');
    }
  }

  const pedidos = await service.listar(filtros);
  res.status(200).json(pedidos);
}

async function obtener(req, res) {
  const pedido = await service.obtener(leerId(req));
  res.status(200).json(pedido);
}

async function crear(req, res) {
  const nuevo = await service.crear(req.body);

  res
    .status(201)
    .location(`${req.baseUrl}/${nuevo.id}`)
    .json(nuevo);
}

async function actualizar(req, res) {
  const pedido = await service.actualizar(leerId(req), req.body);
  res.status(200).json(pedido);
}

async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};