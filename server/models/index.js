const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./User'); // Already using sequelize internally
const Profile = require('./Profile');
const Product = require('./Product');
const UsageLog = require('./UsageLog');

// Setup associations
Product.hasMany(UsageLog, { foreignKey: 'productId' });
UsageLog.belongsTo(Product, { foreignKey: 'productId' });

module.exports = { sequelize, User, Profile, Product, UsageLog };
