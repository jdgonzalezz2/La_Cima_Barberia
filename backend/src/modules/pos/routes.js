const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticateToken } = require('../../middlewares/auth');

router.get('/', authenticateToken, controller.getAll);
router.get('/resumen', authenticateToken, controller.getResumen);
router.get('/:id', authenticateToken, controller.getById);
router.post('/', authenticateToken, controller.create);
router.patch('/:id/anular', authenticateToken, controller.anular);

module.exports = router;
