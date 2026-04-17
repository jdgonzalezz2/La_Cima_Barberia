const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticateToken } = require('../../middlewares/auth');

router.post('/emitir', authenticateToken, controller.emitirFactura);
router.get('/:transaccionId', authenticateToken, controller.getFactura);

module.exports = router;
