// routes/upload.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary').CloudinaryStorage;

const router = express.Router();

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurer le stockage pour Multer avec Cloudinary
const storage = new multerStorageCloudinary({
  cloudinary: cloudinary,
  params: {
    folder: 'projects/', // Dossier dans Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Formats autorisés
  },
});

// Middleware pour l'upload d'image
const upload = multer({ storage: storage }).single('image'); // 'image' est le nom du champ

// Route pour l'upload d'image
router.post('/', upload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image téléchargée' });
  }

  // Retourner l'URL sécurisée de l'image téléchargée
  res.status(200).json({ imageUrl: req.file.secure_url });
});

module.exports = router;
