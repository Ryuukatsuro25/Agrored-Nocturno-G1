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

async function buscar(id) {
  const pedido = await repo.findById(id);

  if (!pedido) {
    throw new HttpError(404, `No existe el pedido con id ${id}`);
  }

  return pedido;
}

// ---------------------------------------------------------------------
// RELACIONES - VALIDACIÓN
// Comprueba que cliente_id y producto_id existan antes de guardar.
// Si el registro no existe -> 400.
// Si el microservicio no responde -> el cliente HTTP genera 503.
// ---------------------------------------------------------------------
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

// ---------------------------------------------------------------------
// RELACIONES - COMPOSICIÓN
// Reúne los ids distintos y realiza UNA consulta por lotes a cada
// microservicio.
// ---------------------------------------------------------------------
async function componer(pedidos, token) {
  if (pedidos.length === 0) {
    return [];
  }

  const idsClientes = [
    ...new Set(pedidos.map((pedido) => pedido.cliente_id))
  ];

  const idsProductos = [
    ...new Set(pedidos.map((pedido) => pedido.producto_id))
  ];

  const [clientes, productos] = await Promise.all([
    clientesClient.clientesPorIds(idsClientes, token),
    productosClient.productosPorIds(idsProductos, token)
  ]);

  const avisos = [];

  if (!clientes) {
    avisos.push('ms-clientes no disponible');
  }

  if (!productos) {
    avisos.push('ms-productos no disponible');
  }

  return pedidos.map((pedido) => {
    const compuesto = {
      ...pedido,

      cliente: clientes
        ? clientes.get(pedido.cliente_id) || null
        : null,

      producto: productos
        ? productos.get(pedido.producto_id) || null
        : null
    };

    if (avisos.length > 0) {
      compuesto.aviso = avisos.join(' · ');
    }

    return compuesto;
  });
}

// GET /pedidos
async function listar(filtros, token) {
  const pedidos = await repo.findAll(filtros);

  return componer(pedidos, token);
}

// GET /pedidos/:id
async function obtener(id, token) {
  const pedido = await buscar(id);

  const [compuesto] = await componer(
    [pedido],
    token
  );

  return compuesto;
}

// POST /pedidos
async function crear(datos, token) {
  const errores = validarPedido(datos);

  if (errores.length > 0) {
    throw new HttpError(
      400,
      'Datos inválidos',
      errores
    );
  }

  // Regla de negocio:
  // todo pedido nuevo debe comenzar en estado recibido.
  if (
    datos.estado !== undefined &&
    datos.estado !== 'recibido'
  ) {
    throw new HttpError(
      400,
      'Un pedido nuevo debe empezar en estado recibido'
    );
  }

  // Semana 2:
  // comprobar que cliente y producto existan.
  await validarReferencias(datos, token);

  const pedido = construirPedido(datos);

  if (!pedido.fecha) {
    pedido.fecha = fechaDeHoy();
  }

  const nuevo = await repo.create(pedido);

  // El POST también devuelve los objetos relacionados.
  const [compuesto] = await componer(
    [nuevo],
    token
  );

  return compuesto;
}

// PUT /pedidos/:id
async function actualizar(id, datos, token) {
  const actual = await buscar(id);

  const errores = validarPedido(datos, {
    esActualizacion: true
  });

  if (errores.length > 0) {
    throw new HttpError(
      400,
      'Datos inválidos',
      errores
    );
  }

  // Regla de negocio:
  // un pedido entregado ya no puede modificarse.
  if (actual.estado === 'entregado') {
    throw new HttpError(
      409,
      `El pedido ${id} ya fue entregado y no se puede modificar`
    );
  }

  // Si se enviaron referencias nuevas,
  // se valida que realmente existan.
  await validarReferencias(datos, token);

  const pedido = construirPedido(datos);

  const actualizado = await repo.update(
    id,
    pedido
  );

  const [compuesto] = await componer(
    [actualizado],
    token
  );

  return compuesto;
}

// DELETE /pedidos/:id
async function eliminar(id) {
  const borrado = await repo.remove(id);

  if (!borrado) {
    throw new HttpError(
      404,
      `No existe el pedido con id ${id}`
    );
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};