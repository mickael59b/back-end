const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const authMiddleware = require('../middleware/authMiddleware'); // Importation du middleware d'authentification
const router = express.Router();

// Validation du mot de passe
const passwordValidation = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

// Inscription (register)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email invalide' });
  }

  // Vérification si l'email est déjà utilisé
  const existingClient = await Client.findOne({ email });
  if (existingClient) {
    return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
  }

  // Validation du mot de passe
  if (!passwordValidation(password)) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule et un chiffre.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouveau client avec le rôle et l'avatar par défaut
    const client = new Client({
      name,
      email,
      password: hashedPassword,
      role: 'client',  // Rôle par défaut
      avatar: 'https://acti-informatique.com/web-core/uploads/avatar/default-avatar.png', // Avatar par défaut
    });

    await client.save();  // Sauvegarde du client dans la base de données
    res.status(201).json({ message: 'Client enregistré avec succès!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue. Veuillez réessayer plus tard.' });
  }
});

// Connexion (login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await Client.findOne({ email });
    if (!client) return res.status(404).json({ message: 'Client non trouvé!' });

    const isPasswordValid = await bcrypt.compare(password, client.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Mot de passe incorrect!' });

    const token = jwt.sign({ id: client._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        name: client.name,
        email: client.email,
        avatar: client.avatar || 'https://acti-informatique.com/web-core/uploads/avatar/default-avatar.png', // Avatar par défaut si non défini
        role: client.role, // Inclure le rôle
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue. Veuillez réessayer plus tard.' });
  }
});

// Route protégée: Récupérer les informations de l'utilisateur connecté
router.get('/getClientInfo', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findById(req.user.id).select('-password'); // Ne pas retourner le mot de passe
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.json({
      id: client._id,
      name: client.name,
      email: client.email,
      avatar: client.avatar || 'https://acti-informatique.com/web-core/uploads/avatar/default-avatar.png', // Avatar par défaut si non défini
      role: client.role,  // Renvoyer le rôle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Route protégée pour mettre à jour les informations du client
router.put('/updateClient', authMiddleware, async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const client = await Client.findById(req.user.id); // Trouver le client avec l'id de l'utilisateur
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Si le client existe, on met à jour les informations
    if (name) client.name = name;
    if (email) client.email = email;
    if (phone) client.phone = phone;

    await client.save(); // Sauvegarde les modifications dans la base de données

    res.json({ message: 'Informations mises à jour avec succès', client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour des informations' });
  }
});

module.exports = router;

