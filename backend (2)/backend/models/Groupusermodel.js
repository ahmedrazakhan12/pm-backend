const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const groupUser = sequelize.define(
  "group-users",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
  },
  {
    // Additional model options can be defined here
  }
);

module.exports = {
  groupUser,
};
