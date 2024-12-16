const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configurer Multer pour enregistrer les fichiers dans le dossier 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Le dossier 'uploads' où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Ajouter un horodatage au nom du fichier
  }
});

const upload = multer({ storage });

// Route pour uploader une image
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier téléchargé' });
  }
  
  // Renvoie le chemin d'accès à l'image
  res.status(200).json({
    message: 'Fichier téléchargé avec succès',
    file: req.file,
    fileUrl: `/uploads/${req.file.filename}` // URL pour accéder à l'image téléchargée
  });
});

module.exports = router;
