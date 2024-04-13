const express = require('express');
const router = express.Router();
const db = require('../db/database');
const verifyToken = require('../middleware/authMiddleware');

// Function to delete an item by ID, to be placed in a more suitable place like a separate module
function deleteItemById(id, callback) {
    const sql = 'DELETE FROM items WHERE id = ?';
    db.run(sql, [id], function(err) {
        callback(err);
    });
}

// POST endpoint to add an item
router.post('/items', verifyToken, (req, res) => {
    const { item, bought_for, sold_for } = req.body;
    const user_id = req.userId;  // Retrieved from token verification middleware

    const sql = `INSERT INTO items (item, bought_for, sold_for, user_id) VALUES (?, ?, ?, ?)`;
    db.run(sql, [item, bought_for, sold_for, user_id], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: "Failed to add item due to database error." });
        }
        res.status(201).send({ id: this.lastID });
    });
});

// GET endpoint to fetch items for a user
router.get('/items', verifyToken, (req, res) => {
    const userId = req.userId;
    db.all(`SELECT * FROM items WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send({ message: 'Error fetching items from the database' });
        }
        res.json(rows);
    });
});

// DELETE endpoint to remove an item by ID
router.delete('/items/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    deleteItemById(id, (err) => {
        if (err) {
            return res.status(500).send('Failed to delete the item.');
        }
        res.send('Item deleted successfully.');
    });
});

module.exports = router;
