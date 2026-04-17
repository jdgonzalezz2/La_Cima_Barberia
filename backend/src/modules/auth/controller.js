const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../../db/pool');

const JWT_SECRET = process.env.JWT_SECRET || 'lacima_jwt_super_secret_key_2024_development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const { rows } = await pool.query(
      `SELECT u.*, b.nombre AS barbero_nombre, b.apellido AS barbero_apellido
       FROM usuarios u
       LEFT JOIN barberos b ON u.barbero_id = b.id
       WHERE u.email = $1 AND u.activo = true`,
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      barberoId: user.barbero_id,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        barberoId: user.barbero_id,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function logout(req, res) {
  // JWT stateless — el cliente descarta el token
  res.json({ message: 'Sesión cerrada exitosamente' });
}

module.exports = { login, me, logout };
