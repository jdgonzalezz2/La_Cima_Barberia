const pool = require('../../db/pool');

const SLOT_INTERVAL_MINUTES = 15; // Granularidad de slots

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/agenda/disponibilidad/:barberoId/:fecha
// Retorna los slots disponibles para un barbero en una fecha dada
// ──────────────────────────────────────────────────────────────────────────────
async function getDisponibilidad(req, res, next) {
  try {
    const { barberoId, fecha } = req.params;
    // fecha esperada: YYYY-MM-DD

    // 1. Obtener horario laboral del barbero para ese día de la semana
    const fechaDate = new Date(fecha + 'T00:00:00-05:00'); // Bogotá UTC-5
    const diaSemana = fechaDate.getDay(); // 0=Dom ... 6=Sáb

    const horarioResult = await pool.query(`
      SELECT hora_inicio, hora_fin FROM horarios_disponibilidad
      WHERE barbero_id = $1 AND dia_semana = $2 AND activo = true
    `, [barberoId, diaSemana]);

    if (horarioResult.rows.length === 0) {
      return res.json({ slots: [], mensaje: 'El barbero no trabaja ese día' });
    }

    const { hora_inicio, hora_fin } = horarioResult.rows[0];

    // 2. Obtener citas ya reservadas ese día
    const citasResult = await pool.query(`
      SELECT fecha_hora_inicio, fecha_hora_fin FROM citas
      WHERE barbero_id = $1
        AND fecha_hora_inicio::date = $2::date
        AND estado NOT IN ('cancelada', 'no_show')
      ORDER BY fecha_hora_inicio
    `, [barberoId, fecha]);

    // 3. Obtener bloqueos del establecimiento/barbero
    const bloqueosResult = await pool.query(`
      SELECT fecha_inicio, fecha_fin FROM bloqueos_agenda
      WHERE (barbero_id = $1 OR barbero_id IS NULL)
        AND fecha_inicio::date <= $2::date
        AND fecha_fin::date >= $2::date
    `, [barberoId, fecha]);

    // 4. Generar todos los slots posibles
    const slots = [];
    const [hIni, mIni] = hora_inicio.split(':').map(Number);
    const [hFin, mFin] = hora_fin.split(':').map(Number);
    const inicioMinutos = hIni * 60 + mIni;
    const finMinutos   = hFin * 60 + mFin;
    const ahora = new Date();

    for (let m = inicioMinutos; m < finMinutos; m += SLOT_INTERVAL_MINUTES) {
      const slotH = Math.floor(m / 60);
      const slotM = m % 60;
      const hora = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;

      const slotFecha = new Date(`${fecha}T${hora}:00-05:00`);
      if (slotFecha < ahora) continue; // No mostrar slots pasados

      // Verificar si el slot se superpone con una cita
      const ocupado = citasResult.rows.some(cita => {
        const citaIni = new Date(cita.fecha_hora_inicio);
        const citaFin = new Date(cita.fecha_hora_fin);
        return slotFecha >= citaIni && slotFecha < citaFin;
      });

      // Verificar bloqueos
      const bloqueado = bloqueosResult.rows.some(bloqueo => {
        return slotFecha >= new Date(bloqueo.fecha_inicio) &&
               slotFecha <= new Date(bloqueo.fecha_fin);
      });

      slots.push({ hora, disponible: !ocupado && !bloqueado });
    }

    res.json({ slots, fecha, barberoId, diaSemana });
  } catch (err) { next(err); }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/agenda
// Crea una cita con control de concurrencia pesimista (SELECT FOR UPDATE)
// ──────────────────────────────────────────────────────────────────────────────
async function createCita(req, res, next) {
  const client = await pool.connect();
  try {
    const { barberoId, servicioId, clienteNombre, clienteTelefono, clienteEmail, fechaHoraInicio, notas } = req.body;

    if (!barberoId || !servicioId || !clienteNombre || !fechaHoraInicio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: barberoId, servicioId, clienteNombre, fechaHoraInicio' });
    }

    await client.query('BEGIN');

    // ── Obtener duración y precio del servicio ────────────────────────────
    const servicioResult = await client.query(
      'SELECT duracion_minutos, precio, nombre FROM servicios WHERE id = $1 AND activo = true',
      [servicioId]
    );
    if (servicioResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Servicio no encontrado o inactivo' });
    }

    const { duracion_minutos, precio, nombre: servicioNombre } = servicioResult.rows[0];
    const tInicio = new Date(fechaHoraInicio);
    const tFin    = new Date(tInicio.getTime() + duracion_minutos * 60 * 1000);

    // ── SELECT FOR UPDATE — bloqueo pesimista con ORDER BY para prevenir deadlocks ──
    // Bloqueamos todas las citas del barbero en ese día que pudieran solaparse
    const lockResult = await client.query(`
      WITH citas_solapadas AS (
        SELECT id FROM citas
        WHERE barbero_id = $1
          AND estado NOT IN ('cancelada', 'no_show')
          AND (
            (fecha_hora_inicio <= $2 AND fecha_hora_fin > $2) OR
            (fecha_hora_inicio < $3  AND fecha_hora_fin >= $3) OR
            (fecha_hora_inicio >= $2 AND fecha_hora_fin <= $3)
          )
        ORDER BY id
        FOR UPDATE
      )
      SELECT COUNT(*) AS conflictos FROM citas_solapadas
    `, [barberoId, tInicio.toISOString(), tFin.toISOString()]);

    const conflictos = parseInt(lockResult.rows[0].conflictos);
    if (conflictos > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'El horario seleccionado acaba de ser reservado. Por favor elige otro horario.',
        code: 'SLOT_TAKEN',
      });
    }

    // ── Crear o encontrar cliente ─────────────────────────────────────────
    let clienteId = null;
    if (clienteTelefono) {
      const existing = await client.query(
        'SELECT id FROM clientes WHERE telefono = $1', [clienteTelefono]
      );
      if (existing.rows.length > 0) {
        clienteId = existing.rows[0].id;
        await client.query(
          'UPDATE clientes SET nombre = $1, updated_at = NOW() WHERE id = $2',
          [clienteNombre, clienteId]
        );
      }
    }
    if (!clienteId) {
      const newCliente = await client.query(
        'INSERT INTO clientes (nombre, telefono, email) VALUES ($1,$2,$3) RETURNING id',
        [clienteNombre, clienteTelefono || null, clienteEmail || null]
      );
      clienteId = newCliente.rows[0].id;
    }

    // ── Insertar la cita — UNIQUE constraint es la barrera final ─────────
    const citaResult = await client.query(`
      INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha_hora_inicio, fecha_hora_fin, estado, monto, notas)
      VALUES ($1, $2, $3, $4, $5, 'confirmada', $6, $7)
      RETURNING *
    `, [clienteId, barberoId, servicioId, tInicio.toISOString(), tFin.toISOString(), precio, notas || null]);

    await client.query('COMMIT');

    const cita = citaResult.rows[0];
    res.status(201).json({
      success: true,
      cita: {
        ...cita,
        servicio: servicioNombre,
        duracion_minutos,
        precio,
        cliente: { nombre: clienteNombre, telefono: clienteTelefono },
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    // UNIQUE constraint violation = cruce de agenda por race condition extrema
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'El horario fue tomado en el mismo instante por otro usuario. Por favor elige otro.',
        code: 'RACE_CONDITION',
      });
    }
    next(err);
  } finally {
    client.release();
  }
}

