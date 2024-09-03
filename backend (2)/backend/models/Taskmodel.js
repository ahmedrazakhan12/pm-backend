const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const taskModel = sequelize.define(
  "task",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    taskName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    taskDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    projectName: {
      type: DataTypes.STRING,
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
  taskModel,
};
