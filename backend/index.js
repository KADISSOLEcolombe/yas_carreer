const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/auth');
const offreRoutes = require('./src/routes/offres');
const applicationRoutes = require('./src/routes/applications');
const adminRoutes = require('./src/routes/admin');
const entretienRoutes = require('./src/routes/entretiens');
const evaluationRoutes = require('./src/routes/evaluations');
const fileRoutes = require('./src/routes/files');
const notificationRoutes = require('./src/routes/notifications');
const rhRoutes = require('./src/routes/rh');

// Monter les routes
app.use('/api/auth', authRoutes);
app.use('/api/offres', offreRoutes);
app.use('/api/candidatures', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/entretiens', entretienRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rh', rhRoutes);

app.get("/", (req, res) => {
  res.send("API backend fonctionne !");
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
