const axios = require('axios');
const pool  = require('../../db/pool');

const MATIAS_KEY  = process.env.MATIAS_API_KEY;
const MATIAS_URL  = process.env.MATIAS_API_URL || 'https://api.matias-api.com/v1';
const STUB_MODE   = !MATIAS_KEY || MATIAS_KEY === 'stub_matias_key';

function generarCufeStub(numeroFactura) {
  const hash = Buffer.from(`${numeroFactura}-${Date.now()}`).toString('base64');
  return hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 96);
}

async function emitirFactura(req, res, next) {
  try {
    const { transaccionId } = req.body;

    const txResult = await pool.query(`
      SELECT t.*, b.nombre || ' ' || b.apellido AS barbero_nombre,
        json_agg(json_build_object(
          'descripcion', it.descripcion, 'cantidad', it.cantidad,
          'precio_unitario', it.precio_unitario, 'subtotal', it.subtotal
        )) AS items
      FROM transacciones_pos t
      JOIN barberos b ON t.barbero_id = b.id
      JOIN items_transaccion it ON it.transaccion_id = t.id
      WHERE t.id = $1
      GROUP BY t.id, b.nombre, b.apellido
    `, [transaccionId]);

    if (!txResult.rows[0]) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const tx = txResult.rows[0];

    if (STUB_MODE) {
      const cufe = generarCufeStub(tx.numero_factura);
      const qrCodigo = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${cufe}`;

      await pool.query(`
        INSERT INTO facturas_electronicas (transaccion_id, numero_factura, cufe, qr_codigo, estado, respuesta_dian)
        VALUES ($1, $2, $3, $4, 'emitida', $5)
        ON CONFLICT DO NOTHING
      `, [transaccionId, tx.numero_factura, cufe, qrCodigo,
          JSON.stringify({ stub: true, mensaje: 'Factura simulada — configurar Matias API para producción' })]);

      return res.json({
        success: true,
        stub: true,
        numero_factura: tx.numero_factura,
        cufe,
        qr_codigo: qrCodigo,
        mensaje: 'Factura electrónica simulada. Configurar MATIAS_API_KEY para integración real con la DIAN.',
      });
    }

    // ── Integración real con Matias API ──────────────────────────────────
    const payload = {
      numero: tx.numero_factura,
      fecha: new Date(tx.created_at).toISOString(),
      tipo: 'tiquete_pos',
      subtotal: parseFloat(tx.subtotal),
      descuento: parseFloat(tx.descuento),
      total: parseFloat(tx.total),
      metodo_pago: tx.metodo_pago,
      items: tx.items,
    };

    const response = await axios.post(`${MATIAS_URL}/documentos/emitir`, payload, {
      headers: { 'X-API-Key': MATIAS_KEY, 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    const { cufe, qr_codigo } = response.data;

    await pool.query(`
      INSERT INTO facturas_electronicas (transaccion_id, numero_factura, cufe, qr_codigo, estado, respuesta_dian)
      VALUES ($1, $2, $3, $4, 'emitida', $5)
    `, [transaccionId, tx.numero_factura, cufe, qr_codigo, JSON.stringify(response.data)]);

    res.json({ success: true, numero_factura: tx.numero_factura, cufe, qr_codigo });
  } catch (err) {
    next(err);
  }
}

async function getFactura(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM facturas_electronicas WHERE transaccion_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.params.transaccionId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { emitirFactura, getFactura };
