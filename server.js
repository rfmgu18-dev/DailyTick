require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./backend/config/database');
const { startDeadlineScheduler } = require('./backend/services/deadlineNotifier');

const app = express();

// Confiar en proxy para sesiones en producción (Render)
app.set('trust proxy', 1);

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend'), { index: false }));

app.use(require('express-session')({
  secret: process.env.SESSION_SECRET || 'dailytick-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false, // false para que funcione tanto en HTTP como HTTPS
    httpOnly: true,
    sameSite: 'lax' // lax funciona en ambos casos
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/habits', require('./backend/routes/habits'));
app.use('/api/stats', require('./backend/routes/stats'));
app.use('/api/achievements', require('./backend/routes/achievements'));
app.use('/api/admin', require('./backend/routes/admin'));
app.use('/api/goals', require('./backend/routes/goals'));
app.use('/api/notifications', require('./backend/routes/notifications'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  // Iniciar el scheduler de deadlines después de que el servidor esté listo
  startDeadlineScheduler();
});

module.exports = app;
