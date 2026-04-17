const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('./controller');
const { authenticateToken } = require('../../middlewares/auth');

router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  controller.login
);

router.get('/me', authenticateToken, controller.me);
router.post('/logout', authenticateToken, controller.logout);

module.exports = router;
