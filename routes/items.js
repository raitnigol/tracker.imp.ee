const express = require('express');

function itemsRouter(db) {
  const router = express.Router();

  // Prepare statements
  const insertItem = db.prepare('INSERT INTO items (purchase_id, type, platform, name, status, soldFor) VALUES (?, ?, ?, ?, ?, ?)');

  router.post('/:id/items', (req, res) => {
    const { id } = req.params;
    const { type, platform, name, status, soldFor } = req.body;
    const result = insertItem.run(id, type, platform, name, status, soldFor);
    res.json({ id: result.lastInsertRowid, purchase_id: id, type, platform, name, status, soldFor });
  });

  router.delete('/:purchaseId/items/:itemId', (req, res) => {
    const { purchaseId, itemId } = req.params;
    const deleteItem = db.prepare('DELETE FROM items WHERE id = ? AND purchase_id = ?');
    const result = deleteItem.run(itemId, purchaseId);
    if (result.changes > 0) {
      res.json({ message: 'Item deleted' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  });

  router.put('/:purchaseId/items/:itemId', (req, res) => {
    const { purchaseId, itemId } = req.params;
    const { status, soldFor } = req.body;
    const updateItem = db.prepare('UPDATE items SET status = ?, soldFor = ? WHERE id = ? AND purchase_id = ?');
    const result = updateItem.run(status, soldFor, itemId, purchaseId);
    if (result.changes > 0) {
      const getUpdatedItem = db.prepare('SELECT * FROM items WHERE id = ?');
      const updatedItem = getUpdatedItem.get(itemId);
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  });

  return router;
}

module.exports = itemsRouter;