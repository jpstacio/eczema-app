const express = require('express');
const router = express.Router();
const DietLog = require('../models/DietLog');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/:userId', authenticateToken, async (req, res) => {
  const logs = await DietLog.findAll({ where: { userId: req.params.userId } });
  res.json(logs);
});

// GET /diet-log — get all logs for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const logs = await DietLog.findAll({ where: { userId: req.user.userId } });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Failed to fetch diet logs' });
  }
});


router.post('/', authenticateToken, async (req, res) => {
  const { date, meals, snacks, waterIntake } = req.body;
  const userId = req.user.userId;

  try {
    const existingLog = await DietLog.findOne({
      where: { userId, date }
    });

    if (existingLog) {
      return res.status(409).json({ error: 'You already logged your meals for this day.' });
    }

    const newLog = await DietLog.create({
      userId,
      date,
      meals,
      snacks,
      waterIntake,
    });

    res.status(201).json(newLog);
  } catch (err) {
    console.error('Diet log creation error:', err);
    res.status(400).json({ error: 'Failed to create diet log' });
  }
});


router.put('/:logId', authenticateToken, async (req, res) => {
  const log = await DietLog.findByPk(req.params.logId);
  if (!log) return res.status(404).json({ error: 'Log not found' });

  await log.update(req.body);
  res.json(log);
});

router.delete('/:logId', authenticateToken, async (req, res) => {
  const deleted = await DietLog.destroy({ where: { id: req.params.logId } });
  res.json({ success: deleted > 0 });
});

module.exports = router;
