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
], (req, res) => {
  // Valider les données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Afficher les données du formulaire reçues
  const { firstName, lastName, email, message } = req.body;
  console.log("Données reçues du formulaire:", req.body); // Affiche dans la console du serveur

  // Retourner les données dans la réponse
  return res.status(200).json({
    success: true,
    message: "Données validées et formulaire reçu.",
    formData: { firstName, lastName, email, message }  // Retourner les données dans la réponse
  });
});


module.exports = router;
