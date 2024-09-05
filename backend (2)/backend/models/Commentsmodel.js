const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const taskCommentsModel = sequelize.define(
  "tasks-comments",
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
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    loggedUser: {
        type: DataTypes.JSON,  // Store as JSON, which can represent arrays
        allowNull: true,
    },

    text: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    
    time: {
        type: DataTypes.DATE,
        allowNull: false,
    }, 
    usersIds : {

      type: DataTypes.JSON,  // Change this to JSON
        allowNull: true,
    }

  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  taskCommentsModel,
};
