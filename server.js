require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const authMiddleware = require('./middleware/authMiddleware'); // Importer le middleware d'authentification

// Initialiser l'application Express
const app = express();

// Validation des variables d'environnement critiques
if (!process.env.MONGO_URI) {
  console.error("Erreur : La variable d'environnement MONGO_URI n'est pas définie.");
  process.exit(1); // Arrêter le serveur si la configuration critique manque
}

// Middleware pour journaliser les requêtes API
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Création du dossier 'uploads' s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware pour gérer la sécurité, CORS et les corps de requêtes
app.use(helmet()); // Sécuriser les en-têtes HTTP
app.use(cors()); // Permettre les requêtes CORS
app.use(bodyParser.json()); // Permettre de lire les corps de requêtes JSON
app.use(bodyParser.urlencoded({ extended: true })); // Permettre les données de type application/x-www-form-urlencoded

// Middleware pour servir les fichiers téléchargés depuis 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importer et définir les routes
const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/project');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/upload');

// Définir les routes
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// Protéger certaines routes avec le middleware d'authentification
app.use('/api/projects', authMiddleware, projectRoutes); // Protéger la route des projets
app.use('/api/clients', authMiddleware, clientRoutes); // Protéger la route des clients

// Route de base pour vérifier si l'API fonctionne
app.get('/', (req, res) => {
  console.log("Accès à la racine de l'API");
  res.send('API fonctionne !');
});

// Gestion des routes non trouvées
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err.message);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Fonction pour se connecter à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur de connexion MongoDB :', err.message);
    setTimeout(connectDB, 5000); // Réessayer la connexion après 5 secondes en cas d'erreur
  }
};

// Appeler la fonction pour se connecter à la base de données
connectDB();

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});