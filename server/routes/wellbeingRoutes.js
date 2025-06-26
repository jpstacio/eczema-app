const express = require('express');
const router = express.Router();
const WellBeingLog = require('../models/WellBeingLog');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/:userId', authenticateToken, async (req, res) => {
  const logs = await WellBeingLog.findAll({ where: { userId: req.params.userId } });
  res.json(logs);
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const log = await WellBeingLog.create({ ...req.body });
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create well-being log' });
  }
});

router.put('/:logId', authenticateToken, async (req, res) => {
  const log = await WellBeingLog.findByPk(req.params.logId);
  if (!log) return res.status(404).json({ error: 'Log not found' });

  await log.update(req.body);
  res.json(log);
});

router.delete('/:logId', authenticateToken, async (req, res) => {
  const deleted = await WellBeingLog.destroy({ where: { id: req.params.logId } });
  res.json({ success: deleted > 0 });
});

module.exports = router;
