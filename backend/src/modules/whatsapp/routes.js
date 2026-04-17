const express = require('express');
const router = express.Router();
const controller = require('./controller');

// Webhook de verificación Meta
router.get('/webhook', controller.verificarWebhook);
// Recepción de eventos Meta
router.post('/webhook', controller.recibirEvento);
// Enviar notificación desde el sistema
router.post('/notificar', controller.enviarNotificacion);

module.exports = router;
