const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { setupDatabase } = require('./db/database');
const purchasesRouter = require('./routes/purchases');
const itemsRouter = require('./routes/items');
const { authRouter, authenticateToken } = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up SQLite database
const db = setupDatabase();

// Middleware
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

// Updated Content Security Policy (CSP) header
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;"
  );
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRouter(db));
app.use('/api/purchases', authenticateToken, purchasesRouter(db));
app.use('/api/purchases', authenticateToken, itemsRouter(db));

// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the main app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
