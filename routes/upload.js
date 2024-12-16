const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configurer Multer pour enregistrer les fichiers dans le dossier 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName); // Nom unique pour chaque fichier
  },
});

// Limites de fichier et types autorisés
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Taille maximale : 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Types autorisés
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Type de fichier non supporté. Seuls JPEG, PNG et GIF sont autorisés.'));
    }
    cb(null, true);
  },
}).single('image'); // Gestion d'un seul fichier avec le champ 'image'

// Route pour uploader une image
router.post('/', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Erreurs spécifiques à Multer
      console.error('Erreur Multer :', err.message);
      return res.status(400).json({ error: `Erreur Multer : ${err.message}` });
    } else if (err) {
      // Autres erreurs (exemple : type de fichier)
      console.error('Erreur lors de l\'upload :', err.message);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      console.error('Aucun fichier téléchargé');
      return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }

    // Réponse réussie
    console.log('Fichier téléchargé avec succès :', req.file.filename);
    res.status(200).json({
      message: 'Fichier téléchargé avec succès',
      file: req.file,
      fileUrl: `/uploads/${req.file.filename}`, // Chemin accessible pour le fichier
    });
  });
});

// Middleware pour capturer d'autres erreurs (optionnel)
router.use((err, req, res, next) => {
  console.error('Erreur inattendue :', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

module.exports = router;