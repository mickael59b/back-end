const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        console.log('Form data received:', req.body);
        
        const { firstName, lastName, email, message, recaptchaToken } = req.body;
        
        // Vérifier si tous les champs sont présents
        if (!firstName || !lastName || !email || !message || !recaptchaToken) {
            console.error('Un champ obligatoire est manquant!');
            return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires.' });
        }

        console.log('Vérification reCAPTCHA...');
        const recaptchaResponse = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken,
                },
            }
        );
        console.log('Réponse de la validation reCAPTCHA:', recaptchaResponse.data);

        if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
            console.error('Échec de la validation reCAPTCHA.');
            return res.status(400).json({
                success: false,
                message: 'Échec de la vérification reCAPTCHA.',
            });
        }

        // Configuration de Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10),
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        console.log('Envoi de l\'email...');
        await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'Nouveau message depuis le formulaire de contact',
            html: `
                <p><strong>Prénom:</strong> ${firstName}</p>
                <p><strong>Nom:</strong> ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
            `,
        });

        console.log('Email envoyé avec succès!');
        return res.status(200).json({ success: true, message: 'Message envoyé avec succès.' });
    } catch (error) {
        console.error('Erreur serveur:', error.message);
        console.error(error.stack);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
});

module.exports = router;