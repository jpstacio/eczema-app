// server/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { Profile } = require('../models');

// POST /profile/:userId — Save or update profile
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { skinType, allergies, dob, gender, conditions } = req.body;

  try {
    const [profile, created] = await Profile.upsert({
      userId,
      skinType,
      allergies,
      dob,
      gender,
      conditions,
    });
    res.json({ message: created ? 'Profile created' : 'Profile updated' });
  } catch (err) {
    console.error('Profile save error:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// GET /profile/:userId — Get profile
router.get('/:userId', async (req, res) => {
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

module.exports = router;
