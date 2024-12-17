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
  console.log('Requête reçue:', req.body);  // Affiche les données reçues
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Erreur de validation:', errors.array());  // Affiche les erreurs de validation si présentes
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, message } = req.body;
  console.log('Données validées:', { firstName, lastName, email, message }); // Vérifie que les données sont validées correctement

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'ton.email@domaine.com',
      subject: 'Nouveau message de contact',
      text: `Vous avez reçu un message de ${firstName} ${lastName} (${email}) :\n\n${message}`,
    };

    console.log('Options d\'email:', mailOptions);  // Vérifie les options de l'email avant l'envoi
    await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès'); // Si l'email est envoyé sans erreur
    return res.status(200).json({ success: true, message: 'Message envoyé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);  // Log d'erreur détaillé
    return res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer plus tard.' });
  }
});

module.exports = router;
