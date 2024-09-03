const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const projectTagsModel = sequelize.define(
  "project-tags",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    tagName: {
        type: DataTypes.CHAR,
        allowNull: false,
    },
    tagColor: {
        type: DataTypes.CHAR,
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
  projectTagsModel,
};
