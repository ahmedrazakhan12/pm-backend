const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const chatModel = sequelize.define(
  "chats",
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
    toId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    text: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    file: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    seen: {
      type: DataTypes.INTEGER,
      allowNull: false,
  },

  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  chatModel,
};
