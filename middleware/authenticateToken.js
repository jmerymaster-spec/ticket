const jwt = require('jsonwebtoken');
const secretValue = process.env.JWT_CLAVE;

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(403).send('Se requiere un token para autentificación.');

  jwt.verify(token, secretValue, (err, user) => {
    try{
      if (err) { 
        return res.status(403).send('Token inválido.');
      }
      const payload = jwt.verify(token, secretValue);
      req.user = payload.email;
      next();
    } catch (error) {
        res.status(500).json({ message: 'Error en autentificación de token.', error: error.message });
    }
  });
}

module.exports = authenticateToken;
