const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticateToken, requireAdmin } = require('../../middlewares/auth');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authenticateToken, requireAdmin, controller.create);
router.put('/:id', authenticateToken, requireAdmin, controller.update);
router.patch('/:id/toggle', authenticateToken, requireAdmin, controller.toggleActivo);

module.exports = router;
