// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio, valida las referencias y compone las
// respuestas con los datos de ms-clientes y ms-productos.
// No sabe nada de HTTP (req/res): el token le llega como un dato más.
// =====================================================================
const repo = require('../repositories/pedidos.repository');
const { validarPedido, construirPedido } = require('../models/pedido');
const clientesClient = require('../clients/clientes.client');
const productosClient = require('../clients/productos.client');
const HttpError = require('../utils/http-error');

// Fecha de hoy en Colombia con formato AAAA-MM-DD
function fechaDeHoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

// COMPOSICIÓN: agrega a cada pedido su cliente y su producto con UNA sola
// consulta por lotes a cada microservicio (?ids=). Si uno no responde, la
// respuesta sale igual con ese objeto en null y un aviso (degradación controlada).
async function componer(pedidos, token) {
  const idsClientes = [...new Set(pedidos.map((p) => p.cliente_id))];
  const idsProductos = [...new Set(pedidos.map((p) => p.producto_id))];
  const [clientes, productos] = await Promise.all([
    clientesClient.clientesPorIds(idsClientes, token),
    productosClient.productosPorIds(idsProductos, token),
  ]);
  const avisos = [];
  if (!clientes) avisos.push('ms-clientes no disponible');
  if (!productos) avisos.push('ms-productos no disponible');
  return pedidos.map((p) => ({
    ...p,
    cliente: clientes ? clientes.get(p.cliente_id) || null : null,
    producto: productos ? productos.get(p.producto_id) || null : null,
    ...(avisos.length > 0 ? { aviso: avisos.join('; ') } : {}),
  }));
}

// VALIDACIÓN: las referencias deben existir en sus microservicios
// (400 si no existen; 503 si el otro microservicio no responde)
async function validarReferencias(pedido, token) {
  if (!(await clientesClient.existeCliente(pedido.cliente_id, token))) {
    throw new HttpError(400, `No existe el cliente con id ${pedido.cliente_id}`);
  }
  if (!(await productosClient.existeProducto(pedido.producto_id, token))) {
    throw new HttpError(400, `No existe el producto con id ${pedido.producto_id}`);
  }
}

async function listar(filtros, token) {
  return componer(await repo.findAll(filtros), token);
}

async function buscar(id) {
  const pedido = await repo.findById(id);
  if (!pedido) throw new HttpError(404, `No existe el pedido con id ${id}`);
  return pedido;
}

async function obtener(id, token) {
  const [compuesto] = await componer([await buscar(id)], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = validarPedido(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  // Regla de negocio: todo pedido nuevo entra a la empresa como "recibido"
  if (datos.estado !== undefined && datos.estado !== 'recibido') {
    throw new HttpError(400, 'Un pedido nuevo debe empezar en estado recibido');
  }
  const pedido = construirPedido(datos);
  if (!pedido.fecha) pedido.fecha = fechaDeHoy();   // regla: sin fecha, se usa la de hoy
  await validarReferencias(pedido, token);
  const [compuesto] = await componer([await repo.create(pedido)], token);
  return compuesto;
}

// PUT reemplaza el registro completo (estado y fecha incluidos)
async function actualizar(id, datos, token) {
  const actual = await buscar(id);                  // 404 si no existe
  const errores = validarPedido(datos, { esActualizacion: true });
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  // Regla de negocio: un pedido ya entregado no se puede modificar (409)
  if (actual.estado === 'entregado') {
    throw new HttpError(409, `El pedido ${id} ya fue entregado y no se puede modificar`);
  }
  const pedido = construirPedido(datos);
  await validarReferencias(pedido, token);
  const [compuesto] = await componer([await repo.update(id, pedido)], token);
  return compuesto;
}

async function eliminar(id) {
  const borrado = await repo.remove(id);
  if (!borrado) throw new HttpError(404, `No existe el pedido con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
