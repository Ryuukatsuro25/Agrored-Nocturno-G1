// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Pedido y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// cliente_id y producto_id son REFERENCIAS: se guarda solo el id;
// el nombre del cliente y del producto viven en sus microservicios.
// =====================================================================
const CENTROS = ['Bogotá', 'Cali'];
const ESTADOS = ['recibido', 'despachado', 'entregado'];

const esEnteroPositivo = (v) => Number.isInteger(v) && v > 0;

// true si el texto es una fecha real con formato AAAA-MM-DD (rechaza 2026-02-30)
function esFechaValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

// Devuelve una lista de errores (vacía si todo está bien).
// Al actualizar (PUT reemplaza el registro completo) estado y fecha son obligatorios.
function validarPedido(datos, { esActualizacion = false } = {}) {
  const errores = [];
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['Se esperaba un objeto JSON con los datos del pedido'];
  }
  if (!esEnteroPositivo(datos.cliente_id)) errores.push('cliente_id es obligatorio y debe ser un entero positivo');
  if (!esEnteroPositivo(datos.producto_id)) errores.push('producto_id es obligatorio y debe ser un entero positivo');
  if (!esEnteroPositivo(datos.cantidad)) errores.push('cantidad es obligatoria y debe ser un entero mayor que 0');
  if (!CENTROS.includes(datos.centro_distribucion)) {
    errores.push(`centro_distribucion debe ser uno de: ${CENTROS.join(', ')}`);
  }
  if ((esActualizacion || datos.estado !== undefined) && !ESTADOS.includes(datos.estado)) {
    errores.push(`estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  if ((esActualizacion || datos.fecha !== undefined) && !esFechaValida(datos.fecha)) {
    errores.push('fecha debe ser una fecha válida con formato AAAA-MM-DD');
  }
  return errores;
}

// Construye un pedido "limpio" solo con los campos del contrato
function construirPedido(datos) {
  return {
    cliente_id: datos.cliente_id,
    producto_id: datos.producto_id,
    cantidad: datos.cantidad,
    centro_distribucion: datos.centro_distribucion,
    estado: datos.estado || 'recibido',
    fecha: datos.fecha || null, // si no viene, el servicio pone la de hoy
  };
}

module.exports = { validarPedido, construirPedido };
