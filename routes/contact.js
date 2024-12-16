// routes/contact.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message, captchaToken } = req.body;

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    // Vérification du token reCAPTCHA
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

    if (!verificationResponse.data.success) {
      return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' });
    }

    // Traitement du message (par exemple, envoyer un e-mail ou sauvegarder en base de données)
    console.log('Form submitted by:', name, email, message);

    return res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error occurred while verifying reCAPTCHA:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
