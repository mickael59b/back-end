const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configurer Multer pour enregistrer les fichiers dans le dossier 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Le dossier 'uploads' où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9); // Nom unique
    cb(null, uniqueName + path.extname(file.originalname)); // Ajoute l'extension du fichier original
  },
});

// Valider les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif']; // Types autorisés
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Seuls les fichiers JPEG, PNG et GIF sont autorisés.'));
  }
};

// Configuration de Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite la taille des fichiers à 5 Mo
});

// Route pour uploader une image
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
  }

  // Renvoie le chemin d'accès à l'image
  res.status(200).json({
    message: 'Fichier téléchargé avec succès.',
    file: req.file,
    fileUrl: `/uploads/${req.file.filename}`, // URL pour accéder à l'image téléchargée
  });
});

// Gestion des erreurs Multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erreurs spécifiques à Multer (ex : fichier trop volumineux)
    return res.status(400).json({ error: `Erreur Multer : ${err.message}` });
  } else if (err) {
    // Autres erreurs (par ex. : type de fichier non supporté)
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
