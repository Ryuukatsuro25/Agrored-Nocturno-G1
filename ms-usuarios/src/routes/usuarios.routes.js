// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador
// y decide qué rutas exigen token y quién puede usarlas.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/usuarios.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');
const HttpError = require('../utils/http-error');

const router = Router();

// El administrador ve a cualquiera; los demás, solo su propio registro
function propioOAdministrador(req, res, next) {
  if (req.usuario.rol === 'administrador' || req.usuario.id === Number(req.params.id)) {
    return next();
  }
  throw new HttpError(403, 'Solo puede consultar su propia información');
}

// Pública: es la puerta de entrada, todavía no hay token
router.post('/login', controller.login);

// Desde aquí, todo exige un token válido
router.use(verificarToken);

router.get('/me', controller.miPerfil);                       // cualquier rol: sus datos
router.get('/:id', propioOAdministrador, controller.obtener);  // propio o administrador

// Lo que sigue, solo el administrador
router.use(requiereRol('administrador'));

router.get('/', controller.listar);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
