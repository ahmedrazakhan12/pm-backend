const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const notificationModel = sequelize.define(
  "notifications",
  {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      loggedUser: {
        type: DataTypes.JSON,  // Store as JSON, which can represent arrays
        allowNull: true,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      time: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      route: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      read: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
      
    
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  notificationModel,
};
