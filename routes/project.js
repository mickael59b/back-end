const express = require('express');
const mongoose = require('mongoose');
const path = require('path');  // Import du module path
const fs = require('fs');      // Import du module fs
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
      imageUrl,  // L'URL complète de l'image
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
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de projet invalide' });
    }

    // Trouver le projet dans la base de données
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Supprimer l'image du dossier 'uploads' si elle existe
    if (project.imageUrl) {
      // Extraire le nom du fichier à partir de l'URL
      const imageFileName = path.basename(project.imageUrl); // Utiliser path.basename pour extraire le nom du fichier
      const imagePath = path.join(__dirname, '..', 'uploads', imageFileName); // Chemin du fichier à supprimer

      // Vérifier si le fichier existe et le supprimer
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de l\'image:', err);
        } else {
          console.log('Image supprimée avec succès');
        }
      });
    }

    // Supprimer le projet de la base de données
    await Project.findByIdAndDelete(id);

    // Réponse de succès
    res.status(200).json({ message: 'Projet supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du projet:', err);
    res.status(500).json({ message: 'Erreur lors de la suppression du projet', error: err.message });
  }
});

module.exports = router;
