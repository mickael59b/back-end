// Configuration et modules nécessaires
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Pour envoyer des emails
const { body, validationResult } = require('express-validator');
const axios = require('axios'); // Pour la validation reCAPTCHA

// Route POST pour recevoir le message de contact
router.post(
'/',
  [
    body('firstName').notEmpty().withMessage('Le prénom est requis.'),
    body('lastName').notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('Veuillez fournir un email valide.'),
    body('message')
      .isLength({ min: 10 })
      .withMessage('Le message doit contenir au moins 10 caractères.'),
    body('recaptchaToken').notEmpty().withMessage('Le token reCAPTCHA est manquant.'), // Validation du token reCAPTCHA
  ],
  async (req, res) => {
    // Valider les données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, message, recaptchaToken } = req.body;

    // Étape 1 : Valider le token reCAPTCHA avec l'API de Google
    try {
      const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY, // Clé secrète de votre compte Google reCAPTCHA
          response: recaptchaToken,
        },
      });

      if (!recaptchaResponse.data.success) {
        return res.status(400).json({
          success: false,
          message: 'Échec de la validation reCAPTCHA. Veuillez réessayer.',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification reCAPTCHA :', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification reCAPTCHA.',
      });
    }

    // Étape 2 : Envoyer l'email après validation du formulaire et du reCAPTCHA
    try {
      // Vérifiez les variables d'environnement (à des fins de débogage)
      console.log("EMAIL_USER:", process.env.EMAIL_USER || "Non trouvé");
      console.log("EMAIL_PASS:", process.env.EMAIL_PASS || "Non trouvé");

      // Configuration de Nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Injecté depuis Render
          pass: process.env.EMAIL_PASS, // Injecté depuis Render
        },
      });

      // Définir les options de l'email
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
        message: 'Message envoyé avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur. Veuillez réessayer plus tard.',
        error: error.message,
      });
    }
  }
);

module.exports = router;