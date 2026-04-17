const pool = require('../../db/pool');

async function getAll(req, res, next) {
  try {
    const { barberoId, estado, desde, hasta } = req.query;
    let conditions = [];
    const params = [];
    let idx = 1;

    if (barberoId) { conditions.push(`c.barbero_id = $${idx++}`); params.push(barberoId); }
    if (estado)    { conditions.push(`c.estado = $${idx++}`);     params.push(estado); }
    if (desde)     { conditions.push(`c.created_at >= $${idx++}`); params.push(`${desde} 00:00:00`); }
    if (hasta)     { conditions.push(`c.created_at <= $${idx++}`); params.push(`${hasta} 23:59:59`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(`
      SELECT c.*,
        b.nombre || ' ' || b.apellido AS barbero_nombre,
        t.numero_factura, t.metodo_pago, t.created_at AS fecha_venta
      FROM comisiones c
      JOIN barberos b ON c.barbero_id = b.id
      JOIN transacciones_pos t ON c.transaccion_id = t.id
      ${where}
      ORDER BY c.created_at DESC
      LIMIT 200
    `, params);

    res.json(rows);
  } catch (err) { next(err); }
}

async function getResumen(req, res, next) {
  try {
    const { barberoId } = req.params;
    const { desde, hasta } = req.query;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const desdeDate = desde || startOfMonth.toISOString();
    const hastaDate = hasta || endOfDay.toISOString();

    const { rows } = await pool.query(`
      SELECT
        b.nombre || ' ' || b.apellido AS barbero_nombre,
        b.porcentaje_comision,
        COUNT(c.id) AS total_transacciones,
        COALESCE(SUM(c.monto_venta), 0) AS total_ventas,
        COALESCE(SUM(c.monto_comision), 0) AS total_comision,
        COALESCE(SUM(c.monto_comision) FILTER (WHERE c.estado = 'pagada'), 0) AS comision_pagada,
        COALESCE(SUM(c.monto_comision) FILTER (WHERE c.estado = 'pendiente'), 0) AS comision_pendiente
      FROM comisiones c
      JOIN barberos b ON c.barbero_id = b.id
      WHERE c.barbero_id = $1
        AND c.created_at BETWEEN $2 AND $3
      GROUP BY b.id, b.nombre, b.apellido, b.porcentaje_comision
    `, [barberoId, desdeDate, hastaDate]);

    res.json(rows[0] || { total_ventas: 0, total_comision: 0, comision_pendiente: 0 });
  } catch (err) { next(err); }
}

async function marcarPagada(req, res, next) {
  try {
    const { rows } = await pool.query(`
      UPDATE comisiones SET estado = 'pagada', paid_at = NOW()
      WHERE id = $1 RETURNING *
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Comisión no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { getAll, getResumen, marcarPagada };
