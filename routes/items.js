const express = require('express');

function itemsRouter(db) {
  const router = express.Router();

  // Prepare statements
  const insertItem = db.prepare('INSERT INTO items (purchase_id, type, platform, name, status, soldFor) VALUES (?, ?, ?, ?, ?, ?)');
  const getItem = db.prepare('SELECT * FROM items WHERE id = ? AND purchase_id = ?');
  const updateItem = db.prepare(`
    UPDATE items 
    SET name = COALESCE(?, name), 
        type = COALESCE(?, type), 
        platform = COALESCE(?, platform), 
        status = COALESCE(?, status), 
        soldFor = COALESCE(?, soldFor) 
    WHERE id = ? AND purchase_id = ?
  `);
  const deleteItem = db.prepare('DELETE FROM items WHERE id = ? AND purchase_id = ?');

  // Prepare new statements
  const markItemAsSold = db.prepare("UPDATE items SET status = 'Sold', soldFor = ? WHERE id = ? AND purchase_id = ?");
  const markItemAsUnsold = db.prepare("UPDATE items SET status = 'Unsold', soldFor = NULL WHERE id = ? AND purchase_id = ?");

  // POST: Add a new item
  router.post('/:id/items', (req, res) => {
    const { id } = req.params;
    const { type, platform, name, status, soldFor } = req.body;
    try {
      const result = insertItem.run(id, type, platform, name, status, soldFor);
      res.json({ id: result.lastInsertRowid, purchase_id: id, type, platform, name, status, soldFor });
    } catch (error) {
      console.error('Error inserting item:', error);
      res.status(500).json({ message: 'Failed to insert item', error: error.message });
    }
  });

  // GET: Retrieve an item
  router.get('/:purchaseId/items/:itemId', (req, res) => {
    const { purchaseId, itemId } = req.params;
    try {
      const item = getItem.get(itemId, purchaseId);
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      console.error('Error retrieving item:', error);
      res.status(500).json({ message: 'Failed to retrieve item', error: error.message });
    }
  });

  // PATCH: Update an item
  router.patch('/:purchaseId/items/:itemId', (req, res) => {
    const { purchaseId, itemId } = req.params;
    const { name, type, platform, status, soldFor } = req.body;
    
    try {
      const currentItem = getItem.get(itemId, purchaseId);
      if (!currentItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      const result = updateItem.run(
        name || null,
        type || null,
        platform || null,
        status || null,
        soldFor !== undefined ? soldFor : null,
        itemId,
        purchaseId
      );

      if (result.changes > 0) {
        const updatedItem = getItem.get(itemId, purchaseId);
        res.json(updatedItem);
      } else {
        res.status(500).json({ message: 'Failed to update item' });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ message: 'Failed to update item', error: error.message });
    }
  });

  // DELETE: Remove an item
  router.delete('/:purchaseId/items/:itemId', (req, res) => {
    const { purchaseId, itemId } = req.params;
    try {
      const result = deleteItem.run(itemId, purchaseId);
      if (result.changes > 0) {
        res.json({ message: 'Item deleted' });
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ message: 'Failed to delete item', error: error.message });
    }
  });

  // PUT: Mark an item as sold
  router.put('/:purchaseId/items/:itemId/mark-sold', (req, res) => {
    const { purchaseId, itemId } = req.params;
    const { soldFor } = req.body;
    try {
      const result = markItemAsSold.run(soldFor, itemId, purchaseId);
      if (result.changes > 0) {
        const updatedItem = getItem.get(itemId, purchaseId);
        res.json(updatedItem);
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      console.error('Error marking item as sold:', error);
      res.status(500).json({ message: 'Failed to mark item as sold', error: error.message });
    }
  });

  // PUT: Mark an item as unsold
  router.put('/:purchaseId/items/:itemId/mark-unsold', (req, res) => {
    const { purchaseId, itemId } = req.params;
    try {
      const result = markItemAsUnsold.run(itemId, purchaseId);
      if (result.changes > 0) {
        const updatedItem = getItem.get(itemId, purchaseId);
        res.json(updatedItem);
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      console.error('Error marking item as unsold:', error);
      res.status(500).json({ message: 'Failed to mark item as unsold', error: error.message });
    }
  });

  return router;
}

module.exports = itemsRouter;

