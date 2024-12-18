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
    folder: 'projects/', // Dossier dans Cloudinary où les images seront stockées
    allowed_formats: ['jpg', 'png', 'jpeg'], // Formats autorisés
    resource_type: 'image', // Spécifier que ce sont des images
  },
});

// Middleware pour l'upload d'image
const upload = multer({ storage: storage }).single('image'); // 'image' est le nom du champ dans le formulaire

// Route pour l'upload d'image
router.post('/', upload, (req, res) => {
  // Vérifier si un fichier a été téléchargé
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image téléchargée' });
  }

  // Affichage de l'objet complet du fichier pour debug
  console.log('Fichier téléchargé:', req.file);

  // Vérification si l'URL de l'image est présente dans `path`
  if (!req.file.path) {
    return res.status(500).json({ error: 'L\'URL de l\'image n\'a pas été renvoyée par Cloudinary' });
  }

  // Retourner l'URL de l'image téléchargée
  res.status(200).json({
    imageUrl: req.file.path, // Utilisation de `path` pour l'URL
    imageName: req.file.originalname, // Nom original du fichier téléchargé
  });
});

module.exports = router;
