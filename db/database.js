const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mydatabase.db', err => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// Schema initialization
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
    )`, err => {
        if (err) console.error('Error creating users table:', err.message);
    });

    db.run(`CREATE TABLE IF NOT EXISTS main_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item TEXT NOT NULL,
        bought_for REAL NOT NULL,
        sold_for REAL,  -- This allows NULL values for unsold items
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`, err => {
        if (err) console.error('Error creating main_items table:', err.message);
    });

    db.run(`CREATE TABLE IF NOT EXISTS sub_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        main_item_id INTEGER NOT NULL,
        sub_item TEXT NOT NULL,
        bought_for REAL NOT NULL,
        sold_for REAL,  -- This allows NULL values for unsold sub-items
        user_id INTEGER NOT NULL,
        FOREIGN KEY (main_item_id) REFERENCES main_items (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`, err => {
        if (err) console.error('Error creating sub_items table:', err.message);
    });
});

module.exports = db;
