// routes/upload.js
const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
require('dotenv').config();  // Charger les variables d'environnement

// Récupérer le Client-ID d'Imgur à partir des variables d'environnement
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

// Configurer Multer pour accepter l'image
const storage = multer.memoryStorage();  // Utiliser la mémoire pour stocker temporairement le fichier
const upload = multer({ storage: storage });

// Route pour l'upload d'image
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé' });
  }

  try {
    // Créer un objet FormData pour envoyer l'image
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));  // Convertir l'image en base64

    // Envoyer la requête à Imgur
    const response = await axios.post('https://api.imgur.com/3/image', formData, {
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        ...formData.getHeaders(),
      }
    });

    // Retourner l'URL de l'image téléchargée sur Imgur
    const imageUrl = response.data.data.link;
    res.json({ fileUrl: imageUrl });
  } catch (err) {
    console.error('Erreur lors de l\'upload sur Imgur:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image sur Imgur', message: err.message });
  }
});

module.exports = router;
