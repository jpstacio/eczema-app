const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./User'); // Already using sequelize internally
const Profile = require('./Profile');
const Product = require('./Product');
const UsageLog = require('./UsageLog');
const DietLog = require('./DietLog');
const WellBeingLog = require('./WellBeingLog');

// Setup associations
Product.hasMany(UsageLog, { foreignKey: 'productId' });
UsageLog.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(DietLog, { foreignKey: 'userId' });
DietLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(WellBeingLog, { foreignKey: 'userId' });
WellBeingLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Profile, Product, UsageLog, DietLog, WellBeingLog };
