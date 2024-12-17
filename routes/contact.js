const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { firstName, lastName, email, message, recaptchaToken } = req.body;

  // Vérification des champs obligatoires
  if (!firstName || !lastName || !email || !message || !recaptchaToken) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Vérification du format de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    // Vérification du token reCAPTCHA
    const verificationResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaToken,
        },
      }
    );

    if (!verificationResponse.data.success || verificationResponse.data.score < 0.5) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CAPTCHA',
        message: 'reCAPTCHA verification failed. Please try again.',
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
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Nouveau message de ${firstName} ${lastName}`,
      text: `
        Prénom: ${firstName}
        Nom: ${lastName}
        Email: ${email}
        Message: ${message}
      `,
    });

    return res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

