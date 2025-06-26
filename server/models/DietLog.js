const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DietLog = sequelize.define('DietLog', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  meals: { type: DataTypes.JSONB }, // breakfast, lunch, dinner as keys
  snacks: { type: DataTypes.TEXT },
  waterIntake: { type: DataTypes.INTEGER },
});

module.exports = DietLog;
