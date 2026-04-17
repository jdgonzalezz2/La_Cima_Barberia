const axios = require('axios');

const WA_TOKEN    = process.env.WHATSAPP_TOKEN;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'lacima_verify_token';
const STUB_MODE   = !WA_TOKEN || WA_TOKEN === 'stub_token';

// ── Verificación del webhook por parte de Meta ────────────────────────────
function verificarWebhook(req, res) {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook de WhatsApp verificado');
    return res.status(200).send(challenge);
  }
  res.status(403).json({ error: 'Verificación fallida' });
}

// ── Recepción de eventos de Meta ──────────────────────────────────────────
function recibirEvento(req, res) {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (value?.messages) {
          for (const msg of value.messages) {
            console.log(`📩 WhatsApp mensaje de ${msg.from}: ${msg.text?.body}`);
            // Aquí se procesarían respuestas automáticas
          }
        }
      }
    }
    return res.sendStatus(200);
  }
  res.sendStatus(404);
}

// ── Envío de notificación de cita ─────────────────────────────────────────
async function enviarNotificacion(req, res, next) {
  try {
    const { telefono, nombre, fecha, hora, servicio, barbero } = req.body;

    if (STUB_MODE) {
      console.log(`📱 [STUB WhatsApp] Notificación a ${telefono}:
        Hola ${nombre}! Tu cita en La Cima está confirmada.
        📅 ${fecha} a las ${hora}
        ✂️ ${servicio} con ${barbero}`);
      return res.json({
        success: true,
        stub: true,
        mensaje: `Notificación simulada enviada a ${telefono}`,
      });
    }

    // Plantilla de utilidad Meta (debe estar aprobada en el Business Manager)
    const payload = {
      messaging_product: 'whatsapp',
      to: `57${telefono.replace(/\D/g, '')}`,
      type: 'template',
      template: {
        name: 'confirmacion_cita',
        language: { code: 'es_CO' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: nombre },
              { type: 'text', text: `${fecha} a las ${hora}` },
              { type: 'text', text: servicio },
              { type: 'text', text: barbero },
            ],
          },
        ],
      },
    };

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' } }
    );

    res.json({ success: true, whatsappResponse: response.data });
  } catch (err) {
    next(err);
  }
}

module.exports = { verificarWebhook, recibirEvento, enviarNotificacion };
