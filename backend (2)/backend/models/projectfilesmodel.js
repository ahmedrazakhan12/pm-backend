const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const projectFilesModel = sequelize.define(
  "project-files",
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
      file: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mimetype: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  projectFilesModel,
};
