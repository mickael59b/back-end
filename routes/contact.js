const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
    console.log('Contact route hit. Request body:', req.body); // Log incoming request

    const { firstName, lastName, email, message, recaptchaToken } = req.body;

    // Detailed validation logging
    if (!firstName) console.log('Missing firstName');
    if (!lastName) console.log('Missing lastName');
    if (!email) console.log('Missing email');
    if (!message) console.log('Missing message');
    if (!recaptchaToken) console.log('Missing recaptchaToken');

    // Existing validation checks...
    if (!firstName || !lastName || !email || !message || !recaptchaToken) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        // Additional logging for reCAPTCHA verification
        console.log('Verifying reCAPTCHA with secret key:', process.env.RECAPTCHA_SECRET_KEY ? 'Present' : 'Missing');
        
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

        console.log('reCAPTCHA verification result:', recaptchaResponse.data);

        if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
            console.log('reCAPTCHA verification failed', recaptchaResponse.data);
            return res.status(400).json({
                error: 'reCAPTCHA échoué. Veuillez réessayer.',
            });
        }

        // Email configuration logging
        console.log('Configuring email transport with Gmail user:', process.env.GMAIL_USER ? 'Present' : 'Missing');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        console.log('Sending email to:', process.env.RECIPIENT_EMAIL);

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

        console.log('Email sent successfully');
        return res.status(200).json({ success: true, message: 'Message envoyé avec succès.' });

    } catch (error) {
        console.error('Erreur détaillée lors de l\'envoi du message :', {
            message: error.message,
            stack: error.stack,
            response: error.response ? error.response.data : 'No response data'
        });
        return res.status(500).json({ error: 'Erreur serveur lors de l\'envoi du message.' });
    }
});

module.exports = router;