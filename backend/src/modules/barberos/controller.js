const pool = require('../../db/pool');

async function getAll(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT b.*,
        COALESCE(
          json_agg(
            json_build_object(
              'dia_semana', hd.dia_semana,
              'hora_inicio', hd.hora_inicio,
              'hora_fin', hd.hora_fin
            ) ORDER BY hd.dia_semana
          ) FILTER (WHERE hd.id IS NOT NULL),
          '[]'
        ) AS horarios
      FROM barberos b
      LEFT JOIN horarios_disponibilidad hd ON hd.barbero_id = b.id AND hd.activo = true
      WHERE b.activo = true
      GROUP BY b.id
      ORDER BY b.orden, b.id
    `);
    res.json(rows);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT b.*,
        COALESCE(
          json_agg(
            json_build_object(
              'dia_semana', hd.dia_semana,
              'hora_inicio', hd.hora_inicio,
              'hora_fin', hd.hora_fin
            ) ORDER BY hd.dia_semana
          ) FILTER (WHERE hd.id IS NOT NULL),
          '[]'
        ) AS horarios
      FROM barberos b
      LEFT JOIN horarios_disponibilidad hd ON hd.barbero_id = b.id AND hd.activo = true
      WHERE b.id = $1
      GROUP BY b.id
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Barbero no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { nombre, apellido, bio, especialidad, porcentaje_comision, foto_url, orden } = req.body;
    const { rows } = await pool.query(`
      INSERT INTO barberos (nombre, apellido, bio, especialidad, porcentaje_comision, foto_url, orden)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [nombre, apellido, bio, especialidad, porcentaje_comision || 40, foto_url, orden || 0]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, apellido, bio, especialidad, porcentaje_comision, foto_url, orden } = req.body;
    const { rows } = await pool.query(`
      UPDATE barberos SET
        nombre = COALESCE($1, nombre),
        apellido = COALESCE($2, apellido),
        bio = COALESCE($3, bio),
        especialidad = COALESCE($4, especialidad),
        porcentaje_comision = COALESCE($5, porcentaje_comision),
        foto_url = COALESCE($6, foto_url),
        orden = COALESCE($7, orden),
        updated_at = NOW()
      WHERE id = $8 RETURNING *
    `, [nombre, apellido, bio, especialidad, porcentaje_comision, foto_url, orden, id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Barbero no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function toggleActivo(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      UPDATE barberos SET activo = NOT activo, updated_at = NOW()
      WHERE id = $1 RETURNING id, activo
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Barbero no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, toggleActivo };
