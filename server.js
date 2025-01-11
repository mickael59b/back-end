const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const authMiddleware = require('./middleware/authMiddleware');

// Charger les variables d'environnement
require('dotenv').config();

const app = express();

// Validation des variables d'environnement
if (!process.env.MONGO_URI) {
  console.error("Erreur : La variable d'environnement MONGO_URI n'est pas définie.");
  process.exit(1);
}

// Journalisation des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Dossier 'uploads' pour les fichiers téléchargés
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Sécurisation et CORS
app.use(helmet());
const corsOptions = { origin: '*' }; // Frontend autorisé
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers téléchargés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/project');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/upload');

// Définir les routes
app.use('/clients', clientRoutes);
app.use('/projects', projectRoutes);
app.use('/contact', contactRoutes);
app.use('/upload', uploadRoutes);

// Protéger certaines routes
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/clients', authMiddleware, clientRoutes);

// Route de base
app.get('/', (req, res) => {
  res.send('API fonctionne !');
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err.stack); // Log détaillé de l'erreur
  const statusCode = err.statusCode || 500; // Utilisation d'un code d'état approprié
  const message = err.message || 'Erreur serveur';
  res.status(statusCode).json({ error: message });
});

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);  // Supprimer les options dépréciées
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur de connexion MongoDB :', err.message);
    setTimeout(connectDB, 5000); // Tentative de reconnexion après 5 secondes
  }
};

connectDB();

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
