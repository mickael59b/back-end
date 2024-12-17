const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message, captchaToken } = req.body;

  if (!name || !email || !message || !captchaToken) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    // Vérification du reCAPTCHA
    const verificationResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: captchaToken,
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

    // Envoi d'email
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
      subject: `Nouveau message de ${name}`,
      text: `
        Nom: ${name}
        Email: ${email}
        Message: ${message}
      `,
    });

    console.log('Email sent successfully');
    return res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

