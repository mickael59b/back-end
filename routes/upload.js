// routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configurer le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Dossier où les images seront enregistrées
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Générer un nom de fichier unique
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille 5 Mo
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées.'));
    }
  }
});

// Route pour uploader l'image
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image téléchargée' });
    }

    // Construire l'URL complète pour l'image
    const fileUrl = `https://back-end-api-gfl0.onrender.com/uploads/${req.file.filename}`; // URL complète de l'image
    const imageName = req.file.filename; // Nom du fichier

    // Renvoi de l'URL et du nom de l'image après l'upload
    res.status(200).json({ fileUrl, fileName: imageName });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image', error: error.message });
  }
});

module.exports = router;
