// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes'); 
const { User, Profile } = require('./models');

const sequelize = require('./config/db');

// ⬇️ Ensure Sequelize knows about all models
require('./models/User');
require('./models/Profile'); // ← NEW

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes); // ← NEW

// Sync DB and start server
const PORT = process.env.PORT || 5001;
sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
