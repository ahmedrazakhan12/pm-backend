const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const adminModel = sequelize.define(
  "admin",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true, // Ensure emails are unique
      allowNull: false,
    },

    contact: {
      type: DataTypes.BIGINT, // Define contact as STRING to store phone numbers
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pfpImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      // Add length constraint if necessary
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.BIGINT, // Define contact as STRING to store phone numbers
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deleted: {
      type: DataTypes.INTEGER, // Use INTEGER for flag-like values
      allowNull: false,
      defaultValue: 0, // Default value is 0
    },

    

    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Add other attributes as needed
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  adminModel,
};
