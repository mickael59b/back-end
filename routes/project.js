const express = require('express');
const mongoose = require('mongoose');
const path = require('path');  // Import du module path
const fs = require('fs');      // Import du module fs
const Project = require('../models/Project'); // Modèle Mongoose pour les projets
const router = express.Router();

// Route pour créer un projet avec ou sans image
router.post('/', async (req, res) => {
  console.log("Données reçues pour créer un projet:", req.body);

  const { title, category, description, imageUrl, imageName } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  if (imageUrl && !imageName) {
    return res.status(400).json({ message: 'Le nom de l\'image est requis si une image est fournie' });
  }

  try {
    const projet = new Project({
      title,
      category,
      description,
      imageUrl,
      imageName,
    });

    const savedProjet = await projet.save();
    res.status(201).json(savedProjet);
  } catch (err) {
    console.error('Erreur lors de la création du projet:', err);
    res.status(500).json({ message: 'Erreur lors de la création du projet', error: err.message });
  }
});

// Récupérer toutes les catégories uniques des projets (PLACÉ AVANT `GET /:id`)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Project.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Erreur de récupération des catégories', error: err.message });
  }
});

// Récupérer tous les projets
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des projets', error: err.message });
  }
});

// Récupérer un projet par ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de projet invalide' });
  }

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Erreur du serveur', error: err.message });
  }
});

// Supprimer un projet par ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de projet invalide' });
  }

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    if (project.imageUrl) {
      const imageFileName = path.basename(project.imageUrl);
      const imagePath = path.join(__dirname, '..', 'uploads', imageFileName);

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de l\'image:', err);
        } else {
          console.log('Image supprimée avec succès');
        }
      });
    }

    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: 'Projet supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du projet:', err);
    res.status(500).json({ message: 'Erreur lors de la suppression du projet', error: err.message });
  }
});

module.exports = router;
