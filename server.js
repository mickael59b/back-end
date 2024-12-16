require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Importer les routes
const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/project');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/upload'); // Importer la route d'upload

// Initialiser l'application Express
const app = express();

// Middleware pour gérer CORS et les corps de requêtes JSON
app.use(cors()); // Permet d'accepter les requêtes CORS
app.use(bodyParser.json()); // Permet de lire les requêtes JSON

// Middleware pour servir les fichiers téléchargés depuis 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Définir les routes
app.use('/api/clients', clientRoutes); // Pour la gestion des clients (inscription, connexion, etc.)
app.use('/api/projects', projectRoutes); // Pour la gestion des projets
app.use('/api/contact', contactRoutes); // Pour la gestion des messages de contact
app.use('/api/upload', uploadRoutes); // Pour la gestion des uploads de fichiers

// Fonction pour se connecter à MongoDB
const connectDB = async () => {
  try {
    // Connexion à MongoDB Atlas avec l'URI de connexion depuis le fichier .env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur de connexion MongoDB', err);
    process.exit(1); // Arrêter l'application si la connexion échoue
  }
};

// Appeler la fonction pour se connecter à la base de données
connectDB();

// Route de base pour vérifier si l'API fonctionne
app.get('/', (req, res) => {
  res.send('API fonctionne !');
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000; // Utiliser le port défini par Render
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});