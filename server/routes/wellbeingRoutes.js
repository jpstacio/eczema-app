
// server/routes/wellbeingRoutes.js
const express = require('express');
const router  = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { WellBeingLog } = require('../models');   

// POST /wellbeing-log
router.post('/', authenticate, async (req, res) => {
  const { mood, stressLevel, sleepDuration } = req.body;

  try {
    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD

    await WellBeingLog.create({
      userId: req.user.userId,
      mood,
      stressLevel,
      sleepHours: sleepDuration,  
      date: today,                
    });

    return res.status(201).json({ message: 'Well-being log saved' });
  } catch (err) {
    console.error('Error creating wellbeing log:', err);
    return res.status(500).json({ error: 'Failed to create wellbeing log' });
  }
});

// GET /wellbeing-log
router.get('/', authenticate, async (req, res) => {
  const logs = await WellBeingLog.findAll({
    where: { userId: req.user.userId },
    order: [['createdAt', 'DESC']],
  });
  res.json(logs);
});

module.exports = router;
