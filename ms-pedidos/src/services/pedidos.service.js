const repo = require('../repositories/pedidos.repository');
const { validarPedido, construirPedido } = require('../models/pedido');
const clientesClient = require('../clients/clientes.client');
const productosClient = require('../clients/productos.client');
const HttpError = require('../utils/http-error');

function fechaDeHoy() {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Bogota'
  });
}

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function buscar(id) {
  const pedido = await repo.findById(id);

  if (!pedido) {
    throw new HttpError(404, `No existe el pedido con id ${id}`);
  }

  return pedido;
}

async function obtener(id) {
  return buscar(id);
}

// Valida las referencias externas del pedido.
// Solo consulta una referencia cuando viene incluida en los datos.
async function validarReferencias(datos, token) {
  if (datos.cliente_id !== undefined) {
    const existeCliente = await clientesClient.existeCliente(
      datos.cliente_id,
      token
    );

    if (!existeCliente) {
      throw new HttpError(
        400,
        `No existe el cliente con id ${datos.cliente_id}`
      );
    }
  }

  if (datos.producto_id !== undefined) {
    const existeProducto = await productosClient.existeProducto(
      datos.producto_id,
      token
    );

    if (!existeProducto) {
      throw new HttpError(
        400,
        `No existe el producto con id ${datos.producto_id}`
      );
    }
  }
}

async function crear(datos, token) {
  const errores = validarPedido(datos);

  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  // Regla de negocio:
  // todo pedido nuevo debe comenzar en estado recibido.
  if (datos.estado !== undefined && datos.estado !== 'recibido') {
    throw new HttpError(
      400,
      'Un pedido nuevo debe empezar en estado recibido'
    );
  }

  // Semana 2:
  // cliente_id y producto_id deben existir en sus microservicios.
  await validarReferencias(datos, token);

  const pedido = construirPedido(datos);

  if (!pedido.fecha) {
    pedido.fecha = fechaDeHoy();
  }

  return repo.create(pedido);
}

async function actualizar(id, datos, token) {
  const actual = await buscar(id);

  const errores = validarPedido(datos, {
    esActualizacion: true
  });

  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  // Regla de negocio:
  // un pedido entregado ya no puede modificarse.
  if (actual.estado === 'entregado') {
    throw new HttpError(
      409,
      `El pedido ${id} ya fue entregado y no se puede modificar`
    );
  }

  // En una actualización solo se validan las referencias
  // que realmente fueron enviadas.
  await validarReferencias(datos, token);

  const pedido = construirPedido(datos);

  return repo.update(id, pedido);
}

async function eliminar(id) {
  const borrado = await repo.remove(id);

  if (!borrado) {
    throw new HttpError(404, `No existe el pedido con id ${id}`);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};