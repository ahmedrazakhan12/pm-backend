const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MeetingUser = sequelize.define(
  "meeting-users",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    meetingId: {
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
  MeetingUser,
};
