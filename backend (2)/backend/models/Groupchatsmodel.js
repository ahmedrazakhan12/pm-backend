const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const groupChatModel = sequelize.define(
    "group_chats",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
  
      creator: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      groupImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      groupName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
     
      time: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      // Additional model options can be defined here
    }
  );
  
  module.exports = {
    groupChatModel,
  };
  