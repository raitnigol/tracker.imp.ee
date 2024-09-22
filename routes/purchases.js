const express = require('express');

function purchasesRouter(db) {
  const router = express.Router();

  // Prepare statements
  const getPurchases = db.prepare('SELECT * FROM purchases');
  const insertPurchase = db.prepare('INSERT INTO purchases (name, price) VALUES (?, ?)');
  const updatePurchase = db.prepare('UPDATE purchases SET name = ?, price = ? WHERE id = ?');
  const deletePurchase = db.prepare('DELETE FROM purchases WHERE id = ?');
  const getItems = db.prepare('SELECT * FROM items WHERE purchase_id = ?');

  router.get('/', (req, res) => {
    const purchases = getPurchases.all().map(purchase => ({
      ...purchase,
      items: getItems.all(purchase.id)
    }));
    res.json(purchases);
  });

  router.post('/', (req, res) => {
    const { name, price } = req.body;
    console.log('Received new purchase request:', { name, price });
    try {
      const result = insertPurchase.run(name, price);
      console.log('Insert result:', result);
      const newPurchase = {
        id: result.lastInsertRowid,
        name,
        price,
        items: []
      };
      console.log('New purchase added:', newPurchase);
      res.status(201).json(newPurchase);
    } catch (error) {
      console.error('Error adding purchase:', error);
      res.status(500).json({ message: 'Failed to add purchase', error: error.message });
    }
  });

  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    updatePurchase.run(name, price, id);
    res.json({ id, name, price });
  });

  // Update the delete route
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log('Received delete request for purchase:', id);
    try {
      const deleteItems = db.prepare('DELETE FROM items WHERE purchase_id = ?');
      const deletePurchase = db.prepare('DELETE FROM purchases WHERE id = ?');
      
      db.transaction(() => {
        const itemsResult = deleteItems.run(id);
        console.log('Deleted items:', itemsResult.changes);
        const purchaseResult = deletePurchase.run(id);
        console.log('Delete purchase result:', purchaseResult);
        if (purchaseResult.changes > 0) {
          console.log('Purchase deleted successfully');
          res.json({ message: 'Purchase and associated items deleted successfully' });
        } else {
          console.log('Purchase not found');
          res.status(404).json({ message: 'Purchase not found' });
        }
      })();
    } catch (error) {
      console.error('Error deleting purchase:', error);
      res.status(500).json({ message: 'Error deleting purchase', error: error.message });
    }
  });

  return router;
}

module.exports = purchasesRouter;

