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

  // Utilisation de FormData pour envoyer l'image
  const formData = new FormData();
  formData.append('image', fs.createReadStream(file.path)); // Utiliser le stream de fichier directement

  try {
    const response = await axios.post(imgurUploadUrl, formData, {
      headers: {
        Authorization: `Client-ID ${imgurClientId}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    // Retourner l'URL de l'image téléchargée
    return response.data.data.link;
  } catch (error) {
    console.error('Erreur d\'upload sur Imgur:', error.message);
    throw error; // Lancer l'erreur pour qu'elle soit gérée dans la route
  }
};

// Route d'upload de l'image
router.post('/', upload, async (req, res) => {
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
