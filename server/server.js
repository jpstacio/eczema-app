require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/productRoutes');
const dietRoutes = require('./routes/dietRoutes');
const wellbeingRoutes = require('./routes/wellbeingRoutes');

const { sequelize, User, Profile, Product, UsageLog, DietLog, WellBeingLog } = require('./models');

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/product', productRoutes);
app.use('/diet-log', dietRoutes);
app.use('/wellbeing-log', wellbeingRoutes);

// Sync DB and start server
const PORT = process.env.PORT || 5001;
sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
