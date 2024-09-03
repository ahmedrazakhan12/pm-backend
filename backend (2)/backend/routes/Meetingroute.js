// routes/project.js
const express = require("express");
const router = express.Router();
const meetingController = require('../controllers/meetingcontroller');

router.post("/addMeeting", meetingController.addMeeting);
router.get("/getMeeting", meetingController.getMeeting);
router.get("/getMemberMeeting/:id", meetingController.getMemberMeeting);
router.get("/getMeeting/:id", meetingController.getMeetingById);
router.put("/editMeeting/:id", meetingController.EditMeetingById);
router.delete("/deleteMeeting/:id", meetingController.deleteMeeting);
router.get("/searchMeeting/:value", meetingController.searchMeeting);
router.get("/upcommingMeetings", meetingController.upcommingMeetings);
router.get("/upcommingMeetingsofMember/:id", meetingController.upcommingMeetingsofMember);

// router.get("/getAllProject", projectController.getAllProjects);


module.exports = router;

