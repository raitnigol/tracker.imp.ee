const Database = require('better-sqlite3');

function setupDatabase() {
  const db = new Database('database.sqlite', { verbose: console.log });

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER,
      type TEXT,
      platform TEXT,
      name TEXT,
      status TEXT,
      soldFor REAL,
      FOREIGN KEY (purchase_id) REFERENCES purchases (id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
  `);

  return db;
}

module.exports = { setupDatabase };