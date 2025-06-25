const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  skinType: DataTypes.STRING,
  allergies: DataTypes.STRING,
  dob: DataTypes.STRING,
  gender: DataTypes.STRING,
  conditions: DataTypes.STRING,
});

module.exports = Profile;
