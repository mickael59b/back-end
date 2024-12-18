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
    cb(null, uploadDir); // Répertoire de destination pour l'upload
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique pour le fichier
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
  console.log('Requête reçue :', req.body);
  console.log('Fichier reçu :', req.file);

  if (!req.file) {
    console.error('Erreur : Aucun fichier téléchargé');
    return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  console.log('Fichier enregistré avec succès :', fileUrl);
  res.json({ fileUrl });
});


module.exports = router;
