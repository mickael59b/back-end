// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  skills: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  stat: { 
    type: String, 
    required: true,
    enum: ['en_cours', 'termine', 'a_venir'] // Valide que le statut est l'une de ces valeurs
  },
  link: {
    type:String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  imageName: {
    type: String,
    default: null,
  }
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

