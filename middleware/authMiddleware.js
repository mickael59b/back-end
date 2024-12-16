// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Extraire le token depuis l'entête "Authorization"

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ajoute les informations de l'utilisateur à la requête
    next(); // Passe à la prochaine étape (route suivante)
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
}

module.exports = authMiddleware;

