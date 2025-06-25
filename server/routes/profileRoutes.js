const express = require('express');
const router = express.Router();
const { Profile } = require('../models');
const authenticateToken = require('../middleware/authMiddleware'); 

// GET /profile/:userId — Get profile
router.get('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /profile/:userId — Create or update profile
router.post('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { skinType, allergies, dob, gender, conditions } = req.body;

  try {
    await Profile.upsert({
      userId,
      skinType,
      allergies,
      dob,
      gender,
      conditions,
    });

    res.json({ message: 'Profile saved successfully' });
  } catch (err) {
    console.error('Profile save error:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

module.exports = router;
