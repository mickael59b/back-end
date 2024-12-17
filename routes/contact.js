const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
    console.log('Contact route hit. Request body:', req.body);

    const { firstName, lastName, email, message, recaptchaToken } = req.body;

    // Validation des champs
    if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        // Contournement reCAPTCHA pour développement/Postman
        if (process.env.NODE_ENV === 'development' || recaptchaToken === 'bypass_recaptcha') {
            console.log('reCAPTCHA verification bypassed');
        } else {
            const secretKey = process.env.RECAPTCHA_SECRET_KEY;
            if (!secretKey) {
                console.error('reCAPTCHA secret key is not set');
                return res.status(500).json({ error: 'Configuration serveur incorrecte' });
            }

            const recaptchaResponse = await axios.post(
                `https://www.google.com/recaptcha/api/siteverify`,
                null,
                {
                    params: {
                        secret: secretKey,
                        response: recaptchaToken,
                    },
                }
            );

            if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
                return res.status(400).json({
                    error: 'reCAPTCHA échoué. Veuillez réessayer.',
                });
            }
        }

        // Configuration du transporteur email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        // Envoi de l'email
        await transporter.sendMail({
            from: `"Contact Portfolio" <${process.env.GMAIL_USER}>`,
            to: process.env.RECIPIENT_EMAIL,
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