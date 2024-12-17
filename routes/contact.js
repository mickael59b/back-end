const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
    const { firstName, lastName, email, message, recaptchaToken } = req.body;

    // Vérifier les champs obligatoires
    if (!firstName || !lastName || !email || !message || !recaptchaToken) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires.' });
    }

    // Vérification de reCAPTCHA
    try {
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken,
                },
            }
        );

        const { success, score, 'error-codes': errorCodes } = recaptchaResponse.data;

        // Vérifier si reCAPTCHA est valide et le score est suffisant
        if (!success || score < 0.5) {
            return res.status(400).json({
                success: false,
                message: 'Échec de la vérification reCAPTCHA.',
                ...(errorCodes && { errorCodes }),
            });
        }
    } catch (error) {
        console.error('Erreur reCAPTCHA:', error.message);
        return res.status(500).json({ success: false, message: 'Erreur lors de la vérification reCAPTCHA.' });
    }

    // Configurer le transporteur Nodemailer
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_PORT === '465', // Utiliser SSL pour le port 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Vérifier la connexion SMTP
    try {
        await transporter.verify();
        console.log('Connexion SMTP réussie.');
    } catch (err) {
        console.error('Erreur de connexion SMTP :', err.message);
        return res.status(500).json({ success: false, message: 'Erreur de connexion au serveur SMTP.' });
    }

    // Contenu de l'e-mail
    const mailOptions = {
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`, // Adresse e-mail de l'expéditeur
        to: process.env.EMAIL_USER, // Adresse e-mail du destinataire
        subject: 'Nouveau message depuis le formulaire de contact',
        html: `
            <h3>Vous avez reçu un nouveau message</h3>
            <p><strong>Prénom :</strong> ${firstName}</p>
            <p><strong>Nom :</strong> ${lastName}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Message :</strong></p>
            <p>${message}</p>
        `,
    };

    try {
        // Envoyer l'e-mail
        await transporter.sendMail(mailOptions);

        // Répondre au frontend
        return res.status(200).json({ success: true, message: 'Message envoyé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail:', error.message);
        return res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'e-mail.' });
    }
});

module.exports = router;