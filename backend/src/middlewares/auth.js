const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lacima_jwt_super_secret_key_2024_development';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado, por favor inicie sesión nuevamente' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
}

function requireBarberoOrAdmin(req, res, next) {
  if (!['admin', 'barbero'].includes(req.user?.rol)) {
    return res.status(403).json({ error: 'Acceso denegado.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireBarberoOrAdmin };
