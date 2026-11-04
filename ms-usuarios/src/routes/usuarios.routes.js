// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/usuarios.controller');

const router = Router();

router.get('/', controller.listar);      // listar todos los usuarios
router.get('/:id', controller.obtener);  // obtener un usuario por id
router.post('/', controller.crear);      // crear un usuario

router.put('/:id', controller.actualizar);     // actualizar un usuario
router.delete('/:id', controller.eliminar);    // eliminar un usuario

module.exports = router;
