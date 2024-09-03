const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const groupUserChatting = sequelize.define(
  "group-chatting",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    fromId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    seen: {
      type: DataTypes.JSON,  // Store as JSON, which can represent arrays
      allowNull: true,
  }
  
    
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  groupUserChatting,
};
