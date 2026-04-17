const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticateToken, requireAdmin } = require('../../middlewares/auth');

// Públicos — usados en el flujo de booking del cliente
router.get('/disponibilidad/:barberoId/:fecha', controller.getDisponibilidad);
router.post('/', controller.createCita);

// Protegidos — panel admin
router.get('/', authenticateToken, controller.getCitas);
router.get('/:id', authenticateToken, controller.getCitaById);
router.patch('/:id/estado', authenticateToken, controller.updateEstado);
router.delete('/:id', authenticateToken, requireAdmin, controller.cancelar);

module.exports = router;
