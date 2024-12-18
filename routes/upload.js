const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Configuration de multer pour l'upload des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique pour chaque fichier
  },
});

const upload = multer({ storage: storage }).single('image');

// Fonction pour uploader une image sur Imgur
const uploadImageToImgur = async (file) => {
  const imgurClientId = process.env.IMGUR_CLIENT_ID;
  const imgurUploadUrl = 'https://api.imgur.com/3/image';

  const imageData = await axios.post(
    imgurUploadUrl,
    {
      image: fs.readFileSync(file.path).toString('base64'),
      type: 'base64',
    },
    {
      headers: {
        Authorization: `Client-ID ${imgurClientId}`,
      },
    }
  );

  return imageData.data.data.link;
};

// Route d'upload de l'image
router.post('/upload', upload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé' });
  }

  try {
    const imageUrl = await uploadImageToImgur(req.file);
    // Supprimer l'image après upload
    fs.unlinkSync(req.file.path);
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image sur Imgur', message: error.message });
  }
});

module.exports = router;
