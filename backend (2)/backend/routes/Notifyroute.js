const express = require("express");
const router = express.Router();
const notifyController = require('../controllers/notifycontroller');

router.get("/getNotification/:id", notifyController.getNotification);
router.get("/getNotificationAll/:id", notifyController.getNotificationAll);
router.put("/readNotification/:id", notifyController.readNotification);
router.get("/unreadNotification/:id", notifyController.unreadNotification);
router.put("/readAllNotification/:id", notifyController.readAllNotification);

// router.get("/getAllProject", projectController.getAllProjects);


module.exports = router;

