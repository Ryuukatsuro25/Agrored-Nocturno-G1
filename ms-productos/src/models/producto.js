// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Producto y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// =====================================================================

// Valores permitidos (los mismos del contrato de la API)
const CATEGORIAS = ['fruta', 'hortaliza', 'procesado'];
const UNIDADES = ['kg', 'caja'];

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarProducto(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['Se esperaba un objeto JSON con los datos del producto'];
  }
  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('nombre es obligatorio');
  }
  if (!CATEGORIAS.includes(datos.categoria)) {
    errores.push(`categoria debe ser una de: ${CATEGORIAS.join(', ')}`);
  }
  if (!UNIDADES.includes(datos.unidad)) {
    errores.push(`unidad debe ser una de: ${UNIDADES.join(', ')}`);
  }
  if (typeof datos.precio !== 'number' || !Number.isFinite(datos.precio) || datos.precio <= 0) {
    errores.push('precio es obligatorio y debe ser un número mayor que 0');
  }
  return errores;
}

// Construye un producto "limpio" solo con los campos permitidos
function construirProducto(datos) {
  return {
    nombre: datos.nombre.trim(),
    categoria: datos.categoria,
    unidad: datos.unidad,
    precio: datos.precio,
  };
}

module.exports = { validarProducto, construirProducto };
