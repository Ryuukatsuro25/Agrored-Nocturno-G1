// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador y aplica
// la tabla de permisos para Pedidos:
//   consultan (GET): cualquier usuario autenticado
//   crean, modifican y eliminan: administrador y comercial
// =====================================================================

const { Router } = require('express');
const controller = require('../controllers/pedidos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

// Todas las rutas de pedidos requieren un JWT válido.
router.use(verificarToken);

// Cualquier usuario autenticado puede consultar.
router.get('/', controller.listar);
router.get('/:id', controller.obtener);

// Solo administrador y comercial pueden modificar datos.
router.post(
  '/',
  requiereRol('administrador', 'comercial'),
  controller.crear
);

router.put(
  '/:id',
  requiereRol('administrador', 'comercial'),
  controller.actualizar
);

router.delete(
  '/:id',
  requiereRol('administrador', 'comercial'),
  controller.eliminar
);

module.exports = router;