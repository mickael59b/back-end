const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer un router express
const router = express.Router();

// Configuration de Multer pour l'upload d'image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads'; // Dossier de destination des images

    // Si le dossier n'existe pas, le créer
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    cb(null, uploadDir); // Spécifie le dossier où stocker les fichiers
  },
  filename: (req, file, cb) => {
    // Créer un nom unique pour le fichier téléchargé
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix); // Utilisation de l'extension d'origine
  },
});

// Crée une instance de multer avec configuration de stockage
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5 Mo
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Le fichier doit être une image.'));
    }
    cb(null, true);
  },
});

// Route d'upload d'image
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
  }

  // Construire l'URL complète de l'image
  const imageUrl = `http://api.acti-informatique.com/uploads/${req.file.filename}`;

  // Retourner l'URL et le nom de l'image téléchargée
  res.status(200).json({
    message: 'Image téléchargée avec succès.',
    imageUrl: imageUrl,  // URL complète de l'image
    imageName: req.file.filename, // Nom de l'image téléchargée
  });
});

// Servir les fichiers statiques du dossier uploads
router.use('/uploads', express.static('uploads'));

module.exports = router;