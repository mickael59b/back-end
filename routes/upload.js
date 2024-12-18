const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configuration de multer pour stocker temporairement l'image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Dossier temporaire pour l'upload local
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique du fichier
  },
});

const upload = multer({ storage: storage });

// Route d'upload d'image
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé' });
  }

  try {
    const imgurClientId = process.env.IMGUR_CLIENT_ID; // Utilisez votre Client-ID Imgur ici
    const imgurUploadUrl = 'https://api.imgur.com/3/image';
    
    // Upload de l'image sur Imgur
    const imageData = await axios.post(
      imgurUploadUrl,
      {
        image: fs.readFileSync(path.join(__dirname, 'uploads', req.file.filename)).toString('base64'),
        type: 'base64',
      },
      {
        headers: {
          Authorization: `Client-ID ${imgurClientId}`,
        },
      }
    );

    // Renvoyer l'URL de l'image téléchargée sur Imgur
    res.json({ imageUrl: imageData.data.data.link });

    // Optionnel : Supprimer l'image locale après l'upload
    fs.unlinkSync(path.join(__dirname, 'uploads', req.file.filename));
  } catch (error) {
    console.error('Erreur d\'upload sur Imgur:', error);
    res.status(500).json({ error: 'Erreur d\'upload sur Imgur', message: error.message });
  }
});

module.exports = router;
