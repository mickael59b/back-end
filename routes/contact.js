const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Si tu veux envoyer des emails
const { body, validationResult } = require('express-validator');

// Route POST pour recevoir le message de contact
router.post('/', [
  body('firstName').notEmpty().withMessage('Le prénom est requis.'),
  body('lastName').notEmpty().withMessage('Le nom est requis.'),
  body('email').isEmail().withMessage('Veuillez fournir un email valide.'),
  body('message').isLength({ min: 10 }).withMessage('Le message doit contenir au moins 10 caractères.')
], async (req, res) => {
  console.log('Requête reçue:', req.body);  // Log les données envoyées par le front-end

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Erreur de validation:', errors.array());  // Log les erreurs de validation
    return res.status(400).json({ errors: errors.array() });
  }

  // Valider les données avant d'envoyer une réponse
  const { firstName, lastName, email, message } = req.body;
  console.log('Données validées:', { firstName, lastName, email, message });

  try {
    // Simuler une réponse de succès sans envoyer de message
    return res.status(200).json({ success: true, message: 'Données validées et formulaire reçu.' });
  } catch (error) {
    console.error('Erreur lors de la validation:', error);  // Log l'erreur si elle survient
    return res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer plus tard.' });
  }
});

module.exports = router;
