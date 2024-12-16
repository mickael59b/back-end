// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },  // Facultatif, si nécessaire
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;


