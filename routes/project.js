const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project'); // Modèle Mongoose pour les projets
const router = express.Router();

// Route pour créer un projet avec ou sans image
router.post('/', async (req, res) => {
  try {
    const { title, category, description, imageUrl, imageName } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Créer un projet avec les informations reçues, y compris l'URL de l'image si elle existe
    const project = new Project({
      title,
      category,
      description,
      imageUrl,  // L'URL de l'image
      imageName, // Le nom de l'image
    });

    // Sauvegarder le projet dans la base de données
    const savedProject = await project.save();
    
    // Retourner le projet créé
    res.status(201).json(savedProject);
  } catch (err) {
    console.error('Erreur lors de la création du projet:', err);
    res.status(500).json({ message: 'Erreur lors de la création du projet', error: err.message });
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
  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Supprimer le projet
    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: 'Projet supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du projet', error: err.message });
  }
});

module.exports = router;
