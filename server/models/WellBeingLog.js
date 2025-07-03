// models/WellbeingLog.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class WellBeingLog extends Model {}

WellBeingLog.init(
  {
    mood: DataTypes.STRING,
    stressLevel: DataTypes.STRING,
    sleepHours: DataTypes.FLOAT,
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'WellBeingLog',
  }
);

module.exports = WellBeingLog;
