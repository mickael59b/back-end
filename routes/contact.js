const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

// Gestionnaire de la route POST pour /api/contact
router.post('/', async (req, res) => {
    const { firstName, lastName, email, message, recaptchaToken } = req.body;

    // Vérifier que tous les champs sont fournis
    if (!firstName || !lastName || !email || !message || !recaptchaToken) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "L'email fourni est invalide." });
    }

    // Validation du message
    if (message.length < 10) {
        return res.status(400).json({ error: 'Votre message doit contenir au moins 10 caractères.' });
    }

    try {
        // Vérification du reCAPTCHA
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: secretKey,
                    response: recaptchaToken,
                },
            }
        );

        if (!response.data.success || response.data.score < 0.5) {
            return res.status(400).json({
                error: 'reCAPTCHA échoué. Veuillez réessayer.',
            });
        }

        // Envoi de l'email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Contact Portfolio" <${process.env.GMAIL_USER}>`,
            to: process.env.RECIPIENT_EMAIL, // Remplacer par l'email du destinataire
            subject: `Nouveau message de ${firstName} ${lastName}`,
            text: `
                Nom : ${firstName} ${lastName}
                Email : ${email}
                Message : ${message}
            `,
        });

        return res.status(200).json({ success: true, message: 'Message envoyé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message :', error);
        return res.status(500).json({ error: 'Erreur serveur lors de l\'envoi du message.' });
    }
});

module.exports = router;