// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Usuario y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// Versión del Taller 1: todavía sin contraseña. La contraseña cifrada
// y el inicio de sesión se agregan en la versión completa (Taller 3).
// =====================================================================

// Los roles válidos vienen del archivo .env (cada empresa tiene los suyos)
function rolesValidos() {
  return (process.env.ROLES || 'administrador')
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r !== '');
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarUsuario(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del usuario'];
  }
  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('nombre es obligatorio');
  }
  if (typeof datos.email !== 'string' || !EMAIL_VALIDO.test(datos.email.trim())) {
    errores.push('email es obligatorio y debe tener un formato válido');
  }
  const roles = rolesValidos();
  if (!roles.includes(datos.rol)) {
    errores.push(`rol debe ser uno de: ${roles.join(', ')}`);
  }
  if (datos.activo !== undefined && typeof datos.activo !== 'boolean') {
    errores.push('activo debe ser true o false');
  }
  return errores;
}

// Construye un usuario "limpio" solo con los campos permitidos
function construirUsuario(datos) {
  return {
    nombre: datos.nombre.trim(),
    email: datos.email.trim().toLowerCase(),
    rol: datos.rol,
    activo: datos.activo === undefined ? true : datos.activo,
  };
}

module.exports = { validarUsuario, construirUsuario };
