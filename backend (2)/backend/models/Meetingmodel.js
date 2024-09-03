const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Meeting = sequelize.define(
  "meetings",
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
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    date: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    time: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    link: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  Meeting,
};
