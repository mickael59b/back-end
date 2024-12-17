require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Si tu veux envoyer des emails
const { body, validationResult } = require('express-validator');
const axios = require('axios'); // Pour la validation reCAPTCHA si nécessaire

// Route POST pour recevoir le message de contact
router.post('/', [
  body('firstName').notEmpty().withMessage('Le prénom est requis.'),
  body('lastName').notEmpty().withMessage('Le nom est requis.'),
  body('email').isEmail().withMessage('Veuillez fournir un email valide.'),
  body('message').isLength({ min: 10 }).withMessage('Le message doit contenir au moins 10 caractères.')
], async (req, res) => {
  // Valider les données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, message } = req.body;

  // Si tu veux envoyer un email de contact
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // Ton email depuis .env
        pass: process.env.EMAIL_PASS,  // Ton mot de passe d'application depuis .env
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'mboutte621@gmail.com',
      subject: 'Nouveau message de contact',
      text: `Vous avez reçu un message de ${firstName} ${lastName} (${email}) :\n\n${message}`,
    };
  
    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    
    console.log('Email envoyé avec succès');
  
    return res.status(200).json({
      success: true,
      message: 'Données validées et formulaire reçu.'
    });
  
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email :', error);
    return res.status(500).json({
      message: 'Erreur serveur. Veuillez réessayer plus tard.',
      error: error.message, // Ajout du message d'erreur pour plus de détails
    });
  }
});

module.exports = router;

