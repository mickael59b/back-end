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
  // Valider les données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, message } = req.body;

  try {
    // Si tu souhaites envoyer un email de contact
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Exemple pour Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'ton.email@domaine.com', // Ton email pour recevoir les messages
      subject: 'Nouveau message de contact',
      text: `Vous avez reçu un message de ${firstName} ${lastName} (${email}) :\n\n${message}`,
    };

    // Envoi du message
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Message envoyé avec succès.' });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message :', error);
    return res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer plus tard.' });
  }
});

module.exports = router;
