const pool = require('../../db/pool');

async function getAll(req, res, next) {
  try {
    const { search } = req.query;
    let query = `SELECT c.*,
      COUNT(ci.id) AS total_citas,
      SUM(CASE WHEN ci.estado = 'completada' THEN ci.monto ELSE 0 END) AS total_gastado
      FROM clientes c
      LEFT JOIN citas ci ON ci.cliente_id = c.id`;
    const params = [];

    if (search) {
      query += ` WHERE c.nombre ILIKE $1 OR c.telefono ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC`;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
        json_agg(
          json_build_object(
            'id', ci.id, 'fecha', ci.fecha_hora_inicio,
            'servicio', s.nombre, 'barbero', b.nombre || ' ' || b.apellido,
            'estado', ci.estado, 'monto', ci.monto
          ) ORDER BY ci.fecha_hora_inicio DESC
        ) FILTER (WHERE ci.id IS NOT NULL) AS historial
      FROM clientes c
      LEFT JOIN citas ci ON ci.cliente_id = c.id
      LEFT JOIN servicios s ON ci.servicio_id = s.id
      LEFT JOIN barberos b ON ci.barbero_id = b.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

// Público — usado en el booking flow: busca por teléfono o crea nuevo
async function createOrFind(req, res, next) {
  try {
    const { nombre, telefono, email } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

    if (telefono) {
      const existing = await pool.query(
        'SELECT * FROM clientes WHERE telefono = $1', [telefono]
      );
      if (existing.rows.length > 0) {
        // Actualizar nombre si cambió
        const { rows } = await pool.query(`
          UPDATE clientes SET nombre = $1, email = COALESCE($2, email), updated_at = NOW()
          WHERE telefono = $3 RETURNING *
        `, [nombre, email, telefono]);
        return res.json({ ...rows[0], isNew: false });
      }
    }

    const { rows } = await pool.query(`
      INSERT INTO clientes (nombre, telefono, email) VALUES ($1,$2,$3) RETURNING *
    `, [nombre, telefono || null, email || null]);
    res.status(201).json({ ...rows[0], isNew: true });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { nombre, telefono, email, notas } = req.body;
    const { rows } = await pool.query(`
      UPDATE clientes SET
        nombre = COALESCE($1, nombre),
        telefono = COALESCE($2, telefono),
        email = COALESCE($3, email),
        notas = COALESCE($4, notas),
        updated_at = NOW()
      WHERE id = $5 RETURNING *
    `, [nombre, telefono, email, notas, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, createOrFind, update };
