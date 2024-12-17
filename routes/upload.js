// routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Créer le dossier 'uploads' s'il n'existe pas
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurer Multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);  // Définir le répertoire de destination pour l'upload
  },
  filename: (req, file, cb) => {
    // Ajouter un timestamp pour garantir des noms de fichiers uniques
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

// Route d'upload de l'image
router.post('/', upload.single('image'), (req, res) => {
  // Vérifier si un fichier a été téléchargé
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé' });
  }
  
  // Retourner l'URL du fichier téléchargé
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

module.exports = router;
