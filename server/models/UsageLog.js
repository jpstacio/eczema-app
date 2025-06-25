// server/models/UsageLog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UsageLog = sequelize.define('UsageLog', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dateUsed: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT, 
  },
  sideEffects: {
    type: DataTypes.TEXT, 
  },
});


module.exports = UsageLog;
