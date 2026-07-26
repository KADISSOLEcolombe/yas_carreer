require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const rhRoutes = require('./routes/rh');
const adminRoutes = require('./routes/admin');
const offresRoutes = require('./routes/offres');
const applicationsRoutes = require('./routes/applications');
const entretiensRoutes = require('./routes/entretiens');
const evaluationsRoutes = require('./routes/evaluations');
const notificationsRoutes = require('./routes/notifications');
const filesRoutes = require('./routes/files');
const favorisRoutes = require('./routes/favoris');
const departementsRoutes = require('./routes/departements');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Servir le dossier uploads comme dossier statique
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rh', rhRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/offres', offresRoutes);
app.use('/api/candidatures', applicationsRoutes);
app.use('/api/entretiens', entretiensRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/favoris', favorisRoutes);
app.use('/api/departements', departementsRoutes);
app.listen(PORT, () => {
  console.log(`API YAS Career démarrée sur http://localhost:${PORT}`);
});
