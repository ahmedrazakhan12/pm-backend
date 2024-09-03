const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const taskUsersModel = sequelize.define(
  "task-users",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  taskUsersModel,
};
