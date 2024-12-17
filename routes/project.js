const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project'); // Modèle Mongoose pour les projets

const router = express.Router();

// Créer le dossier 'uploads' s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Dossier où les images seront enregistrées
  },
  filename: function (req, file, cb) {
    // Utiliser un nom de fichier unique basé sur l'horodatage et l'extension de l'image
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Erreur : Ce fichier n\'est pas une image.'));
    }
  }
});

// Route pour créer un projet avec ou sans image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Vérification des champs obligatoires
    const { title, category, description } = req.body;
    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'image a été téléchargée
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // URL de l'image
    }

    // Créer un projet avec l'image (si elle existe) ou sans image
    const project = new Project({
      title,
      category,
      description,
      image: imageUrl,  // Ajouter le chemin de l'image (si elle existe)
    });

    // Sauvegarder le projet dans la base de données
    await project.save();
    res.status(201).json(project); // Retourner le projet créé avec l'image ou sans image
  } catch (err) {
    console.error('Erreur lors de la création du projet:', err);
    res.status(500).json({ message: 'Erreur lors de la création du projet', error: err.message });
  }
});

// Récupérer toutes les catégories uniques des projets
router.get('/categories', async (req, res) => {
  try {
    const categories = await Project.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Erreur de récupération des catégories', error: err.message });
  }
});

// Récupérer les projets avec filtrage par catégorie et pagination
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = category && category !== 'All' ? { category } : {};

    const projects = await Project.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalProjects = await Project.countDocuments(filter);

    res.json({
      projects,
      totalProjects,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur de récupération des projets', error: err.message });
  }
});

// Récupérer un projet par ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de projet invalide' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    res.json(project);
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).json({ message: 'Erreur du serveur', error: err.message });
  }
});

// Supprimer un projet par ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de projet invalide' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Supprimer le projet de la base de données
    await Project.findByIdAndDelete(id);

    res.status(200).json({ message: 'Projet supprimé avec succès' });
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).json({ message: 'Erreur du serveur', error: err.message });
  }
});

module.exports = router;