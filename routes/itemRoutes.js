const express = require('express');
const router = express.Router();
const db = require('../db/database');
const verifyToken = require('../middleware/authMiddleware');

// Function to delete an item by ID
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

// POST endpoint to add a sub-item
router.post('/sub-items', verifyToken, (req, res) => {
    const { main_item_id, sub_item, bought_for, sold_for } = req.body;
    const user_id = req.userId;  // Retrieved from token verification middleware

    const sql = `INSERT INTO sub_items (main_item_id, sub_item, bought_for, sold_for, user_id) 
                 VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [main_item_id, sub_item, bought_for, sold_for, user_id], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: "Failed to add sub-item due to database error." });
        }
        res.status(201).send({ id: this.lastID });
    });
});


// GET endpoint to fetch all items for a user
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

// GET endpoint to fetch a single item by ID
router.get('/items/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM items WHERE id = ?`, [id], (err, row) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send({ message: 'Error fetching item details from the database' });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).send({ message: 'Item not found' });
        }
    });
});

router.get('/items/:id/sub-items', verifyToken, (req, res) => {
    const mainItemId = req.params.id;
    db.all(`SELECT * FROM sub_items WHERE main_item_id = ?`, [mainItemId], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send({ message: 'Error fetching sub-items from the database' });
        }
        res.json(rows);
    });
});

// PUT endpoint to update an item by ID
router.put('/items/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { item, bought_for, sold_for } = req.body;
    const sql = `UPDATE items SET item = ?, bought_for = ?, sold_for = ? WHERE id = ?`;

    db.run(sql, [item, bought_for, sold_for, id], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: "Failed to update item due to database error." });
        }
        if (this.changes > 0) {
            res.send({ message: 'Item updated successfully.' });
        } else {
            res.status(404).send({ message: 'Item not found' });
        }
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
