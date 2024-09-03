const { Sequelize } = require("sequelize");
const sequelize = require("../config/database"); // Adjust the path as necessary

// Import models
const { adminModel } = require("./Adminmodel");
const {projectModel} = require("./Projectmodel");
const {taskModel} = require("./Taskmodel");
const  {projectStatusModel} = require("./Projectstatusmodel");
const {projectUsersModel} = require("./Projectusersmodel");
const {projectTagsModel} = require("./Projecttagsmodel");
const {taskUsersModel} = require('./taskUsersModel');
const {projectFilesModel} = require("./projectfilesmodel");
const  {taskFilesModel} = require("./Taskfilemodel");
const {favoriteProjectModel} = require("./Favprojectmodel");
const {chatModel} = require("./Chatmodel");
const {Meeting} = require("./Meetingmodel");
const {MeetingUser} = require("./Meetingusersmodel");
const {notificationModel} = require("./Notificationmodel");
const {groupUser} = require("./Groupusermodel");
const {groupChatModel} = require("./Groupchatsmodel");
const {groupUserChatting} = require("./Groupchattingmodel");
const {Taskworktime} = require("./Taskworktimemodel");
const {generalModel} = require("./General");
const db = {};

// Initialize models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.adminModel = adminModel;
db.projectModel = projectModel;
db.taskModel = taskModel;
db.projectStatusModel = projectStatusModel;
db.projectUsersModel = projectUsersModel;
db.projectTagsModel = projectTagsModel ;
db.taskUsersModel = taskUsersModel;
db.projectFilesModel = projectFilesModel;
db.taskFilesModel = taskFilesModel;
db.favoriteProjectModel = favoriteProjectModel;
db.chatModel = chatModel;
db.Meeting = Meeting;
db.MeetingUser =MeetingUser;
db.notificationModel = notificationModel;
db.groupChatModel = groupChatModel;
db.groupUser = groupUser;
db.groupUserChatting = groupUserChatting;
db.Taskworktime = Taskworktime;
db.generalModel = generalModel;
// Add other models to db object
// db.userModel = userModel;

module.exports = db;
