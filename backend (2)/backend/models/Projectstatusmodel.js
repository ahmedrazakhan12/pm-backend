const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const projectStatusModel = sequelize.define(
  "project-status",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preview: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statusName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  projectStatusModel,
};
