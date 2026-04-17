const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function runSeed() {
  const client = await pool.connect();
  try {
    // Verificamos si ya hay datos
    const { rows } = await client.query('SELECT COUNT(*) FROM barberos');
    if (parseInt(rows[0].count) > 0) {
      console.log('📌 Seed ya aplicado, omitiendo...');
      return;
    }

    console.log('🌱 Insertando datos iniciales...');
    await client.query('BEGIN');

    // ─── Barberos ─────────────────────────────────────────────────
    const barberosResult = await client.query(`
      INSERT INTO barberos (nombre, apellido, bio, especialidad, porcentaje_comision, orden)
      VALUES
        ('Alejandro', 'Ríos',
         'Maestro barbero con 8 años de experiencia. Especialista en fades precisos y diseños geométricos de vanguardia.',
         'Fade & Diseño Geométrico', 42.00, 1),
        ('Miguel', 'Torres',
         'Barbero clásico con formación en técnicas europeas. Experto en cortes con tijera y afeitados de navaja tradicional.',
         'Corte Clásico & Navaja', 40.00, 2),
        ('Sebastián', 'Cruz',
         'Especialista en cuidado integral de barba. Conocimiento profundo en tratamientos capilares y productos premium.',
         'Barba & Grooming Premium', 38.00, 3)
      RETURNING id
    `);

    const barberoIds = barberosResult.rows.map(r => r.id);
    const [aleId, miguelId, sebId] = barberoIds;

    // ─── Servicios ────────────────────────────────────────────────
    await client.query(`
      INSERT INTO servicios (nombre, descripcion, precio, duracion_minutos, categoria)
      VALUES
        ('Corte Clásico', 'Corte de cabello con tijera o maquinilla, según estilo del cliente. Incluye lavado y secado.', 110000, 45, 'corte'),
        ('Corte + Barba', 'Servicio combinado: corte de cabello premium más diseño y perfilado de barba. Nuestra especialidad.', 140000, 75, 'combo'),
        ('Afeitado Tradicional con Navaja', 'Experiencia de afeitado clásico con navaja de filo, toalla caliente y bálsamo post-afeitado premium.', 80000, 45, 'barba'),
        ('Diseño y Perfilado de Barba', 'Definición de líneas, perfilado y arreglo integral de la barba con productos de alta gama.', 60000, 30, 'barba'),
        ('Tratamiento Capilar Profundo', 'Hidratación y nutrición intensiva del cuero cabelludo con productos especializados premium.', 90000, 60, 'tratamiento'),
        ('Fade Premium', 'Degradado de precisión milimétrica. Resultado impecable, acabado profesional.', 120000, 50, 'corte')
    `);

    // ─── Horarios de disponibilidad ──────────────────────────────
    for (const barberoId of barberoIds) {
      // Lunes a Viernes: 9am–7pm
      for (let dia = 1; dia <= 5; dia++) {
        await client.query(`
          INSERT INTO horarios_disponibilidad (barbero_id, dia_semana, hora_inicio, hora_fin)
          VALUES ($1, $2, '09:00', '19:00')
        `, [barberoId, dia]);
      }
      // Sábado: 8am–5pm
      await client.query(`
        INSERT INTO horarios_disponibilidad (barbero_id, dia_semana, hora_inicio, hora_fin)
        VALUES ($1, 6, '08:00', '17:00')
      `, [barberoId]);
    }

    // ─── Usuario Administrador ────────────────────────────────────
    const adminHash = await bcrypt.hash('LaCima2024!', 12);
    await client.query(`
      INSERT INTO usuarios (email, password_hash, nombre, rol)
      VALUES ('admin@lacima.co', $1, 'Administrador La Cima', 'admin')
    `, [adminHash]);

    // ─── Usuarios Barberos ────────────────────────────────────────
    const aleHash = await bcrypt.hash('barbero123', 12);
    const migHash = await bcrypt.hash('barbero123', 12);
    const sebHash = await bcrypt.hash('barbero123', 12);

    await client.query(`
      INSERT INTO usuarios (barbero_id, email, password_hash, nombre, rol)
      VALUES
        ($1, 'alejandro@lacima.co', $4, 'Alejandro Ríos', 'barbero'),
        ($2, 'miguel@lacima.co',    $5, 'Miguel Torres', 'barbero'),
        ($3, 'sebastian@lacima.co', $6, 'Sebastián Cruz', 'barbero')
    `, [aleId, miguelId, sebId, aleHash, migHash, sebHash]);

    // ─── Clientes de ejemplo ─────────────────────────────────────
    await client.query(`
      INSERT INTO clientes (nombre, telefono, email)
      VALUES
        ('Carlos Medina',    '3001234567', 'carlos.medina@email.com'),
        ('Andrés Ospina',    '3109876543', 'andres.ospina@email.com'),
        ('Jorge Ramírez',    '3205556677', null),
        ('Felipe Moreno',    '3154443322', 'f.moreno@email.com'),
        ('David Castillo',   '3001112233', null)
    `);

    await client.query('COMMIT');
    console.log('✅ Seed completado exitosamente');
    console.log('   Admin:    admin@lacima.co  / LaCima2024!');
    console.log('   Barberos: *@lacima.co      / barbero123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en seed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { runSeed };
