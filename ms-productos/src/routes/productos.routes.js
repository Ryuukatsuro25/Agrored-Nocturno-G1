// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador y aplica
// la tabla de permisos del Taller 1 para Productos:
//   consultan (GET): cualquier usuario autenticado
//   crean, modifican y eliminan: administrador y produccion
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/productos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                                                           // todas exigen token (401)

router.get('/', controller.listar);                                                   // listar, filtrar, ?ids=
router.get('/:id', controller.obtener);                                               // obtener por id
router.post('/', requiereRol('administrador', 'produccion'), controller.crear);       // crear (403 otros roles)
router.put('/:id', requiereRol('administrador', 'produccion'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'produccion'), controller.eliminar);

module.exports = router;
