require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./backend/config/database');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

app.use(require('express-session')({
  secret: process.env.SESSION_SECRET || 'dailytick-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
