// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/productos.repository');
const { validarProducto, construirProducto } = require('../models/producto');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const producto = await repo.findById(id);
  if (!producto) throw new HttpError(404, `No existe el producto con id ${id}`);
  return producto;
}

// Regla de negocio: el catálogo no puede tener dos productos con el mismo
// nombre, sin importar mayúsculas (409 = Conflict). Los pedidos y los
// reportes identifican el producto por su nombre.
async function verificarNombreUnico(nombre, idActual = null) {
  const existente = await repo.findByNombre(nombre);
  if (existente && existente.id !== idActual) {
    throw new HttpError(409, `Ya existe un producto con el nombre ${nombre}`);
  }
}

async function crear(datos) {
  const errores = validarProducto(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const producto = construirProducto(datos);
  await verificarNombreUnico(producto.nombre);
  return repo.create(producto);
}

// PUT reemplaza el registro completo: se valida igual que al crear
async function actualizar(id, datos) {
  await obtener(id);                                   // 404 si no existe
  const errores = validarProducto(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const producto = construirProducto(datos);
  await verificarNombreUnico(producto.nombre, id);
  return repo.update(id, producto);
}

async function eliminar(id) {
  const borrado = await repo.remove(id);
  if (!borrado) throw new HttpError(404, `No existe el producto con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
