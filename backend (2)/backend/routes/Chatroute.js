const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatcontroller");
const multer = require("../middlewares/Multer");

router.get("/getChat", chatController.GetChats);
router.get("/getChatbarUser/:id", chatController.GetChatBarUsers);
router.post("/createGroup", multer ,chatController.groupChat);
router.get("/getGroups/:id", chatController.getGroups);
router.get("/getChatById/:id", chatController.getGroupsChat);
router.get("/getChattingById/:id", chatController.getChattingById);
router.post("/addGroupMember" ,chatController.addGroupMember);
router.put("/updateGcPfp" ,multer , chatController.updateGcPfp);
router.put("/updateGcName" ,chatController.updateGcName);
router.delete("/deleteGroup/:id" ,chatController.deleteGroup);

// router.post("/verifyToken", );

module.exports = router;
