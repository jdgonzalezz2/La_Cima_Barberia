const pool = require('../../db/pool');

// Formato de número de factura simple
function generarNumeroFactura() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `LC-${y}${m}-${seq}`;
}

async function create(req, res, next) {
  const client = await pool.connect();
  try {
    const {
      citaId, barberoId, clienteId,
      items, // [{ servicioId, descripcion, cantidad, precioUnitario }]
      descuento = 0,
      metodoPago,
    } = req.body;

    if (!barberoId || !items?.length || !metodoPago) {
      return res.status(400).json({ error: 'Faltan campos: barberoId, items, metodoPago' });
    }

    await client.query('BEGIN');

    const subtotal = items.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);
    const total = subtotal - descuento;
    const numeroFactura = generarNumeroFactura();

    // ── Crear transacción POS ─────────────────────────────────────────────
    const txResult = await client.query(`
      INSERT INTO transacciones_pos (cita_id, barbero_id, cliente_id, subtotal, descuento, total, metodo_pago, numero_factura)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [citaId || null, barberoId, clienteId || null, subtotal, descuento, total, metodoPago, numeroFactura]);

    const tx = txResult.rows[0];

    // ── Insertar items ────────────────────────────────────────────────────
    for (const item of items) {
      await client.query(`
        INSERT INTO items_transaccion (transaccion_id, servicio_id, descripcion, cantidad, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [tx.id, item.servicioId || null, item.descripcion, item.cantidad || 1,
          item.precioUnitario, item.precioUnitario * (item.cantidad || 1)]);
    }

    // ── Si hay cita asociada, marcarla como completada ────────────────────
    if (citaId) {
      await client.query(
        "UPDATE citas SET estado = 'completada', updated_at = NOW() WHERE id = $1",
        [citaId]
      );
    }

    // ── Calcular y registrar comisión del barbero ─────────────────────────
    const barberoResult = await client.query(
      'SELECT porcentaje_comision FROM barberos WHERE id = $1', [barberoId]
    );
    if (barberoResult.rows.length > 0) {
      const porcentaje = barberoResult.rows[0].porcentaje_comision;
      const montoComision = (total * porcentaje) / 100;

      await client.query(`
        INSERT INTO comisiones (barbero_id, transaccion_id, monto_venta, porcentaje, monto_comision, periodo_inicio, periodo_fin)
        VALUES ($1, $2, $3, $4, $5, date_trunc('month', NOW())::date, (date_trunc('month', NOW()) + INTERVAL '1 month - 1 day')::date)
      `, [barberoId, tx.id, total, porcentaje, montoComision]);
    }

    await client.query('COMMIT');

    // Respuesta completa
    const itemsResult = await pool.query(
      'SELECT * FROM items_transaccion WHERE transaccion_id = $1', [tx.id]
    );

    res.status(201).json({
      ...tx,
      items: itemsResult.rows,
      mensaje: 'Venta registrada exitosamente',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function getAll(req, res, next) {
  try {
    const { desde, hasta, barberoId } = req.query;
    let conditions = [];
    const params = [];
    let idx = 1;

    if (desde) { conditions.push(`t.created_at >= $${idx++}`); params.push(`${desde} 00:00:00`); }
    if (hasta) { conditions.push(`t.created_at <= $${idx++}`); params.push(`${hasta} 23:59:59`); }
    if (barberoId) { conditions.push(`t.barbero_id = $${idx++}`); params.push(barberoId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(`
      SELECT t.*,
        b.nombre || ' ' || b.apellido AS barbero_nombre,
        cl.nombre AS cliente_nombre,
        json_agg(json_build_object(
          'id', it.id, 'descripcion', it.descripcion,
          'cantidad', it.cantidad, 'precio_unitario', it.precio_unitario, 'subtotal', it.subtotal
        )) AS items
      FROM transacciones_pos t
      JOIN barberos b ON t.barbero_id = b.id
      LEFT JOIN clientes cl ON t.cliente_id = cl.id
      LEFT JOIN items_transaccion it ON it.transaccion_id = t.id
      ${where}
      GROUP BY t.id, b.nombre, b.apellido, cl.nombre
      ORDER BY t.created_at DESC
      LIMIT 100
    `, params);

    res.json(rows);
  } catch (err) { next(err); }
}

async function getResumen(req, res, next) {
  try {
    const { fecha } = req.query;
    const hoy = fecha || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE estado = 'completada') AS total_transacciones,
        COALESCE(SUM(total) FILTER (WHERE estado = 'completada'), 0) AS ingresos_totales,
        COALESCE(SUM(total) FILTER (WHERE estado = 'completada' AND metodo_pago = 'efectivo'), 0) AS efectivo,
        COALESCE(SUM(total) FILTER (WHERE estado = 'completada' AND metodo_pago IN ('tarjeta_credito','tarjeta_debito')), 0) AS tarjeta
      FROM transacciones_pos
      WHERE created_at::date = $1::date
    `, [hoy]);

    const topBarbero = await pool.query(`
      SELECT b.nombre || ' ' || b.apellido AS barbero, SUM(t.total) AS total_ventas
      FROM transacciones_pos t
      JOIN barberos b ON t.barbero_id = b.id
      WHERE t.created_at::date = $1::date AND t.estado = 'completada'
      GROUP BY b.id, b.nombre, b.apellido
      ORDER BY total_ventas DESC LIMIT 1
    `, [hoy]);

    res.json({
      ...rows[0],
      top_barbero: topBarbero.rows[0] || null,
      fecha: hoy,
    });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, b.nombre || ' ' || b.apellido AS barbero_nombre, cl.nombre AS cliente_nombre
      FROM transacciones_pos t
      JOIN barberos b ON t.barbero_id = b.id
      LEFT JOIN clientes cl ON t.cliente_id = cl.id
      WHERE t.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Transacción no encontrada' });

    const items = await pool.query('SELECT * FROM items_transaccion WHERE transaccion_id = $1', [req.params.id]);
    res.json({ ...rows[0], items: items.rows });
  } catch (err) { next(err); }
}

async function anular(req, res, next) {
  try {
    const { rows } = await pool.query(`
      UPDATE transacciones_pos SET estado = 'anulada' WHERE id = $1 RETURNING id, estado
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { create, getAll, getResumen, getById, anular };
