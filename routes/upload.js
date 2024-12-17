const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Configurer Multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ajouter un timestamp pour le nom de fichier
  }
});

const upload = multer({ storage: storage });

// Route d'upload de l'image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé' });
  }
  const fileUrl = `/uploads/${req.file.filename}`; // Retourner l'URL de l'image
  res.json({ fileUrl });
});