// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Usuario y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// =====================================================================

// Los roles válidos vienen del archivo .env (cada empresa tiene los suyos)
function rolesValidos() {
  return (process.env.ROLES || 'administrador')
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r !== '');
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_MINIMA_PASSWORD = 8;

// Devuelve una lista de errores de validación (vacía si todo está bien).
// passwordObligatoria: true al crear; al actualizar la contraseña es opcional.
function validarUsuario(datos, { passwordObligatoria }) {
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
  const hayPassword = datos.password !== undefined;
  if ((passwordObligatoria || hayPassword) &&
      (typeof datos.password !== 'string' || datos.password.length < LONGITUD_MINIMA_PASSWORD)) {
    errores.push(`password es obligatoria y debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres`);
  }
  return errores;
}

// Construye un usuario "limpio" solo con los campos permitidos (sin la contraseña)
function construirUsuario(datos) {
  return {
    nombre: datos.nombre.trim(),
    email: datos.email.trim().toLowerCase(),
    rol: datos.rol,
    activo: datos.activo === undefined ? true : datos.activo,
  };
}

module.exports = { validarUsuario, construirUsuario };
