// =====================================================================
// CAPA DE PRESENTACIÓN (rutas) · Taller 2, semana 2
// Todas las rutas del recurso exigen un JWT válido.
// GET: cualquier usuario autenticado.
// POST/PUT/DELETE: solo los roles definidos en la tabla de permisos.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/productos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', requiereRol('administrador', 'produccion'), controller.crear);
router.put('/:id', requiereRol('administrador', 'produccion'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'produccion'), controller.eliminar);

module.exports = router;
