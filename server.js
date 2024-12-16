require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Importer les routes
const projectRoutes = require('./routes/project');
const uploadRoutes = require('./routes/upload');

// Initialiser Express
const app = express();

// Middleware pour gérer les requêtes CORS et les corps de requêtes JSON
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Permet d'accéder aux fichiers téléchargés via une URL

// Définir les routes
app.use('/api/projects', projectRoutes); // Pour la gestion des projets
app.use('/api/upload', uploadRoutes);    // Pour uploader des fichiers

// Connexion à MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur de connexion MongoDB', err);
    process.exit(1); // Arrêter l'application si la connexion échoue
  }
};

// Lancer la connexion
connectDB();

// Route de base pour vérifier si l'API fonctionne
app.get('/', (req, res) => {
  res.send('API fonctionne !');
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
