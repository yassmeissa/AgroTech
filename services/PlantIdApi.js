const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5001;

const plantApiKey = process.env.PLANT_ID_API_KEY; // Assurez-vous d'avoir cette clé dans votre fichier .env

// Middleware CORS pour permettre les requêtes de localhost:3000
app.use(cors({ origin: 'http://localhost:3000' }));

// Configuration de multer pour gérer l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);  // Créer le dossier si il n'existe pas
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Crée un nom de fichier unique
  }
});

const upload = multer({ storage: storage });

// Endpoint pour l'identification des plantes et évaluation des maladies
app.post('/api/identify', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Chemin du fichier téléchargé
  const imagePath = req.file.path;

  // Convertir l'image en base64
  const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

  try {
    // Envoi de l'image pour l'identification des plantes
    const identificationResponse = await axios.post('https://api.plant.id/v2/identify', {
      api_key: plantApiKey,
      images: [`data:image/png;base64,${base64Image}`],
    });

    // Envoi de l'image pour l'évaluation des maladies
    const healthAssessmentResponse = await axios.post('https://api.plant.id/v2/health_assessment', {
      api_key: plantApiKey,
      images: [`data:image/png;base64,${base64Image}`],
      health: 'only',  // Seules les informations liées à la santé sont demandées
    });

    // Retourner les deux résultats (identification et maladies) ensemble
    res.json({
      identification: identificationResponse.data,
      healthAssessment: healthAssessmentResponse.data
    });

  } catch (error) {
    console.error('Error during API call:', error.message);
    res.status(500).json({ error: 'Error processing image', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});