async function getCitas(req, res, next) {
  try {
    const { fecha, barberoId, estado, limit = 50, offset = 0 } = req.query;
    let conditions = [];
    const params = [];
    let idx = 1;

    if (fecha) {
      conditions.push(`c.fecha_hora_inicio::date = $${idx++}::date`);
      params.push(fecha);
    }
    if (barberoId) {
      conditions.push(`c.barbero_id = $${idx++}`);
      params.push(barberoId);
    }
    if (estado) {
      conditions.push(`c.estado = $${idx++}`);
      params.push(estado);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(`
      SELECT c.*,
        cl.nombre AS cliente_nombre, cl.telefono AS cliente_telefono,
        b.nombre || ' ' || b.apellido AS barbero_nombre,
        s.nombre AS servicio_nombre, s.duracion_minutos
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      JOIN barberos b ON c.barbero_id = b.id
      JOIN servicios s ON c.servicio_id = s.id
      ${where}
      ORDER BY c.fecha_hora_inicio DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `, [...params, limit, offset]);

    res.json(rows);
  } catch (err) { next(err); }
}

async function getCitaById(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
        cl.nombre AS cliente_nombre, cl.telefono AS cliente_telefono, cl.email AS cliente_email,
        b.nombre || ' ' || b.apellido AS barbero_nombre,
        s.nombre AS servicio_nombre, s.duracion_minutos, s.precio
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      JOIN barberos b ON c.barbero_id = b.id
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function updateEstado(req, res, next) {
  try {
    const { estado } = req.body;
    const validEstados = ['pendiente','confirmada','completada','cancelada','no_show'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const { rows } = await pool.query(`
      UPDATE citas SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *
    `, [estado, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function cancelar(req, res, next) {
  try {
    const { rows } = await pool.query(`
      UPDATE citas SET estado = 'cancelada', updated_at = NOW()
      WHERE id = $1 RETURNING id, estado
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { getDisponibilidad, createCita, getCitas, getCitaById, updateEstado, cancelar };
