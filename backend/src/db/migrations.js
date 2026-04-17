const pool = require('./pool');

const SQL_MIGRATIONS = `
-- ═══════════════════════════════════════════════════════
-- LA CIMA BARBERÍA — Schema PostgreSQL
-- Control de concurrencia con SELECT FOR UPDATE + UNIQUE
-- ═══════════════════════════════════════════════════════

-- Extensión para UUID (opcional, usamos SERIAL por simplicidad)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Barberos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS barberos (
  id                   SERIAL PRIMARY KEY,
  nombre               VARCHAR(100) NOT NULL,
  apellido             VARCHAR(100) NOT NULL,
  foto_url             TEXT,
  bio                  TEXT,
  especialidad         VARCHAR(200),
  porcentaje_comision  DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  activo               BOOLEAN NOT NULL DEFAULT true,
  orden                INTEGER DEFAULT 0,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Servicios ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servicios (
  id                SERIAL PRIMARY KEY,
  nombre            VARCHAR(100) NOT NULL,
  descripcion       TEXT,
  precio            DECIMAL(10,2) NOT NULL,
  duracion_minutos  INTEGER NOT NULL DEFAULT 30,
  categoria         VARCHAR(50) DEFAULT 'corte',
  activo            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Usuarios (Admin / Barbero) ───────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  barbero_id     INTEGER REFERENCES barberos(id) ON DELETE SET NULL,
  email          VARCHAR(200) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  nombre         VARCHAR(100) NOT NULL,
  rol            VARCHAR(20) NOT NULL DEFAULT 'barbero' CHECK (rol IN ('admin', 'barbero')),
  activo         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Clientes (CRM básico) ────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  telefono   VARCHAR(30),
  email      VARCHAR(200),
  notas      TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

-- ─── Horarios de disponibilidad semanal ───────────────
CREATE TABLE IF NOT EXISTS horarios_disponibilidad (
  id           SERIAL PRIMARY KEY,
  barbero_id   INTEGER NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
  dia_semana   INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Dom, 6=Sáb
  hora_inicio  TIME NOT NULL,
  hora_fin     TIME NOT NULL,
  activo       BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(barbero_id, dia_semana)
);

-- ─── Bloqueos de agenda (vacaciones, festivos) ────────
CREATE TABLE IF NOT EXISTS bloqueos_agenda (
  id           SERIAL PRIMARY KEY,
  barbero_id   INTEGER REFERENCES barberos(id) ON DELETE CASCADE, -- NULL = todo el local
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin    TIMESTAMP WITH TIME ZONE NOT NULL,
  motivo       TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── CITAS (corazón del sistema) ──────────────────────
-- UNIQUE en (barbero_id, fecha_hora_inicio) es la barrera
-- física inquebrantable anti-cruce de agenda
CREATE TABLE IF NOT EXISTS citas (
  id                 SERIAL PRIMARY KEY,
  cliente_id         INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  barbero_id         INTEGER NOT NULL REFERENCES barberos(id),
  servicio_id        INTEGER NOT NULL REFERENCES servicios(id),
  fecha_hora_inicio  TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_hora_fin     TIMESTAMP WITH TIME ZONE NOT NULL,
  estado             VARCHAR(20) NOT NULL DEFAULT 'confirmada'
                     CHECK (estado IN ('pendiente','confirmada','completada','cancelada','no_show')),
  monto              DECIMAL(10,2) NOT NULL,
  notas              TEXT,
  notificacion_enviada BOOLEAN DEFAULT false,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- BARRERA ANTI-CRUCE: imposible 2 citas misma hora mismo barbero
  CONSTRAINT no_cruce_agenda UNIQUE(barbero_id, fecha_hora_inicio)
);
CREATE INDEX IF NOT EXISTS idx_citas_barbero_fecha ON citas(barbero_id, fecha_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora_inicio);

-- ─── Transacciones POS ────────────────────────────────
CREATE TABLE IF NOT EXISTS transacciones_pos (
  id              SERIAL PRIMARY KEY,
  cita_id         INTEGER REFERENCES citas(id) ON DELETE SET NULL,
  barbero_id      INTEGER NOT NULL REFERENCES barberos(id),
  cliente_id      INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  subtotal        DECIMAL(10,2) NOT NULL,
  descuento       DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  metodo_pago     VARCHAR(30) NOT NULL
                  CHECK (metodo_pago IN ('efectivo','tarjeta_credito','tarjeta_debito','transferencia','nequi','daviplata')),
  estado          VARCHAR(20) NOT NULL DEFAULT 'completada'
                  CHECK (estado IN ('completada','anulada','pendiente')),
  numero_factura  VARCHAR(60),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pos_barbero ON transacciones_pos(barbero_id);
CREATE INDEX IF NOT EXISTS idx_pos_created ON transacciones_pos(created_at);

-- ─── Items de transacción ─────────────────────────────
CREATE TABLE IF NOT EXISTS items_transaccion (
  id               SERIAL PRIMARY KEY,
  transaccion_id   INTEGER NOT NULL REFERENCES transacciones_pos(id) ON DELETE CASCADE,
  servicio_id      INTEGER REFERENCES servicios(id) ON DELETE SET NULL,
  descripcion      VARCHAR(200) NOT NULL,
  cantidad         INTEGER NOT NULL DEFAULT 1,
  precio_unitario  DECIMAL(10,2) NOT NULL,
  subtotal         DECIMAL(10,2) NOT NULL
);

-- ─── Comisiones ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS comisiones (
  id              SERIAL PRIMARY KEY,
  barbero_id      INTEGER NOT NULL REFERENCES barberos(id),
  transaccion_id  INTEGER NOT NULL REFERENCES transacciones_pos(id),
  monto_venta     DECIMAL(10,2) NOT NULL,
  porcentaje      DECIMAL(5,2) NOT NULL,
  monto_comision  DECIMAL(10,2) NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente','pagada')),
  periodo_inicio  DATE,
  periodo_fin     DATE,
  paid_at         TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comisiones_barbero ON comisiones(barbero_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_estado ON comisiones(estado);

-- ─── Facturas electrónicas DIAN ──────────────────────
CREATE TABLE IF NOT EXISTS facturas_electronicas (
  id              SERIAL PRIMARY KEY,
  transaccion_id  INTEGER NOT NULL REFERENCES transacciones_pos(id),
  numero_factura  VARCHAR(60) NOT NULL,
  cufe            VARCHAR(200),
  qr_codigo       TEXT,
  xml_documento   TEXT,
  estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente','emitida','error')),
  respuesta_dian  JSONB,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('📦 Aplicando migraciones...');
    await client.query(SQL_MIGRATIONS);
    console.log('✅ Migraciones completadas');
  } catch (err) {
    console.error('❌ Error en migraciones:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { runMigrations };
