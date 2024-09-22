const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function authRouter(db) {
  const router = express.Router();

  // Login route
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

  // Create user route (only accessible by existing users)
  router.post('/create-user', authenticateToken, (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
      res.json({ message: 'User created successfully', userId: result.lastInsertRowid });
    } catch (error) {
      res.status(400).json({ message: 'Username already exists' });
    }
  });

  // Verify token route
  router.get('/verify', authenticateToken, (req, res) => {
    res.json({ message: 'Token is valid', user: req.user });
  });

  return router;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

module.exports = { authRouter, authenticateToken };


