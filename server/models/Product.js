// server/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: DataTypes.STRING,
  frequency: DataTypes.STRING,
  startDate: DataTypes.DATEONLY,
  stopDate: DataTypes.DATEONLY,
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Product;
