const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Import du module path
const fs = require('fs'); // Import du module fs
const Project = require('../models/Project'); // Modèle Mongoose pour les projets
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Le dossier où les fichiers sont stockés

// Route pour créer un projet avec ou sans image
router.post('/', async (req, res) => {
  const { title, category, description, stat, imageUrl, imageName, shortDescription, skills, link } = req.body;
  console.log('Données reçues:', req.body);

  if (!title || !category || !description || !stat) { // Ajout de stat dans la validation
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const formattedLink = `https://github.com/mickael59b/${link || ''}`;
    const project = new Project({
      title,
      category,
      description,
      stat,
      imageUrl,
      imageName,
      shortDescription,
      skills,
      link: formattedLink
    });

    console.log('Données avant l\'enregistrement du projet:', project);

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (err) {
    console.error('Erreur lors de la création du projet:', err);
    res.status(500).json({ message: 'Erreur lors de la création du projet', error: err.message });
  }
});

// Mise à jour du projet avec ou sans image
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      category, 
      description, 
      stat, 
      shortDescription, 
      skills, 
      link,
      shortLink,
      imageUrl, 
      imageName
    } = req.body;

    // Traitement du lien GitHub
    let processedLink = link;
    if (link && !link.startsWith('https://github.com/mickael59b/')) {
      processedLink = `https://github.com/mickael59b/${link}`;
    }

    // Mise à jour dans la base de données
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        title,
        category,
        description,
        stat,
        shortDescription,
        skills,
        link: processedLink, // Utilisation du lien traité
        shortLink,
        imageUrl,
        imageName,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ 
        message: 'Projet non trouvé' 
      });
    }

    res.status(200).json({
      message: 'Projet mis à jour avec succès',
      data: updatedProject,
      imageFile: req.file ? {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      } : null
    });

  } catch (err) {
    console.error('Erreur lors de la mise à jour du projet:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du projet', 
      error: err.message 
    });
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

// Récupérer toutes les catégories uniques des projets
router.get('/categories', async (req, res) => {
  try {
    const categories = await Project.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Erreur de récupération des catégories', error: err.message });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de projet invalide' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    if (project.imageUrl) {
      const imageFileName = path.basename(project.imageUrl);
      const imagePath = path.join(__dirname, '..', 'uploads', imageFileName);

      try {
        if (fs.existsSync(imagePath)) {
          await fs.promises.unlink(imagePath);
          console.log('Image supprimée avec succès');
        }
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'image:', err);
      }
    }

    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: 'Projet supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du projet:', err);
    res.status(500).json({ message: 'Erreur lors de la suppression du projet', error: err.message });
  }
});

module.exports = router;

