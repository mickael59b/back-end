const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary').CloudinaryStorage;

// Configurer le stockage pour multer avec Cloudinary
const storage = new multerStorageCloudinary({
  cloudinary: cloudinary,
  params: {
    folder: 'projects/', // Le dossier où vous souhaitez stocker les images sur Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Formats d'images autorisés
  },
});

const upload = multer({ storage: storage }).single('image'); // 'image' est le nom du champ dans le formulaire

const router = express.Router();

// Route pour uploader l'image
router.post('/', upload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image téléchargée' });
  }

  // L'URL de l'image téléchargée sera dans `req.file.path`
  res.status(200).json({ imageUrl: req.file.path });
});

module.exports = router;
