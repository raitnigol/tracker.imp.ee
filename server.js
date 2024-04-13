const express = require('express');
const app = express();
const path = require('path');
const db = require('./db/database');  // Ensure DB is initialized
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authRoutes);
app.use(itemRoutes);

const config = require('./config/config');
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
