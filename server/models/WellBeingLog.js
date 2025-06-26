const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WellBeingLog = sequelize.define('WellBeingLog', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  mood: {
    type: DataTypes.ENUM('Happy', 'Neutral', 'Sad', 'Anxious', 'Angry'),
    allowNull: false,
  },
  stressLevel: {
    type: DataTypes.ENUM('Low', 'Moderate', 'High'),
    allowNull: false,
  },
  sleepHours: { type: DataTypes.FLOAT },
});

module.exports = WellBeingLog;
