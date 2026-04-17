const pool = require('../../db/pool');

async function getAll(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM servicios WHERE activo = true ORDER BY categoria, precio`
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM servicios WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { nombre, descripcion, precio, duracion_minutos, categoria } = req.body;
    const { rows } = await pool.query(`
      INSERT INTO servicios (nombre, descripcion, precio, duracion_minutos, categoria)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [nombre, descripcion, precio, duracion_minutos || 30, categoria || 'corte']);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { nombre, descripcion, precio, duracion_minutos, categoria } = req.body;
    const { rows } = await pool.query(`
      UPDATE servicios SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        precio = COALESCE($3, precio),
        duracion_minutos = COALESCE($4, duracion_minutos),
        categoria = COALESCE($5, categoria)
      WHERE id = $6 RETURNING *
    `, [nombre, descripcion, precio, duracion_minutos, categoria, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function toggleActivo(req, res, next) {
  try {
    const { rows } = await pool.query(`
      UPDATE servicios SET activo = NOT activo WHERE id = $1 RETURNING id, activo
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, toggleActivo };
