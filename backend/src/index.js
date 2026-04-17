const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
// Fallback: also try backend root
if (!process.env.DB_HOST) require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { runMigrations } = require('./db/migrations');
const { runSeed } = require('./db/seed');
const errorHandler = require('./middlewares/errorHandler');

// Rutas
const authRoutes = require('./modules/auth/routes');
const barberosRoutes = require('./modules/barberos/routes');
const serviciosRoutes = require('./modules/servicios/routes');
const clientesRoutes = require('./modules/clientes/routes');
const agendaRoutes = require('./modules/agenda/routes');
const posRoutes = require('./modules/pos/routes');
const comisionesRoutes = require('./modules/comisiones/routes');
const whatsappRoutes = require('./modules/whatsapp/routes');
const dianRoutes = require('./modules/dian/routes');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middlewares globales ──────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'La Cima Barbería API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/barberos',    barberosRoutes);
app.use('/api/servicios',   serviciosRoutes);
app.use('/api/clientes',    clientesRoutes);
app.use('/api/agenda',      agendaRoutes);
app.use('/api/pos',         posRoutes);
app.use('/api/comisiones',  comisionesRoutes);
app.use('/api/whatsapp',    whatsappRoutes);
app.use('/api/dian',        dianRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Error handler ────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Startup ──────────────────────────────────────────────────────────────
async function start() {
  try {
    console.log('🔧 Ejecutando migraciones...');
    await runMigrations();

    console.log('🌱 Ejecutando seed inicial...');
    await runSeed();

    app.listen(PORT, () => {
      console.log(`\n✅ La Cima API corriendo en http://localhost:${PORT}`);
      console.log(`📋 Health: http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
