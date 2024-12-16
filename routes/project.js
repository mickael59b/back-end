const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Route pour récupérer tous les projets
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route pour ajouter un projet
router.post('/', async (req, res) => {
  const { title, description, imageUrl } = req.body;
  const newProject = new Project({ title, description, imageUrl });

  try {
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
