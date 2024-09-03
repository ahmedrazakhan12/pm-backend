const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const projectModel = sequelize.define(
  "project",
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
    projectName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    projectDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    budget: {
      type: DataTypes.FLOAT, // Change to INTEGER if you prefer whole numbers
      allowNull: true,
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  projectModel,
};
