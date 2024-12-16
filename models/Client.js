const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // L'email doit être unique
  },
  password: {
    type: String,
    required: true,  // Le mot de passe est requis
  },
  avatar: {
    type: String,
    default: 'https://acti-informatique.com/web-core/uploads/avatar/default-avatar.png',  // Avatar par défaut
  },
  role: {
    type: String,
    enum: ['client', 'admin'],  // Le rôle peut être 'client' ou 'admin'
    default: 'client',  // Rôle par défaut
  },
});

module.exports = mongoose.model('Client', clientSchema);  // Exportation du modèle

