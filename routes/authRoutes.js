const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const config = require('../config/config');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.status(500).send({ message: "Username is already taken." });
        }
        res.status(201).send({ message: "User created successfully." });
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            return res.status(500).send({ message: "An error occurred while retrieving user data." });
        }
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '24h' });
        res.send({ token, username: user.username });
    });
});

router.post('/api/validateToken', verifyToken, (req, res) => {
    // This is a simple token validation endpoint. If verifyToken middleware does not block the request, it means the token is valid.
    res.json({ isValid: true });
});

module.exports = router;
