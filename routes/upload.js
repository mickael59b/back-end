const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data'); // Assurez-vous que ce module est installé

const router = express.Router();

// Configuration de multer pour l'upload des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Répertoire temporaire pour stocker les images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix); // Nom unique pour chaque fichier
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limiter à 5 Mo
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image (JPEG, PNG ou GIF).'), false);
    }
  },
}).single('image');

// Fonction pour uploader une image sur Imgur
const uploadImageToImgur = async (filePath) => {
  const imgurClientId = process.env.IMGUR_CLIENT_ID || 'YOUR_RENDER_CLIENT_ID'; // Défini depuis Render

  if (!imgurClientId) {
    throw new Error('Client ID Imgur manquant. Vérifiez vos variables d\'environnement sur Render.');
  }

  const imgurUploadUrl = 'https://api.imgur.com/3/image';

  const formData = new FormData();
  formData.append('image', fs.createReadStream(filePath)); // Utilisation du stream pour éviter les problèmes de mémoire

  try {
    const response = await axios.post(imgurUploadUrl, formData, {
      headers: {
        Authorization: `Client-ID ${imgurClientId}`,
        ...formData.getHeaders(), // Nécessaire pour inclure les en-têtes générés par FormData
      },
    });

    return response.data.data.link; // Retourner l'URL publique de l'image
  } catch (error) {
    console.error('Erreur d\'upload sur Imgur:', error.response?.data || error.message);
    throw error; // Relancer l'erreur pour gestion dans la route
  }
};

// Route pour gérer l'upload de l'image
router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // Erreurs spécifiques à Multer (taille du fichier, etc.)
      return res.status(400).json({ error: 'Erreur d\'upload : ' + err.message });
    } else if (err) {
      // Autres erreurs (type de fichier non autorisé, etc.)
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé.' });
    }

    try {
      const imageUrl = await uploadImageToImgur(req.file.path);
      fs.unlinkSync(req.file.path); // Supprimer l'image locale après upload
      res.status(200).json({ imageUrl });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de l\'upload de l\'image sur Imgur.',
        message: error.message,
      });
    }
  });
});

module.exports = router;
