// =====================================================================
// CAPA DE PRESENTACIÓN (rutas) · Taller 2, semana 1
// Asocia cada método HTTP + URI con una función del controlador.
// La autenticación JWT se incorporará en la semana 2 cuando la docente
// entregue la versión de ms-usuarios con auth.js.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/clientes.controller');

const router = Router();

router.get('/', controller.listar);              // listar, filtrar, ?ids=
router.get('/:id', controller.obtener);          // obtener por id
router.post('/', controller.crear);              // crear
router.put('/:id', controller.actualizar);       // actualizar
router.delete('/:id', controller.eliminar);      // eliminar

module.exports = router;
