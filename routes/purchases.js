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
    const result = insertPurchase.run(name, price);
    res.json({ id: result.lastInsertRowid, name, price, items: [] });
  });

  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    updatePurchase.run(name, price, id);
    res.json({ id, name, price });
  });

  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const deleteItems = db.prepare('DELETE FROM items WHERE purchase_id = ?');
    const deletePurchase = db.prepare('DELETE FROM purchases WHERE id = ?');
    
    db.transaction(() => {
      deleteItems.run(id);
      const result = deletePurchase.run(id);
      if (result.changes > 0) {
        res.json({ message: 'Purchase and associated items deleted successfully' });
      } else {
        res.status(404).json({ message: 'Purchase not found' });
      }
    })();
  });

  return router;
}

module.exports = purchasesRouter;
