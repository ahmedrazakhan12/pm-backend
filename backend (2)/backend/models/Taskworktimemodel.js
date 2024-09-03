const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Taskworktime = sequelize.define(
  "task-work-time",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    hour: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    min: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date:{
      type: DataTypes.DATE,
      allowNull: false,
    },
    projectId:{
      type : DataTypes.INTEGER,
      allowNull:false
    }
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  Taskworktime,
};
