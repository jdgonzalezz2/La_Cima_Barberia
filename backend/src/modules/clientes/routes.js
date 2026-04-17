const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticateToken } = require('../../middlewares/auth');

router.get('/', authenticateToken, controller.getAll);
router.get('/:id', authenticateToken, controller.getById);
router.post('/', controller.createOrFind); // público para booking
router.put('/:id', authenticateToken, controller.update);

module.exports = router;
