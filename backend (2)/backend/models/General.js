const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const generalModel = sequelize.define(
  "general",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    favicon: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    
    

  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  generalModel,
};
