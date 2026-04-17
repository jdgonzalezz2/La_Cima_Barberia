const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticateToken } = require('../../middlewares/auth');

router.get('/', authenticateToken, controller.getAll);
router.get('/resumen/:barberoId', authenticateToken, controller.getResumen);
router.patch('/:id/pagar', authenticateToken, controller.marcarPagada);

module.exports = router;
