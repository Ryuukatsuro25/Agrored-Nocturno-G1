// =====================================================================
// MIDDLEWARE DE SEGURIDAD (el mismo archivo en todos los microservicios)
// verificarToken: exige un token JWT válido en la cabecera Authorization.
// requiereRol: deja pasar solo a los roles indicados.
// Cada microservicio verifica el token con la clave JWT_SECRET del .env,
// sin preguntarle nada a ms-usuarios.
// =====================================================================
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');

// Lee "Authorization: Bearer <token>", lo verifica y guarda en req.usuario
// los datos que trae el token: { id, nombre, rol }
function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw new HttpError(401, 'Falta el token de acceso (cabecera Authorization: Bearer <token>)');
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new HttpError(401, 'Token inválido o vencido');
  }
  next();
}

// Uso: router.post('/', requiereRol('administrador', 'despacho'), controller.crear)
function requiereRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      throw new HttpError(403, `El rol ${req.usuario.rol} no tiene permiso para esta operación`);
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };
