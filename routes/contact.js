const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
    const { firstName, lastName, email, message, recaptchaToken } = req.body;

    // Vérification des champs obligatoires
    if (!firstName || !lastName || !email || !message || !recaptchaToken) {
        console.error('Erreur: Champs manquants dans le formulaire.');
        return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires.' });
    }

    try {
        // Vérification de reCAPTCHA
        console.log('Vérification de reCAPTCHA...');
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

        console.log('reCAPTCHA response:', recaptchaResponse.data);
        
        if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
            console.error('Échec de la vérification reCAPTCHA.');
            return res.status(400).json({
                success: false,
                message: 'Échec de la vérification reCAPTCHA.',
            });
        }

        console.log('reCAPTCHA validé avec succès.');
    } catch (error) {
        console.error('Erreur lors de la vérification reCAPTCHA:', error.message);
        return res.status(500).json({ success: false, message: 'Erreur lors de la vérification reCAPTCHA.' });
    }

    // Configuration du transporteur Nodemailer
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        // Envoi de l'email
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
        console.log('Message envoyé avec succès.');
        res.status(200).json({ success: true, message: 'Message envoyé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error.message);
        console.error(error.stack);
        res.status(500).json({ success: false, message: "Erreur lors de l'envoi de l'email." });
    }
});

module.exports = router;